import { getPlatformConfig } from '../config/platformConfig';
import { db } from '../db/database';
import { DeliveryTokenLedgerEntry, TokenResult } from '../types';
import { mockPaymentService } from './paymentService';

export interface TokenService {
  grantSubscriptionTokens(seekerId: string, amount: number, referenceId: string, notes?: string): Promise<TokenResult>;
  consumeTokens(seekerId: string, amount: number, referenceId: string, notes?: string): Promise<TokenResult>;
  purchaseExtraTokens(seekerId: string, packId: string, paymentMethod?: string): Promise<TokenResult>;
  getBalance(seekerId: string): Promise<number>;
  getLedgerHistory(seekerId: string): Promise<DeliveryTokenLedgerEntry[]>;
  refundTokens(seekerId: string, amount: number, referenceId: string, reason?: string): Promise<TokenResult>;
}

// In-memory mutex/lock state to prevent concurrent double-spending in the frontend/simulated environment
const activeLocks = new Map<string, boolean>();

async function acquireLock(key: string): Promise<boolean> {
  let attempts = 0;
  while (activeLocks.get(key) && attempts < 20) {
    await new Promise(res => setTimeout(res, 50));
    attempts++;
  }
  if (activeLocks.get(key)) return false;
  activeLocks.set(key, true);
  return true;
}

function releaseLock(key: string): void {
  activeLocks.delete(key);
}

/**
 * MockTokenService - Implements Delivery Token (D.T.) management for VenueX Seekers.
 * Guarantees atomic balance computation, double-spend prevention, and explicit error codes for zero/insufficient balances.
 */
export class MockTokenService implements TokenService {
  async getBalance(seekerId: string): Promise<number> {
    const history = await db.getTokenLedgerForSeeker(seekerId);
    if (history.length === 0) {
      // If seeker has active subscription, check initial allocation
      const sub = await db.getSubscriptionByParty(seekerId);
      if (sub && sub.partyType === 'SEEKER' && sub.status === 'ACTIVE') {
        return sub.initialTokenAllocation;
      }
      return 0;
    }
    // Return latest balanceAfter from ledger history (sorted descending by createdAt)
    return history[0].balanceAfter;
  }

  async getLedgerHistory(seekerId: string): Promise<DeliveryTokenLedgerEntry[]> {
    return db.getTokenLedgerForSeeker(seekerId);
  }

  async grantSubscriptionTokens(
    seekerId: string,
    amount: number,
    referenceId: string,
    notes = 'Subscription allocation grant'
  ): Promise<TokenResult> {
    const lockAcquired = await acquireLock(seekerId);
    if (!lockAcquired) {
      return {
        success: false,
        currentBalance: await this.getBalance(seekerId),
        errorCode: 'LOCKED',
        error: 'System busy processing another token transaction. Please try again.',
        isSimulated: true,
      };
    }

    try {
      const currentBal = await this.getBalance(seekerId);
      const newBal = currentBal + Math.max(0, amount);

      const entry: DeliveryTokenLedgerEntry = {
        id: `tl-grant-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        seekerId,
        type: 'GRANT',
        amount: Math.abs(amount),
        balanceAfter: newBal,
        referenceId,
        notes,
        isSimulated: true,
        createdAt: new Date().toISOString(),
      };

      await db.saveTokenLedgerEntry(entry);

      return {
        success: true,
        entry,
        currentBalance: newBal,
        isSimulated: true,
      };
    } finally {
      releaseLock(seekerId);
    }
  }

  async consumeTokens(
    seekerId: string,
    amount: number,
    referenceId: string,
    notes = 'Delivery token consumption'
  ): Promise<TokenResult> {
    const requiredAmount = Math.abs(amount);
    const lockAcquired = await acquireLock(seekerId);

    if (!lockAcquired) {
      return {
        success: false,
        currentBalance: await this.getBalance(seekerId),
        errorCode: 'LOCKED',
        error: 'Concurrent token transaction detected. Lock acquisition failed.',
        isSimulated: true,
      };
    }

    try {
      const currentBal = await this.getBalance(seekerId);

      // Edge case: check zero or insufficient token balance
      if (currentBal < requiredAmount) {
        return {
          success: false,
          currentBalance: currentBal,
          errorCode: 'INSUFFICIENT_TOKENS',
          error: `Insufficient Delivery Tokens (D.T.). You have ${currentBal} D.T. available, but ${requiredAmount} D.T. is required for this delivery. Please purchase Extra D.T. to continue.`,
          isSimulated: true,
        };
      }

      const newBal = currentBal - requiredAmount;

      const entry: DeliveryTokenLedgerEntry = {
        id: `tl-consume-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        seekerId,
        type: 'CONSUME',
        amount: -requiredAmount,
        balanceAfter: newBal,
        referenceId,
        notes,
        isSimulated: true,
        createdAt: new Date().toISOString(),
      };

      await db.saveTokenLedgerEntry(entry);

      return {
        success: true,
        entry,
        currentBalance: newBal,
        isSimulated: true,
      };
    } finally {
      releaseLock(seekerId);
    }
  }

