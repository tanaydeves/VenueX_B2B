import React, { useState, useEffect, useMemo } from 'react';
import { db, subscribeToDatabase } from '../db/database';
import { BookingRecord, MatchScoreResult, ResourceListing, SearchFilterState } from '../types';
import { computeMatchScore } from '../utils/matchingEngine';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  Check, 
  ShieldCheck, 
  ArrowUpDown, 
  Truck, 
  Layers, 
  X,
  IndianRupee,
  Sparkles,
  Info,
  Activity,
  Cpu,
  CloudRain
} from 'lucide-react';
import { AiMatchExplanationModal } from './AiMatchExplanationModal';
import { WeatherDigitalTwinModal } from './WeatherDigitalTwinModal';

interface SearchPageProps {
  onOpenResource: (resourceId: string) => void;
  initialCategory?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onOpenResource, initialCategory }) => {
  const [resources, setResources] = useState<ResourceListing[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  // Search filter state
  const [filters, setFilters] = useState<SearchFilterState>({
    category: initialCategory || 'All',
    quantity: 100,
    location: 'All',
    startDate: '2026-10-01',
    endDate: '2026-10-04',
    maxBudget: 15000,
    deliveryRequired: true,
    sortBy: 'best_match',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Nugen AI Modals state
  const [aiMatchModalOpen, setAiMatchModalOpen] = useState(false);
  const [selectedMatchResource, setSelectedMatchResource] = useState<ResourceListing | null>(null);
  const [selectedMatchResult, setSelectedMatchResult] = useState<MatchScoreResult | null>(null);

  const [weatherTwinModalOpen, setWeatherTwinModalOpen] = useState(false);
  const [selectedWeatherResource, setSelectedWeatherResource] = useState<ResourceListing | null>(null);

  const loadData = async () => {
    const [resList, bookList] = await Promise.all([
      db.getResources(),
      db.getBookings(),
    ]);
    setResources(resList);
    setBookings(bookList);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToDatabase(() => loadData());
    return () => unsub();
  }, []);

  const categories = [
    'All',
    'Chairs & Seating',
    'Tables & Dining',
    'Commercial Kitchen',
    'AV & Staging',
    'Vehicles & Transport',
    'Event Spaces',
  ];

  const locations = [
    'All',
    'Vashi, Navi Mumbai',
    'CBD Belapur, Navi Mumbai',
    'Kharghar, Navi Mumbai',
    'Panvel, Navi Mumbai',
    'Seawoods, Navi Mumbai',
  ];

  // Compute matches with weighted scoring function and sort
  const scoredResources = useMemo(() => {
    return resources
      .map(res => {
        const matchResult = computeMatchScore(res, filters, bookings);
        return {
          resource: res,
          match: matchResult,
        };
      })
      .filter(({ resource, match }) => {
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesQuery = 
            resource.name.toLowerCase().includes(q) ||
            resource.description.toLowerCase().includes(q) ||
            resource.category.toLowerCase().includes(q) ||
            resource.location.toLowerCase().includes(q) ||
            resource.providerName.toLowerCase().includes(q);
          if (!matchesQuery) return false;
        }

        // Location filter
        if (filters.location !== 'All') {
          if (!resource.location.toLowerCase().includes(filters.location.split(',')[0].toLowerCase())) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'All') {
          if (resource.category !== filters.category) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'best_match') {
          return b.match.score - a.match.score;
        }
        if (filters.sortBy === 'distance') {
          return a.resource.distanceKm - b.resource.distanceKm;
        }
        if (filters.sortBy === 'price_asc') {
          return a.resource.pricePerUnitPerDay - b.resource.pricePerUnitPerDay;
        }
        if (filters.sortBy === 'quantity') {
          return b.match.remainingAvailableQuantity - a.match.remainingAvailableQuantity;
        }
        return 0;
      });
  }, [resources, bookings, filters, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Nugen Domain Alignment & Weather Digital Twin Feature Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 border border-indigo-900 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Cpu className="w-3.5 h-3.5" />
                Nugen Domain Aligned Intelligence
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Base: Meta-Llama-3-8B → Aligned: venuex-hospitality-domain-v1
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Weather Digital Twin & Domain Match Engine
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Simulate monsoon rain, cyclonic wind gusts, and heatwave shocks to test asset availability and transit risk in real time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedWeatherResource(null);
                setWeatherTwinModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Launch Weather Digital Twin</span>
            </button>
          </div>
        </div>
      </section>

      {/* Top Search & Filter Bar Container */}
      <section className="bg-white rounded-lg p-4 sm:p-5 border border-[#E8E6DF] soft-shadow">
        
        {/* Main query bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center bg-gray-50 border border-[#E8E6DF] rounded-xl px-3.5 py-2.5 gap-2.5">
            <Search className="w-5 h-5 text-blue-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search banquet seating, combi ovens, AV projectors, catering vans..."
              className="bg-transparent text-sm text-gray-900 w-full focus:outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            className="w-full md:w-auto px-4 py-2.5 bg-gray-50 hover:bg-[#F4F3EF] border border-[#E8E6DF] rounded-xl text-xs sm:text-sm font-semibold text-gray-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>{showFiltersModal ? 'Hide Filters' : 'Refine Filters'}</span>
          </button>
        </div>

        {/* Quick Filter Horizontal Pills */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar py-1">
          {/* Category Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              aria-label="Filter by category"
              className="appearance-none pl-3 pr-7 py-1.5 rounded-full bg-gray-50 hover:bg-[#F4F3EF] text-xs font-semibold text-gray-900 border border-[#E8E6DF] focus:outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              aria-label="Filter by location"
              className="appearance-none pl-3 pr-7 py-1.5 rounded-full bg-gray-50 hover:bg-[#F4F3EF] text-xs font-semibold text-gray-900 border border-[#E8E6DF] focus:outline-none cursor-pointer"
            >
              {locations.map(l => (
                <option key={l} value={l}>{l === 'All' ? 'Navi Mumbai (All)' : l.split(',')[0]}</option>
              ))}
            </select>
          </div>

          {/* Delivery Required Toggle Chip */}
          <button
            onClick={() => setFilters(f => ({ ...f, deliveryRequired: !f.deliveryRequired }))}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filters.deliveryRequired
                ? 'bg-[#E6F4F1] text-blue-600 border border-blue-600/20'
                : 'bg-gray-50 text-gray-500 border border-[#E8E6DF]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery included</span>
            {filters.deliveryRequired && <Check className="w-3 h-3" />}
          </button>

          {/* Quantity Requirement Pill */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-[#E8E6DF] rounded-full text-xs text-gray-900">
            <span className="text-gray-500">Units needed:</span>
            <input
              type="number"
              min="1"
              max="500"
              value={filters.quantity}
              onChange={e => setFilters(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="w-12 bg-transparent font-bold text-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Expanded Filters Drawer (when toggled) */}
        {showFiltersModal && (
          <div className="mt-4 pt-4 border-t border-[#F4F3EF] grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Target Rental Dates
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-gray-900 focus:outline-none"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-[#E8E6DF] rounded-lg text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Max Daily Budget (₹{filters.maxBudget.toLocaleString('en-IN')})
              </label>
              <input
                type="range"
                min="100"
                max="25000"
                step="250"
                value={filters.maxBudget}
                onChange={e => setFilters(f => ({ ...f, maxBudget: parseInt(e.target.value) }))}
                className="w-full accent-[#0F766E] cursor-pointer"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  category: 'All',
                  quantity: 100,
                  location: 'All',
                  startDate: '2026-10-01',
                  endDate: '2026-10-04',
                  maxBudget: 15000,
                  deliveryRequired: true,
                  sortBy: 'best_match',
                })}
                className="w-full py-1.5 text-xs text-[#A15325] hover:bg-[#FEF7EE] rounded-lg transition-colors font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

      </section>

      {/* Results Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 pt-1 gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {scoredResources.length} inventory matches near you
          </h1>
          <p className="text-xs text-gray-500">
            Computed via real weighted compatibility across quantity, dates, and delivery
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <label htmlFor="sort-by-select" className="text-xs font-semibold text-gray-500">Sort by:</label>
          <div className="relative">
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
              className="appearance-none bg-white border border-[#E8E6DF] rounded-xl py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-900 soft-shadow focus:outline-none cursor-pointer"
            >
              <option value="best_match">Best match (%)</option>
              <option value="distance">Distance (nearest first)</option>
              <option value="price_asc">Price (low to high)</option>
              <option value="quantity">Quantity available</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 pointer-events-none absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Search Results List (Calm Hierarchy with Single Focal Point) */}
      <div className="space-y-4">
        {scoredResources.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-[#E8E6DF] soft-shadow space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No resources match current criteria</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your category, increasing the maximum budget, or choosing flexible date ranges.
            </p>
            <button
              onClick={() => setFilters(f => ({ ...f, category: 'All', location: 'All', maxBudget: 25000 }))}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
            >
              Clear filters
            </button>
          </div>
        ) : (
          scoredResources.map(({ resource, match }) => {
            const hasSurplus = match.remainingAvailableQuantity >= filters.quantity;
            return (
              <article
                key={resource.id}
                className="bg-white rounded-lg p-4 sm:p-5 soft-shadow hover:shadow-md transition-all duration-200 border border-[#E8E6DF] flex flex-col md:flex-row gap-5 items-start md:items-center justify-between group"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto flex-1">
                  
                  {/* Thumbnail */}
                  <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-[#F4F3EF] relative">
                    <img
                      src={resource.imageUrl}
                      alt={resource.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B1220]/80 text-white backdrop-blur-xs flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#E6F4F1]" />
                      {resource.distanceKm} km
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
                    
                    {/* Calm Match Pill with calculated match score */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-blue-600 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span className="text-xs font-bold">{match.score}% Match</span>
                      </div>

                      <span className="text-[11px] text-gray-500">
                        {resource.category}
                      </span>

                      {/* Quantity-Aware Availability Badge */}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        hasSurplus ? 'bg-[#EBF6F2] text-[#2A6D58]' : 'bg-[#FEF7EE] text-[#A15325]'
                      }`}>
                        {match.remainingAvailableQuantity} of {resource.quantityTotal} units free
                      </span>
                    </div>

                    <h2
                      onClick={() => onOpenResource(resource.id)}
                      className="text-base sm:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {resource.name}
                    </h2>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900">{resource.providerName}</span>
                      <span>•</span>
                      <span>{resource.location}</span>
                    </p>

                    {/* Weighted Match Explanation string with AI Deep Dive Button */}
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-blue-600 font-medium max-w-xl flex items-start gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{match.explanation}</span>
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatchResource(resource);
                          setSelectedMatchResult(match);
                          setAiMatchModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Nugen AI Breakdown</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-48 pt-3 md:pt-0 border-t sm:border-t-0 border-[#F4F3EF] gap-2.5 flex-shrink-0">
                  <div className="sm:text-right">
                    <span className="text-xl font-bold text-gray-900 font-mono">
                      ₹{resource.pricePerUnitPerDay.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-500 block">/ unit / day</span>
                    <span className="text-[10px] text-[#2A6D58] font-semibold block mt-0.5">
                      {resource.depositPercent}% refundable deposit
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onOpenResource(resource.id)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWeatherResource(resource);
                        setWeatherTwinModalOpen(true);
                      }}
                      title="Test how adverse weather affects availability and transit"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-semibold text-gray-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CloudRain className="w-3 h-3 text-blue-600" />
                      <span>Weather Twin</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Assurance banner */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#E6F4F1]/40 border border-blue-600/20 flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
          <span className="text-xs sm:text-sm">
            All Navi Mumbai regional inventory is insured through the VenueX Protected Peer Transfer guarantee with simulated Porter logistics.
          </span>
        </div>
      </div>

      {/* Nugen Aligned Intelligence Modals */}
      <AiMatchExplanationModal
        isOpen={aiMatchModalOpen}
        onClose={() => setAiMatchModalOpen(false)}
        resource={selectedMatchResource}
        matchResult={selectedMatchResult}
        requestedQty={filters.quantity}
        requestedDates={{ start: filters.startDate, end: filters.endDate }}
      />

      <WeatherDigitalTwinModal
        isOpen={weatherTwinModalOpen}
        onClose={() => {
          setWeatherTwinModalOpen(false);
          setSelectedWeatherResource(null);
        }}
        selectedResource={selectedWeatherResource}
      />

    </div>
  );
};
