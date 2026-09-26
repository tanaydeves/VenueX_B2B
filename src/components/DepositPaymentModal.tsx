import React, { useState, useEffect } from 'react';
import { db } from '../db/database';
import { BookingRecord, DealRecord, DeliveryStatus, PaymentStatus } from '../types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  IndianRupee, 
  CreditCard, 
  Building, 
  Smartphone, 
  Truck, 
  Lock, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface DepositPaymentModalProps {
  isOpen: boolean;
  dealId: string;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const DepositPaymentModal: React.FC<DepositPaymentModalProps> = ({
  isOpen,
  dealId,
  onClose,
  onSuccess,
}) => {
  const [deal, setDeal] = useState<DealRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI (GPay/PhonePe)' | 'Corporate NetBanking (HDFC/ICICI)' | 'Business Credit Card'>('UPI (GPay/PhonePe)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    if (dealId) {
      db.getDealById(dealId).then(d => {
        setDeal(d);
        setPaymentComplete(false);
      });
    }
  }, [dealId, isOpen]);

  if (!isOpen || !deal) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    // Simulate network delay
    setTimeout(async () => {
      const txId = `SIM-TXN-${Date.now().toString().slice(-6)}`;

      // 1. Create Confirmed Booking record
      const newBooking: BookingRecord = {
        id: `book-${Date.now().toString().slice(-4)}`,
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
        totalPaid: deal.totalAmount,
        paymentStatus: 'SUCCESS',
        simulatedTransactionId: txId,
        paymentMethod,
        paidAt: new Date().toISOString(),
        bookingStatus: 'CONFIRMED',
        deliveryStatus: deal.deliveryFee > 0 ? 'PENDING' : 'NOT_REQUIRED',
        deliveryTracking: {
          partner: 'Porter',
          trackingNumber: `PRTR-MUM-${Math.floor(10000 + Math.random() * 90000)}`,
          driverName: 'Suresh Patil',
          driverPhone: '+91 98234 11299',
          vehicleNumber: 'MH-46-BM-7712 (Tata 407 14ft)',
          currentStepIndex: 0,
          timeline: [
            {
              status: 'PENDING',
              title: 'Dispatch Requested',
              description: `Dock pickup requested from ${deal.providerName}. Loading bay confirmed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              completed: true,
            },
            {
              status: 'ASSIGNED',
              title: 'Porter Vehicle Assigned',
              description: 'Porter captain Suresh Patil allocated with Tata 407 (MH-46-BM-7712).',
              timestamp: 'Pending dispatch',
              completed: false,
            },
            {
              status: 'PICKED_UP',
              title: 'Loaded at Provider Dock',
              description: `${deal.quantity} units loaded with protective padding & inspected.`,
              timestamp: 'Pending dispatch',
              completed: false,
            },
            {
              status: 'IN_TRANSIT',
              title: 'In Transit to Destination',
              description: 'Real-time GPS transit tracking active across Navi Mumbai corridor.',
              timestamp: 'Pending dispatch',
              completed: false,
            },
            {
              status: 'DELIVERED',
              title: 'Delivered & Handover Signed',
              description: 'Items delivered to seeker loading dock. Deposit held in escrow.',
              timestamp: 'Pending dispatch',
              completed: false,
            },
          ],
        },
        createdAt: new Date().toISOString(),
      };

      await db.saveBooking(newBooking);

      // 2. Update Deal Record to CONFIRMED
      await db.saveDeal({
        ...deal,
        status: 'CONFIRMED',
      });

      // 3. Update Request Record to ACCEPTED
      const req = await db.getRequestById(deal.requestId);
      if (req) {
        await db.saveRequest({
          ...req,
          status: 'ACCEPTED',
        });
      }

      setCreatedBooking(newBooking);
      setIsProcessing(false);
      setPaymentComplete(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8E6DF] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64748B] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!paymentComplete ? (
          <div className="space-y-5">
            
            {/* Clear Simulated Payment Prototype Notice */}
            <div className="p-3 bg-[#FEF7EE] rounded-2xl border border-[#A15325]/30 flex items-center gap-2.5 text-[#A15325]">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold">Simulated Payment — Prototype</strong>
                <span>No real money will be charged. This simulates escrow holding and lock of inventory.</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Confirm Rental & Security Deposit</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Locking reservation for {deal.quantity}x {deal.resourceName}
              </p>
            </div>

            {/* Structured Itemized Breakdown */}
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6DF] space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Rental Duration</span>
                <span className="font-semibold text-[#1E293B]">{deal.startDate} to {deal.endDate} ({deal.rentalDays} days)</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Rental Subtotal ({deal.quantity} units @ ₹{deal.rentalPricePerUnit}/day)</span>
                <span className="font-mono text-[#1E293B]">₹{deal.subtotalRental.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Porter Delivery & Dispatch Fee</span>
                <span className="font-mono text-[#1E293B]">₹{deal.deliveryFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#2A6D58] font-semibold">
                <span>Refundable Security Deposit ({deal.depositPercent}%)</span>
                <span className="font-mono">₹{deal.depositAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-[#E8E6DF] flex justify-between text-base font-bold text-[#1E293B]">
                <span>Total Amount to Pay</span>
                <span className="text-[#0F766E] font-mono">₹{deal.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-2">
                Simulated Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI (GPay/PhonePe)')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'UPI (GPay/PhonePe)'
                      ? 'bg-[#E6F4F1] border-[#0F766E] text-[#0F766E] font-bold'
                      : 'bg-[#FAF9F6] border-[#E8E6DF] text-[#64748B]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-[#0F766E]" />
                  <span className="text-[11px] block">UPI App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Corporate NetBanking (HDFC/ICICI)')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'Corporate NetBanking (HDFC/ICICI)'
                      ? 'bg-[#E6F4F1] border-[#0F766E] text-[#0F766E] font-bold'
                      : 'bg-[#FAF9F6] border-[#E8E6DF] text-[#64748B]'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-[#0F766E]" />
                  <span className="text-[11px] block">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Business Credit Card')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'Business Credit Card'
                      ? 'bg-[#E6F4F1] border-[#0F766E] text-[#0F766E] font-bold'
                      : 'bg-[#FAF9F6] border-[#E8E6DF] text-[#64748B]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#0F766E]" />
                  <span className="text-[11px] block">Corporate Card</span>
                </button>
              </div>
            </div>

            {/* Escrow note */}
            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
              <Lock className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              <span>
                Deposit is held in simulated escrow and released automatically upon clean inspection.
              </span>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3 bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Simulating Escrow Lock...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Simulated Payment of ₹{deal.totalAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success & Confirmation State */
          <div className="text-center py-4 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#EBF6F2] text-[#2A6D58] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Payment Confirmed & Inventory Locked</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Simulated Transaction ID: <strong className="font-mono text-[#1E293B]">{createdBooking?.simulatedTransactionId}</strong>
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Booking Reference:</span>
                <span className="font-bold text-[#1E293B] font-mono">{createdBooking?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Locked Units:</span>
                <span className="font-bold text-[#0F766E]">{deal.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Porter Delivery:</span>
                <span className="font-bold text-[#1E293B]">{createdBooking?.deliveryTracking.trackingNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              {createdBooking && (
                <button
                  onClick={() => {
                    onSuccess(createdBooking.id);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Porter Delivery</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-white hover:bg-[#FAF9F6] border border-[#E8E6DF] text-[#1E293B] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
