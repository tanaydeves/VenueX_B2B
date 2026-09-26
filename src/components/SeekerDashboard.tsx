import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, subscribeToDatabase } from '../db/database';
import { BookingRecord, DealRecord, ResourceListing, ResourceRequest } from '../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  IndianRupee,
  Layers
} from 'lucide-react';
import { computeMatchScore } from '../utils/matchingEngine';

interface SeekerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenResource: (resourceId: string) => void;
  onOpenChat: (requestId: string) => void;
  onOpenTracking: (bookingId: string) => void;
  onOpenPayment: (dealId: string) => void;
  onOpenReview: (bookingId: string) => void;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({
  onNavigate,
  onOpenResource,
  onOpenChat,
  onOpenTracking,
  onOpenPayment,
  onOpenReview,
}) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [resources, setResources] = useState<ResourceListing[]>([]);

  const loadData = async () => {
    if (!currentUser) return;
    const [allReqs, allDeals, allBooks, allRes] = await Promise.all([
      db.getRequests(),
      db.getDeals(),
      db.getBookings(),
      db.getResources(),
    ]);

    // Filter items related to current user as Seeker
    setRequests(allReqs.filter(r => r.seekerId === currentUser.id));
    setDeals(allDeals.filter(d => d.seekerId === currentUser.id));
    setBookings(allBooks.filter(b => b.seekerId === currentUser.id));
    setResources(allRes.filter(r => r.providerId !== currentUser.id));
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToDatabase(() => loadData());
    return () => unsub();
  }, [currentUser]);

  // Compute KPI values
  const activeRequestsCount = requests.filter(r => r.status === 'PENDING' || r.status === 'COUNTERED').length;
  const upcomingBookingsCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'IN_PROGRESS').length;
  const pendingDealsCount = deals.filter(d => d.status === 'NEGOTIATING' || d.status === 'AWAITING_CONFIRMATION' || d.status === 'AWAITING_DEPOSIT').length;
  const totalSpend = bookings
    .filter(b => b.paymentStatus === 'SUCCESS')
    .reduce((sum, b) => sum + b.totalPaid, 0);

  // Active highlighted booking
  const activeBooking = bookings.find(b => b.bookingStatus === 'IN_PROGRESS' || b.bookingStatus === 'CONFIRMED');

  return (
    <div className="space-y-8 pb-16">
      
      {/* Welcome Banner & Quick Action */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF6F2] text-[#2A6D58] text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Seeker Operations Hub Active · {currentUser?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Hospitality Equipment & Space Manager
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Real-time tracking of temporary rentals, incoming peer transfers, and dockside deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('search')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>+ Request Equipment or Space</span>
          </button>
        </div>
      </section>

      {/* Active Attention Banner (Primary Notice) */}
      {activeBooking && (
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8E6DF] soft-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0F766E]"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 pl-2">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] flex-shrink-0 flex items-center justify-center text-[#0F766E]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF7EE] text-[#A15325]">
                    Status: {activeBooking.deliveryStatus.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Dock Bay: Vashi / Belapur Hub
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#1E293B] mt-1">
                  {activeBooking.quantity}x {activeBooking.resourceName}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Confirmed rental from {activeBooking.providerName}. Logistics powered by Porter ({activeBooking.deliveryTracking.driverName} • {activeBooking.deliveryTracking.vehicleNumber}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pl-2 md:pl-0">
              <button
                onClick={() => onOpenTracking(activeBooking.id)}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#E6F4F1] hover:bg-[#d4eee7] text-[#0F766E] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Track Porter Logistics</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4 Spacious KPI Blocks */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Active Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            {activeRequestsCount}
          </div>
          <p className="text-xs text-[#0F766E] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] inline-block"></span>
            {requests.length} total submitted
          </p>
        </div>

        {/* KPI 2: Upcoming Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Upcoming Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF6F2] text-[#2A6D58] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            {upcomingBookingsCount}
          </div>
          <p className="text-xs text-[#64748B] truncate">
            {activeBooking ? `Next: ${activeBooking.quantity} units (${activeBooking.startDate})` : 'No upcoming bookings'}
          </p>
        </div>

        {/* KPI 3: Pending Deals */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Pending Deals</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF7EE] text-[#A15325] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            {pendingDealsCount}
          </div>
          <p className="text-xs text-[#64748B] truncate">
            {deals.some(d => d.status === 'AWAITING_DEPOSIT') 
              ? 'Deal approved! Deposit required' 
              : `${deals.length} total negotiation threads`}
          </p>
        </div>

        {/* KPI 4: Total Spend */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Total Spend (INR)</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            ₹{totalSpend.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[#2A6D58] font-medium">
            ~35% savings vs capital purchase
          </p>
        </div>
      </section>

      {/* Operational Exchange Timeline */}
      <section className="bg-white p-6 rounded-2xl border border-[#E8E6DF] soft-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
              Active Dispatch Flow
            </h2>
            <p className="text-xs text-[#64748B]">
              Simple step progression for incoming peer inventory transfers
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] px-3 py-1 rounded-full self-start md:self-auto">
            {activeBooking ? `Order #${activeBooking.id}` : 'Standard Transfer Lifecycle'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF]">
            <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">1. Request Sent</p>
              <p className="text-[11px] text-[#64748B]">Dates & units specified</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF]">
            <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">2. Reserved & Confirmed</p>
              <p className="text-[11px] text-[#64748B]">Inventory locked in escrow</p>
            </div>
          </div>

          {/* Step 3 (Current) */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#E6F4F1] border border-[#0F766E]/30">
            <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0 ring-4 ring-[#0F766E]/20">
              3
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F766E]">3. Ready for Dock Pickup</p>
              <p className="text-[11px] text-[#64748B]">Porter courier handover</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] opacity-60">
            <div className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-xs font-bold shrink-0">
              4
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B]">4. Safely Returned</p>
              <p className="text-[11px] text-[#94A3B8]">Deposit released</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Requests & Deals Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Active Requests & Negotiations */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E293B]">Active Requests & Deals</h2>
            <span className="text-xs text-[#64748B]">{requests.length} requests</span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8] text-xs">
              No active requests currently. Browse resources to submit a request.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const deal = deals.find(d => d.requestId === req.id);
                return (
                  <div key={req.id} className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6DF] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'ACCEPTED' ? 'bg-[#EBF6F2] text-[#2A6D58]' :
                          req.status === 'COUNTERED' ? 'bg-[#FEF7EE] text-[#A15325]' :
                          'bg-[#E6F4F1] text-[#0F766E]'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {req.startDate} to {req.endDate}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1E293B] truncate mt-1">
                        {req.quantity}x {req.resourceName}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        Provider: {req.providerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenChat(req.id)}
                        className="px-3 py-1.5 bg-white hover:bg-[#E6F4F1] border border-[#E8E6DF] text-[#0F766E] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat / Deal</span>
                      </button>

                      {deal && (deal.status === 'AWAITING_DEPOSIT' || deal.status === 'AWAITING_CONFIRMATION') && (
                        <button
                          onClick={() => onOpenPayment(deal.id)}
                          className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Pay Deposit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Confirmed Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E293B]">Confirmed Bookings</h2>
            <span className="text-xs text-[#64748B]">{bookings.length} total</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8] text-xs">
              No confirmed bookings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(book => (
                <div key={book.id} className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6DF] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF6F2] text-[#2A6D58]">
                        {book.bookingStatus}
                      </span>
                      <span className="text-xs text-[#64748B] font-mono">
                        ₹{book.totalPaid.toLocaleString('en-IN')} paid
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1E293B] truncate mt-1">
                      {book.quantity}x {book.resourceName}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      From {book.providerName} · {book.startDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenTracking(book.id)}
                      className="px-3 py-1.5 bg-white hover:bg-[#E6F4F1] border border-[#E8E6DF] text-[#0F766E] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Tracking</span>
                    </button>
                    {book.bookingStatus === 'COMPLETED' && (
                      <button
                        onClick={() => onOpenReview(book.id)}
                        className="px-3 py-1.5 bg-[#FEF7EE] text-[#A15325] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Rate Provider
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* "Recommended for You" section showing resource cards with match score badge */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              Recommended for Your Upcoming Events
            </h2>
            <p className="text-xs text-[#64748B]">
              Pre-vetted items with high compatibility from nearby trusted hospitality peers in Navi Mumbai
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-[#0F766E] hover:text-[#0b5751] flex items-center gap-1 cursor-pointer"
          >
            <span>See all listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {resources.slice(0, 3).map(res => {
            const matchInfo = computeMatchScore(
              res,
              {
                category: '',
                quantity: 50,
                location: '',
                startDate: '',
                endDate: '',
                maxBudget: 15000,
                deliveryRequired: true,
                sortBy: 'best_match',
              },
              bookings
            );

            return (
              <article
                key={res.id}
                className="bg-white rounded-2xl p-4 border border-[#E8E6DF] soft-shadow hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-[#F4F3EF]">
                    <img
                      src={res.imageUrl}
                      alt={res.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold text-[#0F766E] shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                      {matchInfo.score}% Match
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#1E293B]/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E6F4F1]" />
                      {res.distanceKm} km away ({res.location.split(',')[0]})
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1E293B] group-hover:text-[#0F766E] transition-colors">
                    {res.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    {matchInfo.explanation}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F4F3EF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Daily Rate</span>
                    <span className="text-sm font-bold text-[#1E293B] font-mono">
                      ₹{res.pricePerUnitPerDay.toLocaleString('en-IN')}
                      <span className="text-[11px] font-normal text-[#64748B]"> / unit</span>
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenResource(res.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#E6F4F1] hover:bg-[#0F766E] hover:text-white text-[#0F766E] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

    </div>
  );
};
