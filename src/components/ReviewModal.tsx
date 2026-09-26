import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import { BookingRecord, ReviewRecord } from '../types';
import { X, Star, CheckCircle2, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  bookingId,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (bookingId) {
      db.getBookingById(bookingId).then(b => setBooking(b));
    }
  }, [bookingId, isOpen]);

  if (!isOpen || !booking) return null;

  const isSeeker = currentUser?.id === booking.seekerId;
  const targetBizId = isSeeker ? booking.providerId : booking.seekerId;
  const targetBizName = isSeeker ? booking.providerName : booking.seekerName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !currentUser) return;
    setIsSubmitting(true);

    const newReview: ReviewRecord = {
      id: `rev-${Date.now()}`,
      bookingId: booking.id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: isSeeker ? 'SEEKER' : 'PROVIDER',
      targetBusinessId: targetBizId,
      targetBusinessName: targetBizName,
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    await db.saveReview(newReview);
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8E6DF] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64748B] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Leave Peer Feedback</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Rate your hospitality rental experience with <strong className="text-[#1E293B]">{targetBizName}</strong>
              </p>
            </div>

            <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] text-xs">
              <span className="text-[#64748B] block">Rental Resource</span>
              <span className="font-bold text-[#1E293B]">{booking.quantity}x {booking.resourceName}</span>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-2 text-center">
                Overall Satisfaction Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-[#CBD5E1]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center text-xs font-bold text-[#0F766E] mt-1">
                {rating === 5 ? 'Exceptional (5/5)' : rating === 4 ? 'Very Good (4/5)' : rating === 3 ? 'Satisfactory (3/5)' : 'Needs Improvement'}
              </div>
            </div>

            {/* Comment Box */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Detailed Feedback (Equipment condition, punctuality, packaging)
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Chairs were spotless, arrived on time via Porter with protective covers, great communication throughout..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0b5751] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Rating'}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#EBF6F2] text-[#2A6D58] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Feedback Recorded</h3>
            <p className="text-xs text-[#64748B]">
              Thank you for strengthening the trust network in Navi Mumbai!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
