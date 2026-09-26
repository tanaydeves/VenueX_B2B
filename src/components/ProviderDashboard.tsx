import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, subscribeToDatabase } from '../db/database';
import { BookingRecord, DealRecord, ResourceListing, ResourceRequest } from '../types';
import { 
  Building2, 
  PlusCircle, 
  Layers, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  Check, 
  X, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Edit3
} from 'lucide-react';

interface ProviderDashboardProps {
  onOpenAddResource: () => void;
  onOpenChat: (requestId: string) => void;
  onOpenTracking: (bookingId: string) => void;
  onOpenResource: (resourceId: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onOpenAddResource,
  onOpenChat,
  onOpenTracking,
  onOpenResource,
}) => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<ResourceListing[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);

  const loadData = async () => {
    if (!currentUser) return;
    const [allRes, allReqs, allBooks, allDeals] = await Promise.all([
      db.getResources(),
      db.getRequests(),
      db.getBookings(),
      db.getDeals(),
    ]);

    setResources(allRes.filter(r => r.providerId === currentUser.id));
    setRequests(allReqs.filter(r => r.providerId === currentUser.id));
    setBookings(allBooks.filter(b => b.providerId === currentUser.id));
    setDeals(allDeals.filter(d => d.providerId === currentUser.id));
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToDatabase(() => loadData());
    return () => unsub();
  }, [currentUser]);

  // Handle Request Actions
  const handleAcceptRequest = async (request: ResourceRequest) => {
    const updated = { ...request, status: 'ACCEPTED' as const };
    await db.saveRequest(updated);

    // Create or update deal to AWAITING_DEPOSIT
    const existingDeal = deals.find(d => d.requestId === request.id);
    const subtotal = request.quantity * request.rentalDays * (request.proposedPricePerUnit || 120);
    const deliveryFee = request.deliveryRequired ? 1800 : 0;
    const deposit = Math.round(subtotal * 0.15);

    const deal: DealRecord = existingDeal ? {
      ...existingDeal,
      status: 'AWAITING_DEPOSIT',
      finalizedAt: new Date().toISOString(),
    } : {
      id: `deal-${Date.now()}`,
      requestId: request.id,
      seekerId: request.seekerId,
      seekerName: request.seekerName,
      providerId: request.providerId,
      providerName: request.providerName,
      resourceId: request.resourceId,
      resourceName: request.resourceName,
      resourceImage: request.resourceImage,
      quantity: request.quantity,
      startDate: request.startDate,
      endDate: request.endDate,
      rentalDays: request.rentalDays,
      rentalPricePerUnit: request.proposedPricePerUnit || 120,
      subtotalRental: subtotal,
      deliveryFee,
      depositPercent: 15,
      depositAmount: deposit,
      totalAmount: subtotal + deliveryFee + deposit,
      status: 'AWAITING_DEPOSIT',
      proposedBy: 'PROVIDER',
      lastModifiedByRole: 'PROVIDER',
      finalizedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.saveDeal(deal);
  };

  const handleRejectRequest = async (request: ResourceRequest) => {
    const updated = { ...request, status: 'REJECTED' as const };
    await db.saveRequest(updated);
  };

  // KPI Calculations
  const activeResourcesCount = resources.length;
  const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'IN_PROGRESS').length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'SUCCESS')
    .reduce((sum, b) => sum + b.subtotalRental, 0);

  // Utilization calculation: (total booked units in current window / total units)
  const totalCapacity = resources.reduce((sum, r) => sum + r.quantityTotal, 0);
  const totalBookedUnits = bookings
    .filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'IN_PROGRESS')
    .reduce((sum, b) => sum + b.quantity, 0);
  const utilizationPercent = totalCapacity > 0 ? Math.min(100, Math.round((totalBookedUnits / totalCapacity) * 100)) : 45;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header and Add Action */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Provider Asset Management Hub · {currentUser?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Hospitality Resource Provider Center
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monetize idle banquet seating, kitchen space, AV equipment, and commercial transport.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddResource}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ List New Resource</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Summary Blocks */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Resources */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Active Resources</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            {activeResourcesCount}
          </div>
          <p className="text-xs text-[#0F766E] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] inline-block"></span>
            {totalCapacity} total units published
          </p>
        </div>

        {/* KPI 2: Active Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Active Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF6F2] text-[#2A6D58] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            {activeBookingsCount}
          </div>
          <p className="text-xs text-[#64748B] truncate">
            {totalBookedUnits} units currently reserved
          </p>
        </div>

        {/* KPI 3: Revenue (₹) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Rental Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF7EE] text-[#A15325] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[#2A6D58] font-medium">
            100% payout escrow secured
          </p>
        </div>

        {/* KPI 4: Utilization % */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] soft-shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Asset Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums mb-1">
            {utilizationPercent}%
          </div>
          <p className="text-xs text-[#0F766E] font-medium">
            Active demand across Navi Mumbai
          </p>
        </div>
      </section>

      {/* Incoming Requests List */}
      <section className="bg-white p-6 rounded-3xl border border-[#E8E6DF] soft-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
              Incoming Rental Requests
            </h2>
            <p className="text-xs text-[#64748B]">
              Review booking proposals from verified hospitality peers
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0F766E] bg-[#E6F4F1] px-3 py-1 rounded-full">
            {requests.length} total
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            No incoming requests currently. Your resources are visible in search results.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const deal = deals.find(d => d.requestId === req.id);
              return (
                <div
                  key={req.id}
                  className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'ACCEPTED' ? 'bg-[#EBF6F2] text-[#2A6D58]' :
                        req.status === 'COUNTERED' ? 'bg-[#FEF7EE] text-[#A15325]' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-[#E6F4F1] text-[#0F766E]'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs font-bold text-[#1E293B]">
                        {req.seekerName}
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        ({req.seekerLocation})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#1E293B]">
                      Request for {req.quantity}x {req.resourceName}
                    </h3>

                    <p className="text-xs text-[#64748B]">
                      Dates: <strong className="text-[#1E293B]">{req.startDate} to {req.endDate}</strong> ({req.rentalDays} days) • Delivery: {req.deliveryRequired ? 'Required by Seeker' : 'Self Pickup'}
                    </p>

                    {req.notes && (
                      <p className="text-xs text-[#64748B] italic">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions for Provider */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenChat(req.id)}
                      className="px-3.5 py-2 bg-white hover:bg-[#E6F4F1] border border-[#E8E6DF] text-[#0F766E] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Negotiate / Deal</span>
                    </button>

                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>

                        <button
                          onClick={() => handleRejectRequest(req)}
                          className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Manage Resources List */}
      <section className="bg-white p-6 rounded-3xl border border-[#E8E6DF] soft-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
              Your Published Resources ({resources.length})
            </h2>
            <p className="text-xs text-[#64748B]">
              Manage inventory pricing, units, and availability windows
            </p>
          </div>
          <button
            onClick={onOpenAddResource}
            className="text-xs font-semibold text-[#0F766E] hover:text-[#0b5751] flex items-center gap-1 cursor-pointer"
          >
            <span>+ Add Listing</span>
          </button>
        </div>

        {resources.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            You have not listed any resources yet. Click "+ List New Resource" above to add your idle items.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(res => (
              <div
                key={res.id}
                className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6DF] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-[#E2E8F0]">
                    <img
                      src={res.imageUrl}
                      alt={res.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">
                    {res.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#1E293B] line-clamp-1 mt-0.5">
                    {res.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    {res.quantityTotal} units total • ₹{res.pricePerUnitPerDay.toLocaleString('en-IN')}/day
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between">
                  <span className="text-[11px] text-[#2A6D58] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A6D58]"></span>
                    Live in Marketplace
                  </span>
                  <button
                    onClick={() => onOpenResource(res.id)}
                    className="text-xs text-[#0F766E] font-semibold hover:underline cursor-pointer"
                  >
                    View Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dispatched Bookings & Porter Deliveries */}
      <section className="bg-white p-6 rounded-3xl border border-[#E8E6DF] soft-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
              Active Bookings & Porter Logistics
            </h2>
            <p className="text-xs text-[#64748B]">
              Live dispatch status of equipment currently rented out
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            No equipment currently out on rental.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(book => (
              <div
                key={book.id}
                className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF6F2] text-[#2A6D58]">
                      {book.bookingStatus}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Delivery: <strong className="text-[#0F766E]">{book.deliveryStatus}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1E293B] mt-1">
                    {book.quantity}x {book.resourceName}
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Rented to {book.seekerName} ({book.startDate} to {book.endDate}) • ₹{book.subtotalRental.toLocaleString('en-IN')} rental fee
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTracking(book.id)}
                    className="px-3.5 py-2 bg-white hover:bg-[#E6F4F1] border border-[#E8E6DF] text-[#0F766E] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>View Porter Courier Tracking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
