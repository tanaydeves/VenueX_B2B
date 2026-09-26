import React, { useState, useEffect } from 'react';
import { db, subscribeToDatabase } from '../db/database';
import { BookingRecord, ResourceListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateRemainingQuantity } from '../utils/matchingEngine';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  Truck, 
  Warehouse, 
  Layers, 
  Check, 
  Lock, 
  Info,
  Clock,
  Sparkles,
  MessageSquare,
  ArrowRight,
  IndianRupee
} from 'lucide-react';

interface ResourceDetailPageProps {
  resourceId: string;
  onBack: () => void;
  onStartChatAndNegotiate: (resource: ResourceListing, quantity: number, startDate: string, endDate: string, deliveryRequired: boolean) => void;
  onDirectBook: (resource: ResourceListing, quantity: number, startDate: string, endDate: string, deliveryRequired: boolean) => void;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({
  resourceId,
  onBack,
  onStartChatAndNegotiate,
  onDirectBook,
}) => {
  const { currentUser } = useAuth();
  const [resource, setResource] = useState<ResourceListing | null>(null);
  const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking config state
  const [quantity, setQuantity] = useState(50);
  const [startDate, setStartDate] = useState('2026-10-14');
  const [endDate, setEndDate] = useState('2026-10-17');
  const [deliveryRequired, setDeliveryRequired] = useState(true);

  const loadData = async () => {
    const [res, books] = await Promise.all([
      db.getResourceById(resourceId),
      db.getBookings(),
    ]);
    if (res) {
      setResource(res);
      setQuantity(Math.min(50, res.quantityTotal));
    }
    setAllBookings(books);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToDatabase(() => loadData());
    return () => unsub();
  }, [resourceId]);

