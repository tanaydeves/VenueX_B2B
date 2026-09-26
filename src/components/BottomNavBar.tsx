import React from 'react';
import { Compass, Calendar, Layers, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate, unreadCount = 1 }) => {
  const { activeRole } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E6DF] py-2 px-3 flex justify-around items-center shadow-lg">
      {/* 1. Explore */}
      <button
        onClick={() => onNavigate('search')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
          currentView === 'search' || currentView === 'landing'
            ? 'bg-[#E6F4F1] text-[#0F766E] font-semibold'
            : 'text-[#64748B] hover:text-[#0F766E]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[11px] mt-0.5">Explore</span>
      </button>

      {/* 2. My Bookings (Seeker Hub) */}
      <button
        onClick={() => onNavigate('seeker-dashboard')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
          currentView === 'seeker-dashboard'
            ? 'bg-[#E6F4F1] text-[#0F766E] font-semibold'
            : 'text-[#64748B] hover:text-[#0F766E]'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[11px] mt-0.5">Bookings</span>
      </button>

      {/* 3. My Listings (Provider Hub) */}
      <button
        onClick={() => onNavigate('provider-dashboard')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all cursor-pointer ${
          currentView === 'provider-dashboard'
            ? 'bg-[#E6F4F1] text-[#0F766E] font-semibold'
            : 'text-[#64748B] hover:text-[#0F766E]'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[11px] mt-0.5">Listings</span>
      </button>

      {/* 4. Messages / Negotiations */}
      <button
        onClick={() => onNavigate(activeRole === 'PROVIDER' ? 'provider-dashboard' : 'seeker-dashboard')}
        className="flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[#64748B] hover:text-[#0F766E] relative transition-all cursor-pointer"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[11px] mt-0.5">Deals</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#0F766E]"></span>
        )}
      </button>
    </nav>
  );
};
