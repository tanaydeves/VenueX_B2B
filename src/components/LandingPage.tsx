import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Star, 
  Layers, 
  Handshake, 
  Check 
} from 'lucide-react';
import { db } from '../db/database';
import { ResourceListing } from '../types';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenResource: (resourceId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenResource }) => {
  const [featuredResources, setFeaturedResources] = useState<ResourceListing[]>([]);

  useEffect(() => {
    db.getResources().then(list => setFeaturedResources(list.slice(0, 4)));
  }, []);

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="text-center pt-8 sm:pt-14 max-w-3xl mx-auto px-4">
        {/* Calm Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4F1] text-[#0F766E] text-xs font-semibold mb-6 soft-shadow border border-[#0F766E]/15">
          <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
          <span>Verified Hospitality Network · Mumbai & Navi Mumbai</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight [text-wrap:balance]">
          Turn Idle Hospitality Resources Into Revenue.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
          Connect with nearby hotels, caterers, and event venues to rent banquet chairs, tables, commercial kitchen equipment, and transport when you need them temporarily.
        </p>

        {/* Dual Call-to-Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('search')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Find Resources</span>
          </button>

          <button
            onClick={() => onNavigate('provider-dashboard', { openAddModal: true })}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E6DF] text-[#1E293B] text-sm sm:text-base font-semibold flex items-center justify-center gap-2 soft-shadow transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#A15325]" />
            <span>List a Resource</span>
          </button>
        </div>

        {/* Quick Search Preview Pill */}
        <div className="mt-10 p-2 sm:p-3 bg-white rounded-2xl border border-[#E8E6DF] soft-shadow max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2 bg-[#FAF9F6] rounded-xl text-left">
            <Search className="w-4 h-4 text-[#0F766E] shrink-0" />
            <input 
              type="text" 
              readOnly 
              onClick={() => onNavigate('search')}
              placeholder="e.g. 200 Chiavari chairs, Rational combi oven, Belapur..." 
              className="bg-transparent text-sm text-[#1E293B] w-full focus:outline-none cursor-pointer placeholder:text-[#94A3B8]"
            />
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F766E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0b5751] transition-colors whitespace-nowrap cursor-pointer"
          >
            Explore
          </button>
        </div>
      </section>

      {/* Social Proof Numbers */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8E6DF] soft-shadow grid grid-cols-3 divide-x divide-[#E8E6DF]/80 text-center">
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#0F766E] font-mono tabular-nums">1,400+</div>
            <div className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">Hospitality Venues</div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-mono tabular-nums">₹3.8 Cr</div>
            <div className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">Shared Safely</div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#2A6D58] font-mono tabular-nums">98.4%</div>
            <div className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* 2. Simple 3-Step Visual: (List → Match → Complete) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center sm:text-left sm:flex sm:justify-between sm:items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              EFFORTLESS LOGISTICS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mt-1">
              How VenueX Works
            </h2>
          </div>
          <p className="text-sm text-[#64748B] mt-2 sm:mt-0">
            Engineered exclusively for hotel directors, banquet captains, and executive chefs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: List */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E6DF] soft-shadow flex flex-col justify-between space-y-5 hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[#94A3B8]">01</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] mb-2">1. List what is idle</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Add extra banquet chairs, combi ovens, or delivery vehicles with your daily rate, deposit %, and available date window in minutes.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F4F3EF] flex items-center gap-1.5 text-xs text-[#0F766E] font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Full control over pricing & calendar</span>
            </div>
          </div>

          {/* Step 2: Match */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E6DF] soft-shadow flex flex-col justify-between space-y-5 hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#FEF7EE] text-[#A15325] flex items-center justify-center font-bold">
                <Handshake className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[#94A3B8]">02</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] mb-2">2. Match with peers</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Nearby verified hotels and caterers find your gear when facing surge demand. Chat in real-time, customize counts, and finalize structured deals.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F4F3EF] flex items-center gap-1.5 text-xs text-[#A15325] font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Average 3.5 km exchange distance</span>
            </div>
          </div>

          {/* Step 3: Complete */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E6DF] soft-shadow flex flex-col justify-between space-y-5 hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#EBF6F2] text-[#2A6D58] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[#94A3B8]">03</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] mb-2">3. Complete & Dispatch</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Pay a simulated security deposit, lock inventory availability, and track dispatch status seamlessly powered by Porter logistics.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F4F3EF] flex items-center gap-1.5 text-xs text-[#2A6D58] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected payments & 100% deposit return</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Resources Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">Featured Resources in Navi Mumbai</h2>
            <p className="text-sm text-[#64748B]">Ready for immediate reservation from vetted hospitality peers</p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-sm font-semibold text-[#0F766E] hover:text-[#0b5751] flex items-center gap-1 cursor-pointer"
          >
            <span>View all inventory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredResources.map(res => (
            <article
              key={res.id}
              onClick={() => onOpenResource(res.id)}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8E6DF] soft-shadow hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-[#F4F3EF]">
                  <img
                    src={res.imageUrl}
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-[#1E293B] shadow-xs">
                    {res.quantityTotal} units
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1E293B]/80 text-white backdrop-blur-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E6F4F1]" />
                    {res.location.split(',')[0]}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-wide">
                    {res.category}
                  </div>
                  <h3 className="text-sm font-bold text-[#1E293B] group-hover:text-[#0F766E] transition-colors line-clamp-2">
                    {res.name}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[#F4F3EF] flex items-center justify-between mt-2">
                <div>
                  <span className="text-[11px] text-[#94A3B8] block">Daily Rate</span>
                  <span className="text-base font-bold text-[#1E293B] font-mono">
                    ₹{res.pricePerUnitPerDay.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-[#64748B]">/day</span>
                  </span>
                </div>
                <span className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Protection & Guarantee Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#E6F4F1]/60 rounded-3xl p-6 sm:p-8 border border-[#0F766E]/20 soft-shadow flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#0F766E] text-xs font-semibold border border-[#0F766E]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VenueX Protected Transfer Guarantee</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1E293B]">
              Every rental includes refundable security deposits and peer verification.
            </h3>
            <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Maintain full oversight over who accesses your hospitality assets. All transactions are securely held until dockside inspection, with simulated delivery powered by Porter.
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="px-6 py-3 rounded-xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0b5751] transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Start Exploring
          </button>
        </div>
      </section>

    </div>
  );
};