  async purchaseExtraTokens(seekerId: string, packId: string, paymentMethod = 'Corporate NetBanking'): Promise<TokenResult> {
    const config = getPlatformConfig();
    const pack = config.extraTokenPacks.find(p => p.id === packId) || config.extraTokenPacks[0];

    if (!pack) {
      return {
        success: false,
        currentBalance: await this.getBalance(seekerId),
        errorCode: 'INVALID_AMOUNT',
        error: 'Invalid Extra D.T. pack selected.',
        isSimulated: true,
      };
    }

    // Step 1: Charge Seeker for Extra D.T. pack via PaymentService
    const paymentRes = await mockPaymentService.chargeSeeker({
      partyId: seekerId,
      amount: pack.price,
      type: 'EXTRA_DT_PURCHASE',
      referenceId: pack.id,
      paymentMethod,
      description: `Purchase Extra Delivery Tokens (${pack.tokenAmount} D.T. - ${pack.name})`,
    });

    if (!paymentRes.success || !paymentRes.paymentRecord) {
      return {
        success: false,
        currentBalance: await this.getBalance(seekerId),
        errorCode: 'INVALID_AMOUNT',
        error: paymentRes.error || 'Payment for Extra D.T. failed.',
        isSimulated: true,
      };
    }

    // Step 2: Top up D.T. balance
    const lockAcquired = await acquireLock(seekerId);
    if (!lockAcquired) {
      return {
        success: false,
        currentBalance: await this.getBalance(seekerId),
        errorCode: 'LOCKED',
        error: 'Transaction lock busy.',
        isSimulated: true,
      };
    }

    try {
      const currentBal = await this.getBalance(seekerId);
      const newBal = currentBal + pack.tokenAmount;

      const entry: DeliveryTokenLedgerEntry = {
        id: `tl-extra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        seekerId,
        type: 'EXTRA_PURCHASE',
        amount: pack.tokenAmount,
        balanceAfter: newBal,
        referenceId: paymentRes.paymentRecord.id,
        notes: `Extra D.T. Top-Up: ${pack.tokenAmount} D.T. purchased for ₹${pack.price.toLocaleString('en-IN')}`,
        isSimulated: true,
        createdAt: new Date().toISOString(),
      };

      await db.saveTokenLedgerEntry(entry);

      return {
        success: true,
        entry,
        currentBalance: newBal,
        isSimulated: true,
      };
    } finally {
      releaseLock(seekerId);
    }
  }

  async refundTokens(seekerId: string, amount: number, referenceId: string, reason = 'Order cancellation refund'): Promise<TokenResult> {
    const lockAcquired = await acquireLock(seekerId);
    if (!lockAcquired) {
      return {
        success: false,
        currentBalance: await this.getBalance(seekerId),
        errorCode: 'LOCKED',
        error: 'Lock acquisition timeout.',
        isSimulated: true,
      };
    }

    try {
      const currentBal = await this.getBalance(seekerId);
      const refundAmount = Math.abs(amount);
      const newBal = currentBal + refundAmount;

      const entry: DeliveryTokenLedgerEntry = {
        id: `tl-refund-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        seekerId,
        type: 'REFUND',
        amount: refundAmount,
        balanceAfter: newBal,
        referenceId,
        notes: `Token Refund: ${reason}`,
        isSimulated: true,
        createdAt: new Date().toISOString(),
      };

      await db.saveTokenLedgerEntry(entry);

      return {
        success: true,
        entry,
        currentBalance: newBal,
        isSimulated: true,
      };
    } finally {
      releaseLock(seekerId);
    }
  }
}

// Export singleton instance
export const mockTokenService = new MockTokenService();
