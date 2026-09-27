import React, { useState, useEffect } from 'react';
import { db, subscribeToDatabase } from '../db/database';
import { marketplaceService } from '../services/marketplaceService';
import { mockTokenService } from '../services/tokenService';
import { BookingRecord, DeliveryStatus } from '../types';
import { BuyExtraDTModal } from './BuyExtraDTModal';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Phone, 
  ArrowRight,
  Star,
  Coins,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  bookingId: string;
  onClose: () => void;
  onOpenReview?: (bookingId: string) => void;
}

const STATUS_FLOW: DeliveryStatus[] = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
];

export const DeliveryTrackingModal: React.FC<DeliveryTrackingModalProps> = ({
  isOpen,
  bookingId,
  onClose,
  onOpenReview,
}) => {
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [dtBalance, setDtBalance] = useState<number>(0);
  const [buyExtraModalOpen, setBuyExtraModalOpen] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [tokenCost, setTokenCost] = useState<number>(1);

  const loadData = async () => {
    if (!bookingId) return;
    const b = await db.getBookingById(bookingId);
    if (b) {
      setBooking(b);
      const bal = await mockTokenService.getBalance(b.seekerId);
      setDtBalance(bal);
      
      const resource = await db.getResourceById(b.resourceId);
      const distanceKm = resource ? (resource.distanceKm || 0) : 0;
      setTokenCost(Math.max(1, Math.ceil(distanceKm * 10)));
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    const unsub = subscribeToDatabase(() => {
      if (isOpen) loadData();
    });
    return () => unsub();
  }, [isOpen, bookingId]);

  if (!isOpen || !booking) return null;

  const currentStep = STATUS_FLOW.indexOf(booking.deliveryStatus);

  // Request Porter Delivery (Consumes 1 D.T. from Seeker balance & triggers Porter payout)
  const handleRequestDeliveryWithToken = async () => {
    setIsRequesting(true);
    setRequestError(null);

    try {
      const res = await marketplaceService.requestDelivery(booking.id, booking.seekerId);

      if (res.success && res.booking) {
        setBooking(res.booking);
        setDtBalance(res.remainingTokens ?? 0);
      } else if (res.errorCode === 'INSUFFICIENT_TOKENS') {
        setRequestError(res.error || 'Insufficient Delivery Tokens. Please top up Extra D.T.');
        setBuyExtraModalOpen(true);
      } else {
        setRequestError(res.error || 'Delivery request failed.');
      }
    } catch (err: any) {
      setRequestError(err.message || 'An unexpected error occurred during delivery request.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Allow reviewer to advance the simulated delivery step
  const handleAdvanceStep = async () => {
    const nextIndex = currentStep + 1;
    if (nextIndex < STATUS_FLOW.length) {
      const nextStatus = STATUS_FLOW[nextIndex];
      const updatedTimeline = booking.deliveryTracking.timeline.map((step, idx) => {
        if (idx <= nextIndex) {
          return {
            ...step,
            completed: true,
            timestamp: step.timestamp.includes('Pending') ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : step.timestamp,
          };
        }
        return step;
      });

      const updatedBooking: BookingRecord = {
        ...booking,
        deliveryStatus: nextStatus,
        bookingStatus: nextStatus === 'DELIVERED' ? 'COMPLETED' : 'IN_PROGRESS',
        deliveryTracking: {
          ...booking.deliveryTracking,
          currentStepIndex: nextIndex,
          timeline: updatedTimeline,
        },
      };

      await db.saveBooking(updatedBooking);
      setBooking(updatedBooking);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1220]/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prototype Integration Banner */}
          <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-semibold mb-4 border border-gray-200">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Powered by Porter Logistics Abstraction</span>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
              PROTOTYPE
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Logistics & Dispatch Tracking
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Waybill #{booking.deliveryTracking.trackingNumber} · {booking.quantity}x {booking.resourceName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Status</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block mt-0.5">
                {booking.deliveryStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Delivery Token Info Strip */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>
                Delivery Token (D.T.) Balance: <strong className="text-gray-900 font-bold">{dtBalance} D.T.</strong>
              </span>
            </div>
            <button
              onClick={() => setBuyExtraModalOpen(true)}
              className="text-amber-900 font-bold underline hover:text-amber-950 text-xs"
            >
              + Buy Extra D.T.
            </button>
          </div>

          {/* Insufficient Token Alert */}
          {requestError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl mb-4 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 flex justify-between items-center">
                <span>{requestError}</span>
                <button
                  onClick={() => setBuyExtraModalOpen(true)}
                  className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-all text-xs shrink-0 ml-2"
                >
                  Buy Extra D.T.
                </button>
              </div>
            </div>
          )}

          {/* Driver & Courier Card */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-900 font-bold text-base shadow-xs">
                <Truck className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{booking.deliveryTracking.driverName}</p>
                <p className="text-[11px] text-gray-500 font-mono">{booking.deliveryTracking.vehicleNumber}</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Commercial Transit Insured</p>
              </div>
            </div>

            <a
              href={`tel:${booking.deliveryTracking.driverPhone}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`Simulated call to Porter driver: ${booking.deliveryTracking.driverPhone}`);
              }}
              className="p-2.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">Call Driver</span>
            </a>
          </div>

          {/* 5-Step Visual Logistics Flow */}
          <div className="space-y-4 mb-6 relative">
            <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-slate-200"></div>

            {booking.deliveryTracking.timeline.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors z-10 ${
                      isCompleted
                        ? 'bg-[#0B1220] text-white ring-4 ring-slate-100'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                  </div>

                  <div className={`flex-1 p-3 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-amber-900' : 'text-gray-900'}`}>
                        {step.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">{step.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            {booking.deliveryStatus === 'PENDING' ? (
              <button
                onClick={handleRequestDeliveryWithToken}
                disabled={isRequesting}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isRequesting ? (
                  <span>Checking {tokenCost} D.T. & Requesting Porter...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Request Porter Delivery (Deduct {tokenCost} D.T.)</span>
                  </>
                )}
              </button>
            ) : currentStep < STATUS_FLOW.length - 1 ? (
              <button
                onClick={handleAdvanceStep}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#0B1220] hover:bg-[#111827] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Simulate Advance Step ({STATUS_FLOW[currentStep + 1]})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            ) : (
              <div className="w-full flex flex-col sm:flex-row gap-2 items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Delivery Complete! Equipment in use.</span>
                </span>

                {onOpenReview && (
                  <button
                    onClick={() => {
                      onOpenReview(booking.id);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                    <span>Leave Peer Rating & Review</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      <BuyExtraDTModal
        isOpen={buyExtraModalOpen}
        onClose={() => setBuyExtraModalOpen(false)}
        seekerId={booking.seekerId}
        currentBalance={dtBalance}
        onSuccess={(newBal) => {
          setDtBalance(newBal);
          setRequestError(null);
        }}
      />
    </>
  );
};
