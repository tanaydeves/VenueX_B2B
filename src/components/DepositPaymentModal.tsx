import React, { useState, useEffect } from 'react';
import { db } from '../db/database';
import { getPlatformConfig } from '../config/platformConfig';
import { marketplaceService, FinalizePaymentResult } from '../services/marketplaceService';
import { BookingRecord, DealRecord } from '../types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Building, 
  Smartphone, 
  Truck, 
  Lock, 
  AlertCircle,
  Coins
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
  const config = getPlatformConfig();
  const [deal, setDeal] = useState<DealRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('Corporate NetBanking (HDFC/ICICI)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [result, setResult] = useState<FinalizePaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dealId && isOpen) {
      db.getDealById(dealId).then(d => {
        setDeal(d);
        setPaymentComplete(false);
        setResult(null);
        setErrorMessage(null);
      });
    }
  }, [dealId, isOpen]);

  if (!isOpen || !deal) return null;

  const subtotalRental = deal.subtotalRental;
  const depositAmount = deal.depositAmount;
  const serviceFeePercent = config.seekerServiceFeePercent;
  const serviceFeeAmount = Math.round(subtotalRental * (serviceFeePercent / 100));
  const totalPayable = subtotalRental + depositAmount + serviceFeeAmount;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await marketplaceService.finalizeDealPayment(deal.id, deal.seekerId, paymentMethod);

      if (res.success && res.booking) {
        setResult(res);
        setPaymentComplete(true);
      } else {
        setErrorMessage(res.error || 'Simulated payment processing failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1220]/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!paymentComplete ? (
          <div className="space-y-5">
            
            {/* Prototype Payment Warning Banner */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2.5 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <span className="uppercase tracking-wider">Prototype / Simulated Payment</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">MVP</span>
                </div>
                <span className="text-amber-700">
                  No real bank funds charged. Simulates line-item ledger records (Rent + Deposit + VenueX Fee).
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Finalize Deal & Authorize Payment</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Locking reservation for {deal.quantity}x {deal.resourceName}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            {/* Itemized Line Item Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Rental Period</span>
                <span className="font-semibold text-gray-900">{deal.startDate} to {deal.endDate} ({deal.rentalDays} days)</span>
              </div>
              
              <div className="flex justify-between text-gray-700 pt-1 border-t border-gray-200/60">
                <span>1. Rental Subtotal ({deal.quantity} units @ ₹{deal.rentalPricePerUnit}/day)</span>
                <span className="font-mono font-semibold text-gray-900">₹{subtotalRental.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-emerald-800 font-medium">
                <span>2. Refundable Security Deposit ({deal.depositPercent}%)</span>
                <span className="font-mono font-bold">₹{depositAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-indigo-900 font-medium">
                <span>3. VenueX Platform Service Fee ({serviceFeePercent}%)</span>
                <span className="font-mono font-bold">₹{serviceFeeAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2.5 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
                <span>Total Payable Amount</span>
                <span className="text-emerald-700 font-mono">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Delivery Token Info Notice */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Delivery Request consumes <strong>1 Delivery Token (D.T.)</strong></span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                D.T. System
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Simulated Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI Corporate (GPay/PhonePe)')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod.includes('UPI')
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">UPI App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Corporate NetBanking (HDFC/ICICI)')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod.includes('NetBanking')
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Business Credit Card')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod.includes('Credit Card')
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">Corporate Card</span>
                </button>
              </div>
            </div>

            {/* Escrow note */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Security Deposit held in simulated escrow & auto-released upon clean return inspection.
              </span>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#0B1220] hover:bg-[#111827] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Simulated Line Items...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Authorize Simulated Payment of ₹{totalPayable.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success & Confirmation State */
          <div className="text-center py-4 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment Confirmed & Booking Created</h2>
              <div className="inline-block text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded mt-1">
                PROTOTYPE / SIMULATED PAYMENT SUCCESSFUL
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Simulated Ref ID:</span>
                <span className="font-bold text-gray-900 font-mono">{result?.simulatedTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-bold text-gray-900 font-mono">₹{result?.totalPaid?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">VenueX Service Fee (5%):</span>
                <span className="font-semibold text-gray-700 font-mono">₹{result?.serviceFeeAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Reference:</span>
                <span className="font-bold text-emerald-700 font-mono">{result?.booking?.id}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              {result?.booking && (
                <button
                  onClick={() => {
                    onSuccess(result.booking!.id);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  <span>Manage / Request Porter Delivery</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="py-3 px-4 bg-gray-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