  if (!resource) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-[#64748B]">Loading resource details...</p>
      </div>
    );
  }

  // Calculate rental duration in days
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  // Dynamic Quantity-Aware Remaining Units
  const remainingUnits = calculateRemainingQuantity(resource, startDate, endDate, allBookings);

  // Pricing calculations (in ₹ INR)
  const effectiveQuantity = Math.min(quantity, remainingUnits > 0 ? remainingUnits : 1);
  const rentalSubtotal = effectiveQuantity * resource.pricePerUnitPerDay * diffDays;
  const deliveryFee = deliveryRequired && resource.deliveryOptions.deliveryAvailable 
    ? resource.deliveryOptions.flatDeliveryFee 
    : 0;
  const depositAmount = Math.round(rentalSubtotal * (resource.depositPercent / 100));
  const estimatedTotal = rentalSubtotal + deliveryFee + depositAmount;

  const gallery = resource.galleryUrls && resource.galleryUrls.length > 0 
    ? resource.galleryUrls 
    : [resource.imageUrl];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-36">
      
      {/* Secondary Contextual Back / Action Bar */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#0F766E] hover:text-[#0b5751] text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-lg hover:bg-[#E6F4F1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to results</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            aria-label="Share listing"
            className="p-2 rounded-full bg-white soft-shadow text-[#64748B] hover:text-[#0F766E] transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            aria-label="Save listing"
            className="p-2 rounded-full bg-white soft-shadow text-[#64748B] hover:text-[#A15325] transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Gallery Section */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-[#F4F3EF] soft-shadow aspect-[16/10] sm:aspect-[21/10]">
        <img
          src={gallery[activeImageIndex] || resource.imageUrl}
          alt={resource.name}
          className="w-full h-full object-cover transition-all duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Quality Inspected Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#0F766E] text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            Quality Inspected & Sanitized
          </span>
        </div>

        {/* Image Pagination Dots / Indicator */}
        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeImageIndex === i ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Title & Overview Card */}
      <section className="bg-white rounded-3xl p-6 md:p-8 soft-shadow border border-[#E8E6DF]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1 space-y-2">
            
            {/* Quantity-Aware Capacity Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
              <span>{remainingUnits} of {resource.quantityTotal} units currently available</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight leading-snug">
              {resource.name}
            </h1>

            <p className="text-sm text-[#64748B] leading-relaxed pt-1">
              {resource.description}
            </p>
          </div>

          {/* Clean Pricing Highlight */}
          <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6DF] text-left md:text-right shrink-0">
            <div className="flex items-baseline md:justify-end gap-1">
              <span className="text-2xl font-bold text-[#0F766E] font-mono">
                ₹{resource.pricePerUnitPerDay.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#64748B]">/ unit / day</span>
            </div>
            <p className="text-[11px] text-[#2A6D58] font-semibold mt-1">
              {resource.depositPercent}% refundable security deposit
            </p>
            <span className="inline-block mt-2 text-[10px] text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E8E6DF]">
              GST calculated at checkout
            </span>
          </div>
        </div>

        {/* Feature Specifications List */}
        <div className="mt-6 pt-6 border-t border-[#F4F3EF] flex flex-wrap gap-2.5">
          {resource.specifications.map((spec, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F6] text-[#475569] text-xs font-medium border border-[#E8E6DF]"
            >
              <Check className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{spec}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Provider Details Card */}
      <section className="bg-white rounded-3xl p-6 soft-shadow border border-[#E8E6DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#0F766E] font-bold text-xl">
            <Warehouse className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">{resource.providerName}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
              <span className="flex items-center gap-1 font-semibold text-[#1E293B]">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {resource.providerRating} ({resource.providerReviewsCount} peer rentals)
              </span>
              <span>•</span>
              <span>{resource.location} ({resource.distanceKm} km away)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF6F2] text-[#2A6D58] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#2A6D58]" />
            Verified Hospitality Partner
          </span>
        </div>
      </section>

      {/* Interactive Reservation Calculator & Calendar */}
      <section className="bg-white rounded-3xl p-6 md:p-8 soft-shadow border border-[#E8E6DF] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F4F3EF]">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#0F766E]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Schedule & Booking Configuration
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select desired rental duration and units to compute instant quote
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] px-3 py-1 rounded-full self-start sm:self-auto">
            Season: {resource.availabilityStartDate} to {resource.availabilityEndDate}
          </span>
        </div>

        {/* Date & Quantity Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Start Date (Load-in)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs sm:text-sm text-[#1E293B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              End Date (Strike & Return)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs sm:text-sm text-[#1E293B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Quantity ({effectiveQuantity} of {remainingUnits} avail)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={Math.max(1, remainingUnits)}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs sm:text-sm font-bold text-[#0F766E] focus:outline-none font-mono"
              />
              <span className="text-xs text-[#64748B] shrink-0">units</span>
            </div>
          </div>
        </div>

        {/* Visual Mini Calendar Slot Preview */}
        <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6DF]">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
            <span className="font-semibold text-[#1E293B]">
              Selected Window: {startDate} to {endDate} ({diffDays} days)
            </span>
            <span className="text-[#2A6D58] font-bold">
              {remainingUnits >= quantity ? '✓ Full Quantity In Stock' : '⚠️ Limited Remaining Capacity'}
            </span>
          </div>

          {/* Simple Visual Day Slots */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white border border-[#E8E6DF]">
              <span className="text-[10px] text-[#94A3B8] block">Day 1</span>
              <span className="font-semibold text-[#1E293B]">{startDate}</span>
              <span className="text-[10px] text-[#0F766E] block font-bold mt-1">Load-in</span>
            </div>
            <div className="p-2 rounded-lg bg-[#E6F4F1] border border-[#0F766E]/20">
              <span className="text-[10px] text-[#0F766E] block">Day 2</span>
              <span className="font-semibold text-[#0F766E]">Active Event</span>
              <span className="text-[10px] text-[#0F766E] block font-bold mt-1">In Use</span>
            </div>
            <div className="p-2 rounded-lg bg-[#E6F4F1] border border-[#0F766E]/20">
              <span className="text-[10px] text-[#0F766E] block">Day 3</span>
              <span className="font-semibold text-[#0F766E]">Active Event</span>
              <span className="text-[10px] text-[#0F766E] block font-bold mt-1">In Use</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E8E6DF]">
              <span className="text-[10px] text-[#94A3B8] block">Day 4</span>
              <span className="font-semibold text-[#1E293B]">{endDate}</span>
              <span className="text-[10px] text-[#2A6D58] block font-bold mt-1">Inspection Return</span>
            </div>
          </div>
        </div>

        {/* Delivery Options Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6DF]">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#0F766E]" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#1E293B]">
                Porter Loading Dock Delivery & Pickup
              </p>
              <p className="text-xs text-[#64748B]">
                {resource.deliveryOptions.deliveryAvailable 
                  ? `Simulated Porter transit within ${resource.deliveryOptions.maxDistanceKm} km (₹${resource.deliveryOptions.flatDeliveryFee.toLocaleString('en-IN')})` 
                  : 'Only venue pickup available'}
              </p>
            </div>
          </div>

          {resource.deliveryOptions.deliveryAvailable && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryRequired}
                onChange={e => setDeliveryRequired(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
            </label>
          )}
        </div>
      </section>

      {/* Logistics & Dock Specs */}
      <section className="bg-white rounded-3xl p-6 md:p-8 soft-shadow border border-[#E8E6DF] space-y-4">
        <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#0F766E]" />
          <span>Delivery & Loading Dock Logistics</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6DF]">
            <h4 className="text-xs font-bold text-[#1E293B]">Packaging & Skid Configuration</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              {resource.packagingNotes}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6DF]">
            <h4 className="text-xs font-bold text-[#1E293B]">Loading Bay & Height Requirements</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              {resource.loadingDockRequirements}
            </p>
          </div>
        </div>
      </section>

      {/* Protection Terms */}
      <section className="bg-white rounded-3xl p-6 soft-shadow border border-[#E8E6DF] divide-y divide-[#F4F3EF]">
        <div className="pb-3.5 flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#1E293B]">Protected Escrow Payment</h4>
            <p className="text-xs text-[#64748B]">
              Simulated payment is safely held until you inspect and accept the items at delivery.
            </p>
          </div>
        </div>
        <div className="pt-3.5 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-[#2A6D58] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#1E293B]">
              {resource.depositPercent}% Refundable Security Deposit (₹{depositAmount.toLocaleString('en-IN')})
            </h4>
            <p className="text-xs text-[#64748B]">
              Released automatically within 24 hours of successful inventory return inspection.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Action Bar */}
      <aside className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E6DF] py-3.5 px-4 md:px-8 z-40 soft-shadow">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Total Breakdown */}
          <div className="w-full sm:w-auto text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-[#1E293B] font-mono">
                Estimated: ₹{estimatedTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#64748B]">
                ({effectiveQuantity} units • {diffDays} days)
              </span>
            </div>
            <p className="text-[11px] text-[#2A6D58] font-medium">
              Includes ₹{depositAmount.toLocaleString('en-IN')} refundable deposit
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => onStartChatAndNegotiate(resource, effectiveQuantity, startDate, endDate, deliveryRequired)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8E6DF] text-xs sm:text-sm font-semibold text-[#1E293B] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#0F766E]" />
              <span>Chat & Negotiate</span>
            </button>

            <button
              onClick={() => onDirectBook(resource, effectiveQuantity, startDate, endDate, deliveryRequired)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0F766E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0b5751] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Book / Reserve</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

    </div>
  );
};
