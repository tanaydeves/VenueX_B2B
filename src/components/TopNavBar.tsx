import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ChevronDown, 
  LogOut, 
  RotateCcw, 
  Sparkles, 
  User, 
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MessageSquare
} from 'lucide-react';
import { db } from '../db/database';

interface TopNavBarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { currentUser, activeRole, toggleActiveRole, switchUser, allBusinesses, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm('Reset database to realistic Navi Mumbai / Panvel demo seed data?')) {
      setResetting(true);
      await db.resetToSeed();
      setResetting(false);
      setProfileDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E8E6DF] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark (Clean single element, no cluttered subtitle badges) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0b5751] transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1E293B] block font-['Plus_Jakarta_Sans']">
                VenueX
              </span>
            </div>
          </button>

          {/* Current Business Indicator */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 pl-3 ml-2 border-l border-[#E8E6DF] text-xs text-[#64748B]">
              <span className="w-2 h-2 rounded-full bg-[#479E82]"></span>
              <span className="font-semibold text-[#1E293B] truncate max-w-[180px]">{currentUser.name}</span>
              <span className="text-[#94A3B8]">({currentUser.location.split(',')[0]})</span>
            </div>
          )}
        </div>

        {/* Zone 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#475569]">
          <button 
            onClick={() => onNavigate('landing')}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'landing' ? 'text-[#0F766E] font-semibold' : 'hover:text-[#0F766E]'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('search')}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'search' ? 'text-[#0F766E] font-semibold' : 'hover:text-[#0F766E]'
            }`}
          >
            Explore Inventory
          </button>
          <button 
            onClick={() => onNavigate('seeker-dashboard')}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'seeker-dashboard' ? 'text-[#0F766E] font-semibold' : 'hover:text-[#0F766E]'
            }`}
          >
            Seeker Hub
          </button>
          <button 
            onClick={() => onNavigate('provider-dashboard')}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'provider-dashboard' ? 'text-[#0F766E] font-semibold' : 'hover:text-[#0F766E]'
            }`}
          >
            Provider Hub
          </button>
        </nav>

        {/* Zone 3: Actions & Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Role Switcher Button if business is BOTH */}
              {currentUser.role === 'BOTH' && (
                <button
                  onClick={toggleActiveRole}
                  title="Switch operational perspective"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E6F4F1] text-[#0F766E] hover:bg-[#d5eee8] transition-colors border border-[#0F766E]/20"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Viewing as {activeRole === 'SEEKER' ? 'Seeker' : 'Provider'}</span>
                </button>
              )}

              {/* Primary Fast Action */}
              {activeRole === 'SEEKER' ? (
                <button
                  onClick={() => onNavigate('search')}
                  className="px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 whitespace-nowrap"
                >
                  Find Resources
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('provider-dashboard', { openAddModal: true })}
                  className="px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 whitespace-nowrap"
                >
                  + Add Resource
                </button>
              )}

              {/* Profile / Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F4F3EF] transition-colors border border-[#E8E6DF]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 text-[#0F766E] font-bold text-xs flex items-center justify-center">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E6DF] py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-[#F4F3EF]">
                      <p className="text-xs text-[#94A3B8] font-medium">Logged in business</p>
                      <p className="text-sm font-bold text-[#1E293B] truncate">{currentUser.name}</p>
                      <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                        <span>{currentUser.location}</span>
                        <span>•</span>
                        <span className="text-[#0F766E] font-semibold">{currentUser.role}</span>
                      </p>
                    </div>

                    {/* Switch role toggle on mobile */}
                    {currentUser.role === 'BOTH' && (
                      <div className="px-4 py-2 border-b border-[#F4F3EF]">
                        <button
                          onClick={() => {
                            toggleActiveRole();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#FAF9F6] text-xs font-semibold text-[#0F766E] hover:bg-[#E6F4F1] transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            Toggle Seeker / Provider
                          </span>
                          <span className="bg-white px-2 py-0.5 rounded shadow-2xs">
                            Active: {activeRole}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Demo Account Quick Switcher */}
                    <div className="px-4 py-2 border-b border-[#F4F3EF]">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                        Switch Demo Business
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {allBusinesses.map(biz => (
                          <button
                            key={biz.id}
                            onClick={() => {
                              switchUser(biz.id);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              biz.id === currentUser.id 
                                ? 'bg-[#E6F4F1] text-[#0F766E] font-semibold' 
                                : 'hover:bg-[#FAF9F6] text-[#475569]'
                            }`}
                          >
                            <span className="truncate pr-2">{biz.name}</span>
                            <span className="text-[10px] text-[#94A3B8]">{biz.location.split(',')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Database Reset Action */}
                    <div className="px-2 pt-1 border-b border-[#F4F3EF]">
                      <button
                        onClick={handleResetData}
                        disabled={resetting}
                        className="w-full px-3 py-2 text-left text-xs text-[#A15325] hover:bg-[#FEF7EE] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Seed Data (Navi Mumbai)</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="px-2 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          onOpenAuth('login');
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#0F766E] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
