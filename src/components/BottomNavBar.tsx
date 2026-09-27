import React from 'react';
import { Compass, Calendar, Layers, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface BottomNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate, unreadCount = 1 }) => {
  const { activeRole } = useAuth();

  const getButtonClass = (viewNames: string[]) => {
    const isActive = viewNames.includes(currentView);
    return `relative flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all cursor-pointer ${
      isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
    }`;
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 glass rounded-3xl py-2 px-3 flex justify-around items-center">
      {/* 1. Explore */}
      <button
        onClick={() => onNavigate('search')}
        className={getButtonClass(['search', 'landing'])}
      >
        {['search', 'landing'].includes(currentView) && (
          <motion.div 
            layoutId="bottom-nav-indicator"
            className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Compass className="w-6 h-6" />
        <span className="text-[10px] font-medium mt-1">Explore</span>
      </button>

      {/* 2. My Bookings (Seeker Hub) */}
      <button
        onClick={() => onNavigate('seeker-dashboard')}
        className={getButtonClass(['seeker-dashboard'])}
      >
        {currentView === 'seeker-dashboard' && (
          <motion.div 
            layoutId="bottom-nav-indicator"
            className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Calendar className="w-6 h-6" />
        <span className="text-[10px] font-medium mt-1">Bookings</span>
      </button>

      {/* 3. My Listings (Provider Hub) */}
      <button
        onClick={() => onNavigate('provider-dashboard')}
        className={getButtonClass(['provider-dashboard'])}
      >
        {currentView === 'provider-dashboard' && (
          <motion.div 
            layoutId="bottom-nav-indicator"
            className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Layers className="w-6 h-6" />
        <span className="text-[10px] font-medium mt-1">Listings</span>
      </button>

      {/* 4. Messages / Negotiations */}
      <button
        onClick={() => onNavigate(activeRole === 'PROVIDER' ? 'provider-dashboard' : 'seeker-dashboard')}
        className="relative flex flex-col items-center justify-center px-4 py-2 rounded-2xl text-gray-500 hover:text-indigo-600 transition-all cursor-pointer"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="text-[10px] font-medium mt-1">Deals</span>
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-3 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"
          />
        )}
      </button>
    </nav>
  );
};
