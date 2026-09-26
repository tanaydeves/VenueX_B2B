import React, { useState, useEffect } from 'react';
import { db, subscribeToDatabase } from '../db/database';
import { BookingRecord, DeliveryStatus } from '../types';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Navigation, 
  ArrowRight,
  Sparkles,
  Star
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

  const loadData = async () => {
    if (!bookingId) return;
    const b = await db.getBookingById(bookingId);
    if (b) setBooking(b);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E6DF] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64748B] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Clear Prototype Integration Label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-semibold mb-4 border border-[#0F766E]/20">
          <Truck className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Powered by Porter — Prototype Integration</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              Logistics & Dispatch Tracking
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Waybill #{booking.deliveryTracking.trackingNumber} · {booking.quantity}x {booking.resourceName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Current Status</span>
            <span className="text-xs font-bold text-[#0F766E] bg-[#E6F4F1] px-2.5 py-1 rounded-md inline-block mt-0.5">
              {booking.deliveryStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Driver & Courier Card */}
        <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E6DF] flex items-center justify-center text-[#0F766E] font-bold text-base shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">{booking.deliveryTracking.driverName}</p>
              <p className="text-[11px] text-[#64748B] font-mono">{booking.deliveryTracking.vehicleNumber}</p>
              <p className="text-[10px] text-[#2A6D58] font-semibold mt-0.5">Commercial Transit Insured</p>
            </div>
          </div>

          <a
            href={`tel:${booking.deliveryTracking.driverPhone}`}
            onClick={(e) => {
              e.preventDefault();
              alert(`Simulated call to Porter driver: ${booking.deliveryTracking.driverPhone}`);
            }}
            className="p-2.5 bg-white hover:bg-[#E6F4F1] text-[#0F766E] border border-[#E8E6DF] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call Driver</span>
          </a>
        </div>

        {/* 5-Step Visual Logistics Flow: Requested → Assigned → Picked Up → In Transit → Delivered */}
        <div className="space-y-4 mb-6 relative">
          <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-[#E8E6DF]"></div>

          {booking.deliveryTracking.timeline.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} className="relative flex items-start gap-4 pl-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors z-10 ${
                    isCompleted
                      ? 'bg-[#0F766E] text-white ring-4 ring-[#E6F4F1]'
                      : 'bg-white border-2 border-[#CBD5E1] text-[#94A3B8]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className={`flex-1 p-3 rounded-2xl border transition-all ${
                  isCurrent 
                    ? 'bg-[#E6F4F1]/60 border-[#0F766E]/30 soft-shadow' 
                    : 'bg-[#FAF9F6] border-[#E8E6DF]'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-[#0F766E]' : 'text-[#1E293B]'}`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{step.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advance Simulation Button & Review Action */}
        <div className="pt-3 border-t border-[#F4F3EF] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {currentStep < STATUS_FLOW.length - 1 ? (
            <button
              onClick={handleAdvanceStep}
              className="w-full sm:w-auto px-4 py-2 bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Simulate Advance Next Status ({STATUS_FLOW[currentStep + 1]})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-2 items-center justify-between">
              <span className="text-xs text-[#2A6D58] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Delivery Complete! Rental in progress.</span>
              </span>

              {onOpenReview && (
                <button
                  onClick={() => {
                    onOpenReview(booking.id);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-[#FEF7EE] hover:bg-[#faebd7] text-[#A15325] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-[#A15325]" />
                  <span>Leave Peer Rating & Review</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
