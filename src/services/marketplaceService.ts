import { getPlatformConfig } from '../config/platformConfig';
import { db } from '../db/database';
import { BookingRecord, DealRecord, PartyType, SubscriptionRecord } from '../types';
import { mockPaymentService } from './paymentService';
import { mockTokenService } from './tokenService';

export interface FinalizePaymentResult {
  success: boolean;
  booking?: BookingRecord;
  deal?: DealRecord;
  rentPaymentId?: string;
  depositPaymentId?: string;
  serviceFeePaymentId?: string;
  totalPaid?: number;
  serviceFeeAmount?: number;
  simulatedTransactionId?: string;
  error?: string;
  simulationNotice: string;
}

export interface DeliveryRequestResult {
  success: boolean;
  booking?: BookingRecord;
  consumedTokens?: number;
  remainingTokens?: number;
  logisticsPayoutId?: string;
  errorCode?: 'INSUFFICIENT_TOKENS' | 'BOOKING_NOT_FOUND' | 'ALREADY_ARRANGED' | 'FAILED' | 'INVALID_AMOUNT' | 'USER_NOT_FOUND' | 'LOCKED';
  error?: string;
  simulationNotice: string;
}

export const marketplaceService = {
  /**
   * Subscribe a Seeker or Provider to a VenueX Platform Tier
   */
  async subscribeParty(
    partyId: string,
    partyType: PartyType,
    paymentMethod = 'Corporate NetBanking'
  ): Promise<{ success: boolean; subscription?: SubscriptionRecord; error?: string }> {
    const config = getPlatformConfig();
    const biz = await db.getBusinessById(partyId);
    const partyName = biz ? biz.name : 'Marketplace Business';

    const isSeeker = partyType === 'SEEKER';
    const price = isSeeker ? config.seekerSubscriptionPrice : config.providerSubscriptionPrice;
    const planName = isSeeker ? 'VenueX Seeker Pro Pass' : 'VenueX Provider Enterprise Hub';
    const initialTokens = isSeeker ? config.seekerSubscriptionTokensGrant : 0;

    // Charge subscription fee
    const chargeRes = isSeeker
      ? await mockPaymentService.chargeSeeker({
          partyId,
          partyName,
          amount: price,
          type: 'SUBSCRIPTION_FEE',
          paymentMethod,
          description: `Monthly Subscription Fee - ${planName}`,
        })
      : await mockPaymentService.chargeProvider({
          partyId,
          partyName,
          amount: price,
          type: 'SUBSCRIPTION_FEE',
          paymentMethod,
          description: `Monthly Subscription Fee - ${planName}`,
        });

    if (!chargeRes.success || !chargeRes.paymentRecord) {
      return { success: false, error: chargeRes.error || 'Subscription payment failed.' };
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + 1);

    const subscription: SubscriptionRecord = {
      id: `sub-${partyType.toLowerCase()}-${Date.now()}`,
      partyId,
      partyName,
      partyType,
      planName,
      status: 'ACTIVE',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: expiry.toISOString(),
      autoRenew: true,
      initialTokenAllocation: initialTokens,
      pricePaid: price,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await db.saveSubscription(subscription);

    // If seeker, grant initial 125 Delivery Tokens (D.T.)
    if (isSeeker && initialTokens > 0) {
      await mockTokenService.grantSubscriptionTokens(
        partyId,
        initialTokens,
        subscription.id,
        `Granted ${initialTokens} Delivery Tokens (D.T.) for subscribing to ${planName}`
      );
    }

    return { success: true, subscription };
  },

  /**
   * Finalize a deal payment for a Seeker:
   * Rent + Security Deposit + VenueX Service Fee (configurable %)
   */
  async finalizeDealPayment(
    dealId: string,
    seekerId: string,
    paymentMethod = 'Corporate NetBanking (HDFC/ICICI)'
  ): Promise<FinalizePaymentResult> {
    const config = getPlatformConfig();
    const deal = await db.getDealById(dealId);

    if (!deal) {
      return {
        success: false,
        error: 'Deal record not found.',
        simulationNotice: 'PROTOTYPE MODE',
      };
    }

    const seeker = await db.getBusinessById(seekerId);
    const seekerName = seeker ? seeker.name : deal.seekerName;

    // Calculate line items explicitly
    const subtotalRental = deal.subtotalRental;
    const depositAmount = deal.depositAmount;
    const serviceFeePercent = config.seekerServiceFeePercent; // configurable constant
    const serviceFeeAmount = Math.round(subtotalRental * (serviceFeePercent / 100));
    const totalPayable = subtotalRental + depositAmount + serviceFeeAmount;

    // Line Item 1: RENT
    const rentRes = await mockPaymentService.chargeSeeker({
      partyId: seekerId,
      partyName: seekerName,
      amount: subtotalRental,
      type: 'RENT',
      referenceId: deal.id,
      paymentMethod,
      description: `Rental payment for ${deal.quantity}x ${deal.resourceName} (${deal.rentalDays} days)`,
    });

    // Line Item 2: DEPOSIT
    const depositRes = await mockPaymentService.chargeSeeker({
      partyId: seekerId,
      partyName: seekerName,
      amount: depositAmount,
      type: 'DEPOSIT',
      referenceId: deal.id,
      paymentMethod,
      description: `Refundable Security Deposit (${deal.depositPercent}%)`,
    });

    // Line Item 3: SERVICE_FEE (VenueX Marketplace Fee)
    const feeRes = await mockPaymentService.chargeSeeker({
      partyId: seekerId,
      partyName: seekerName,
      amount: serviceFeeAmount,
      type: 'SERVICE_FEE',
      referenceId: deal.id,
      paymentMethod,
      description: `VenueX Marketplace Service Fee (${serviceFeePercent}%)`,
    });

    if (!rentRes.success || !depositRes.success || !feeRes.success) {
      return {
        success: false,
        error: 'One or more payment line items failed.',
        simulationNotice: 'PROTOTYPE / SIMULATED PAYMENT',
      };
    }

    // Update deal status to CONFIRMED
    deal.status = 'CONFIRMED';
    deal.finalizedAt = new Date().toISOString();
    await db.saveDeal(deal);

    // Create Booking Record with Porter Delivery pre-initialized if delivery was selected
    const mainSimTxnId = rentRes.paymentRecord?.simulatedTransactionId || `SIM-TXN-${Date.now()}`;

    const newBooking: BookingRecord = {
      id: `book-${Date.now()}`,
      dealId: deal.id,
      requestId: deal.requestId,
      seekerId: deal.seekerId,
      seekerName: deal.seekerName,
      providerId: deal.providerId,
      providerName: deal.providerName,
      resourceId: deal.resourceId,
      resourceName: deal.resourceName,
      resourceImage: deal.resourceImage,
      quantity: deal.quantity,
      startDate: deal.startDate,
      endDate: deal.endDate,
      rentalDays: deal.rentalDays,
      subtotalRental: deal.subtotalRental,
      deliveryFee: deal.deliveryFee,
      depositAmount: deal.depositAmount,
      totalPaid: totalPayable,
      paymentStatus: 'SUCCESS',
      simulatedTransactionId: mainSimTxnId,
      paymentMethod: paymentMethod as any,
      paidAt: new Date().toISOString(),
      bookingStatus: 'CONFIRMED',
      deliveryStatus: 'PENDING',
      deliveryTracking: {
        partner: 'Porter',
        trackingNumber: `PRT-${Math.floor(100000 + Math.random() * 900000)}`,
        driverName: 'Ramesh Kumar (Porter Heavy Fleet)',
        driverPhone: '+91 98200 11223',
        vehicleNumber: 'MH 43 CC 8812 (Tata 407 Heavy Commercial)',
        currentStepIndex: 0,
        timeline: [
          {
            status: 'PENDING',
            title: 'Order Confirmed & Payment Received',
            description: `Paid Rent ₹${subtotalRental.toLocaleString()} + Deposit ₹${depositAmount.toLocaleString()} + Service Fee ₹${serviceFeeAmount.toLocaleString()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completed: true,
          },
          {
            status: 'ASSIGNED',
            title: 'Porter Logistics Partner Assigned',
            description: 'Driver Ramesh Kumar assigned to pickup location.',
            timestamp: 'Pending delivery request',
            completed: false,
          },
          {
            status: 'PICKED_UP',
            title: 'Resource Inspection & Dispatch',
            description: 'Asset condition verification and loading complete.',
            timestamp: 'Pending',
            completed: false,
          },
          {
            status: 'IN_TRANSIT',
            title: 'En Route to Destination',
            description: 'Vehicle in transit.',
            timestamp: 'Pending',
            completed: false,
          },
          {
            status: 'DELIVERED',
            title: 'Site Handover & Acceptance',
            description: 'Verified count sign-off by recipient.',
            timestamp: 'Pending',
            completed: false,
          },
        ],
      },
      createdAt: new Date().toISOString(),
    };

    await db.saveBooking(newBooking);

    return {
      success: true,
      booking: newBooking,
      deal,
      rentPaymentId: rentRes.paymentRecord?.id,
      depositPaymentId: depositRes.paymentRecord?.id,
      serviceFeePaymentId: feeRes.paymentRecord?.id,
      totalPaid: totalPayable,
      serviceFeeAmount,
      simulatedTransactionId: mainSimTxnId,
      simulationNotice: 'PROTOTYPE / SIMULATED PAYMENT: All charges were simulated successfully.',
    };
  },

  /**
   * Request Porter delivery for a booking:
   * 1. Checks Seeker D.T. balance. If insufficient, BLOCKS request & triggers error code 'INSUFFICIENT_TOKENS'.
   * 2. Consumes 1 D.T. from Seeker balance.
   * 3. VenueX pays Porter delivery partner via PaymentService abstraction.
   * 4. Updates booking delivery status to ASSIGNED.
   */
  async requestDelivery(bookingId: string, seekerId: string): Promise<DeliveryRequestResult> {
    const booking = await db.getBookingById(bookingId);
    if (!booking) {
      return {
        success: false,
        errorCode: 'BOOKING_NOT_FOUND',
        error: 'Booking not found.',
        simulationNotice: 'PROTOTYPE MODE',
      };
    }

    const resource = await db.getResourceById(booking.resourceId);
    const distanceKm = resource ? (resource.distanceKm || 0) : 0;
    const tokenCost = Math.max(1, Math.ceil(distanceKm * 10)); // 1 DT per 100m


    if (booking.deliveryStatus !== 'PENDING' && booking.deliveryStatus !== 'NOT_REQUIRED') {
      return {
        success: false,
        errorCode: 'ALREADY_ARRANGED',
        error: `Delivery has already been requested or processed (Current status: ${booking.deliveryStatus}).`,
        simulationNotice: 'PROTOTYPE MODE',
      };
    }

    // Step 1: Attempt to consume Delivery Tokens (D.T.)
    const tokenRes = await mockTokenService.consumeTokens(
      seekerId,
      tokenCost,
      bookingId,
      `Delivery request token consumption for booking #${bookingId}`
    );

    if (!tokenRes.success) {
      return {
        success: false,
        errorCode: tokenRes.errorCode || 'INSUFFICIENT_TOKENS',
        remainingTokens: tokenRes.currentBalance,
        error: tokenRes.error || 'Insufficient Delivery Tokens. Please purchase Extra D.T.',
        simulationNotice: 'PROTOTYPE MODE: Delivery request blocked due to zero/insufficient token balance.',
      };
    }

    // Step 2: VenueX pays Porter delivery partner via PaymentService abstraction
    const payoutAmount = booking.deliveryFee > 0 ? booking.deliveryFee : 800; // default ₹800 if flat fee not specified
    const payoutRes = await mockPaymentService.payDeliveryPartner({
      deliveryPartner: 'Porter Express Logistics',
      amount: payoutAmount,
      referenceId: bookingId,
      description: `VenueX logistics settlement to Porter driver ${booking.deliveryTracking.driverName} for booking #${bookingId}`,
    });

    // Step 3: Update booking tracking state
    booking.deliveryStatus = 'ASSIGNED';
    booking.deliveryTracking.currentStepIndex = 1;
    booking.deliveryTracking.timeline[1].completed = true;
    booking.deliveryTracking.timeline[1].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await db.saveBooking(booking);

    return {
      success: true,
      booking,
      consumedTokens: tokenCost,
      remainingTokens: tokenRes.currentBalance,
      logisticsPayoutId: payoutRes.paymentRecord?.id,
      simulationNotice: `PROTOTYPE MODE: ${tokenCost} D.T. deducted and Porter logistics payout simulated.`,
    };
  },

  /**
   * Purchase Extra Delivery Tokens (D.T.)
   */
  async purchaseExtraDT(seekerId: string, packId: string, paymentMethod = 'Corporate NetBanking') {
    return mockTokenService.purchaseExtraTokens(seekerId, packId, paymentMethod);
  },

  /**
   * Cancel booking and issue deposit refund + token refund if delivery was unfulfilled
   */
  async cancelBookingAndRefund(bookingId: string, seekerId: string, reason = 'Customer request cancellation') {
    const booking = await db.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    // Issue deposit refund
    let depositRefundRes;
    if (booking.depositAmount > 0) {
      depositRefundRes = await mockPaymentService.refundPayment(
        booking.id,
        `Deposit return for cancelled booking #${bookingId}: ${reason}`
      );
    }

    // Refund D.T. token if consumed & delivery was pending
    let tokenRefundRes;
    if (booking.deliveryStatus === 'ASSIGNED' || booking.deliveryStatus === 'PENDING') {
      const resource = await db.getResourceById(booking.resourceId);
      const distanceKm = resource ? (resource.distanceKm || 0) : 0;
      const tokenCost = Math.max(1, Math.ceil(distanceKm * 10));
      
      tokenRefundRes = await mockTokenService.refundTokens(
        seekerId,
        tokenCost,
        bookingId,
        `Refund ${tokenCost} D.T. for cancelled booking #${bookingId}`
      );
    }

    booking.bookingStatus = 'CANCELLED';
    booking.deliveryStatus = 'FAILED';
    await db.saveBooking(booking);

    return {
      success: true,
      booking,
      depositRefund: depositRefundRes,
      tokenRefund: tokenRefundRes,
    };
  }
};
