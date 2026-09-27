import { db } from '../db/database';
import { PartyType, PaymentRecord, PaymentResult, PaymentType } from '../types';

export interface ChargeParams {
  partyId: string;
  partyName?: string;
  amount: number;
  type: PaymentType;
  referenceId?: string;
  paymentMethod?: string;
  description: string;
}

export interface PayoutParams {
  deliveryPartner?: string;
  amount: number;
  referenceId: string;
  description: string;
}

export interface PaymentService {
  chargeSeeker(params: ChargeParams): Promise<PaymentResult>;
  chargeProvider(params: ChargeParams): Promise<PaymentResult>;
  payDeliveryPartner(params: PayoutParams): Promise<PaymentResult>;
  refundPayment(paymentRecordId: string, reason?: string): Promise<PaymentResult>;
  getPaymentHistory(partyId: string): Promise<PaymentRecord[]>;
}

/**
 * MockPaymentService - Prototype implementation for Hackathon MVP
 * Simulates gateway processing (Razorpay/Stripe) and records simulated payment logs in IndexedDB/localStorage.
 * Easily replaceable with a real RazorpayPaymentService or StripePaymentService by implementing the PaymentService interface.
 */
export class MockPaymentService implements PaymentService {
  async chargeSeeker(params: ChargeParams): Promise<PaymentResult> {
    return this.executeMockTransaction({
      ...params,
      partyType: 'SEEKER',
    });
  }

  async chargeProvider(params: ChargeParams): Promise<PaymentResult> {
    return this.executeMockTransaction({
      ...params,
      partyType: 'PROVIDER',
    });
  }

  async payDeliveryPartner(params: PayoutParams): Promise<PaymentResult> {
    const partnerName = params.deliveryPartner || 'Porter Express Logistics';
    return this.executeMockTransaction({
      partyId: 'porter-logistics-partner',
      partyName: partnerName,
      partyType: 'LOGISTICS_PARTNER',
      amount: params.amount,
      type: 'DELIVERY_PAYOUT',
      referenceId: params.referenceId,
      paymentMethod: 'VenueX Automated Platform Payout',
      description: params.description,
    });
  }

  async refundPayment(paymentRecordId: string, reason = 'Customer cancellation / deposit return'): Promise<PaymentResult> {
    try {
      const records = await db.getPaymentRecords();
      const original = records.find(p => p.id === paymentRecordId || p.referenceId === paymentRecordId);
      
      const refundRecord: PaymentRecord = {
        id: `pay-ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        partyId: original ? original.partyId : 'unknown-party',
        partyName: original ? original.partyName : 'Marketplace User',
        partyType: original ? original.partyType : 'SEEKER',
        type: original ? `${original.type}_REFUND` : 'REFUND',
        amount: original ? original.amount : 0,
        status: 'REFUNDED',
        referenceId: paymentRecordId,
        paymentMethod: original?.paymentMethod || 'Simulated Reversal',
        simulatedTransactionId: `SIM-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        isSimulated: true,
        simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
        description: `Refund issued: ${reason}`,
        createdAt: new Date().toISOString(),
      };

      await db.savePaymentRecord(refundRecord);

      return {
        success: true,
        paymentRecord: refundRecord,
        isSimulated: true,
        simulationNotice: 'PROTOTYPE MODE: Refund simulated successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Refund simulation failed',
        isSimulated: true,
        simulationNotice: 'PROTOTYPE MODE: Simulated refund failed.',
      };
    }
  }

  async getPaymentHistory(partyId: string): Promise<PaymentRecord[]> {
    return db.getPaymentRecordsForParty(partyId);
  }

  private async executeMockTransaction(params: ChargeParams & { partyType: PartyType | 'LOGISTICS_PARTNER' }): Promise<PaymentResult> {
    if (params.amount <= 0 && params.type !== 'DELIVERY_PAYOUT') {
      return {
        success: false,
        error: 'Payment amount must be greater than zero.',
        isSimulated: true,
        simulationNotice: 'PROTOTYPE MODE: Invalid transaction amount.',
      };
    }

    let partyName = params.partyName;
    if (!partyName && (params.partyType === 'SEEKER' || params.partyType === 'PROVIDER')) {
      const biz = await db.getBusinessById(params.partyId);
      if (biz) partyName = biz.name;
    }

    const recordId = `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const simTxnId = `SIM-TXN-${params.type.substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const paymentRecord: PaymentRecord = {
      id: recordId,
      partyId: params.partyId,
      partyName: partyName || 'VenueX User',
      partyType: params.partyType,
      type: params.type,
      amount: params.amount,
      status: 'SUCCESS',
      referenceId: params.referenceId,
      paymentMethod: params.paymentMethod || 'Corporate NetBanking (Mock)',
      simulatedTransactionId: simTxnId,
      isSimulated: true,
      simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
      description: params.description,
      createdAt: new Date().toISOString(),
    };

    await db.savePaymentRecord(paymentRecord);

    return {
      success: true,
      paymentRecord,
      isSimulated: true,
      simulationNotice: 'PROTOTYPE / SIMULATED PAYMENT: No real bank funds were transferred.',
    };
  }
}

// Export singleton instance
export const mockPaymentService = new MockPaymentService();
