import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-24 pb-24 pt-10">
      
      {/* 1. Hero Section */}
      <section className="text-center pt-8 sm:pt-14 max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-indigo-500/20 text-indigo-700 text-xs sm:text-sm font-semibold mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Verified Hospitality Network · Mumbai & Navi Mumbai</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight [text-wrap:balance] font-outfit"
        >
          Turn Idle Assets Into <span className="text-gradient">Revenue</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed [text-wrap:balance]"
        >
          Connect with nearby hotels, caterers, and event venues to rent banquet chairs, tables, commercial kitchen equipment, and transport when you need them temporarily.
        </motion.p>

        {/* Dual Call-to-Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onNavigate('search')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 text-white text-base font-semibold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 transition-all duration-300 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>Explore Resources</span>
          </button>

          <button
            onClick={() => onNavigate('provider-dashboard', { openAddModal: true })}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass hover:bg-white/90 text-gray-900 text-base font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <span>List a Resource</span>
          </button>
        </motion.div>

        {/* Quick Search Preview Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 p-3 glass rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 items-center"
        >
          <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-white/50 rounded-xl text-left border border-gray-100">
            <Search className="w-5 h-5 text-indigo-500 shrink-0" />
            <input 
              type="text" 
              readOnly 
              onClick={() => onNavigate('search')}
              placeholder="e.g. 200 Chiavari chairs, Rational combi oven, Belapur..." 
              className="bg-transparent text-base text-gray-900 w-full focus:outline-none cursor-pointer placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Search Now
          </button>
        </motion.div>
      </section>

      {/* Social Proof Numbers */}
      <section className="max-w-5xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200/50 text-center gap-6 sm:gap-0"
        >
          <div className="px-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700 font-mono tabular-nums">1,400+</div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Hospitality Venues</div>
          </div>
          <div className="px-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-mono tabular-nums">₹3.8 Cr</div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Shared Safely</div>
          </div>
          <div className="px-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums">98.4%</div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Satisfaction Rate</div>
          </div>
        </motion.div>
      </section>

      {/* 2. Simple 3-Step Visual */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Effortless Logistics
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 font-outfit">
            How VenueX Works
          </h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Step 1: List */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <span className="text-4xl font-bold text-gray-100/50">01</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-outfit">List what is idle</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Add extra banquet chairs, combi ovens, or delivery vehicles with your daily rate, deposit %, and available date window in minutes.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-gray-100 flex items-center gap-2 text-sm text-indigo-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full control over pricing</span>
            </div>
          </motion.div>

          {/* Step 2: Match */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Handshake className="w-7 h-7" />
              </div>
              <span className="text-4xl font-bold text-gray-100/50">02</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-outfit">Match with peers</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Nearby verified hotels and caterers find your gear when facing surge demand. Chat in real-time, customize counts, and finalize deals.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-gray-100 flex items-center gap-2 text-sm text-purple-600 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>Avg 3.5 km exchange distance</span>
            </div>
          </motion.div>

          {/* Step 3: Complete */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-4xl font-bold text-gray-100/50">03</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-outfit">Complete & Dispatch</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Pay a simulated security deposit, lock inventory availability, and track dispatch status seamlessly powered by Porter logistics.
              </p>
            </div>
            <div className="pt-5 mt-5 border-t border-gray-100 flex items-center gap-2 text-sm text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% deposit return guarantee</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Featured Resources Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-outfit">Featured Inventory</h2>
            <p className="text-base text-gray-500 mt-1">Ready for immediate reservation from vetted hospitality peers</p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer bg-indigo-50 px-4 py-2 rounded-full transition-colors"
          >
            <span>View all inventory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredResources.map(res => (
            <motion.article
              variants={itemVariants}
              key={res.id}
              onClick={() => onOpenResource(res.id)}
              className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer group border-white/40"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={res.imageUrl}
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-gray-900 shadow-sm">
                    {res.quantityTotal} units
                  </span>
                  <span className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg text-xs font-medium glass-dark text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    {res.location.split(',')[0]}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    {res.category}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 font-outfit leading-snug">
                    {res.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-gray-100/50 flex items-center justify-between mt-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Daily Rate</span>
                  <span className="text-xl font-extrabold text-gray-900 font-mono">
                    ₹{res.pricePerUnitPerDay.toLocaleString('en-IN')}
                    <span className="text-xs font-medium text-gray-500">/day</span>
                  </span>
                </div>
                <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* 4. Protection & Guarantee Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass border border-indigo-200 shadow-2xl shadow-indigo-500/10 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg transform rotate-[-10deg]">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <div className="relative z-10 space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-indigo-600 text-xs font-bold border border-indigo-100 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>VenueX Protected Transfer</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-outfit">
              Every rental includes refundable security deposits and peer verification.
            </h3>
            <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
              Maintain full oversight over who accesses your hospitality assets. All transactions are securely held until dockside inspection, with simulated delivery powered by Porter.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => onNavigate('search')}
              className="px-8 py-4 rounded-2xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer whitespace-nowrap"
            >
              Start Exploring
            </button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};
