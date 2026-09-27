import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ChevronDown, 
  LogOut, 
  RotateCcw, 
  ArrowLeftRight,
  ShieldCheck,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { db } from '../db/database';

interface TopNavBarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenWeatherTwin?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentView, onNavigate, onOpenAuth, onOpenWeatherTwin }) => {
  const { currentUser, activeRole, toggleActiveRole, switchUser, allBusinesses, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleResetData = async () => {
    if (confirm('Reset database to realistic Navi Mumbai / Panvel demo seed data?')) {
      setResetting(true);
      await db.resetToSeed();
      setResetting(false);
      setProfileDropdownOpen(false);
    }
  };

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'search', label: 'Explore' },
    { id: 'seeker-dashboard', label: 'Seeker Hub' },
    { id: 'provider-dashboard', label: 'Provider Hub' }
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`relative flex items-center justify-between rounded-2xl transition-all duration-300 ${scrolled ? 'glass px-6 py-3 shadow-lg' : 'bg-transparent px-4 py-2'}`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 block font-outfit">
                  VenueX
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentView === link.id ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {currentView === link.id && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}
            {onOpenWeatherTwin && (
              <button 
                onClick={onOpenWeatherTwin}
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>Weather Twin</span>
              </button>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                {activeRole === 'SEEKER' ? (
                  <button
                    onClick={() => onNavigate('search')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-sm font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    Find Resources
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('provider-dashboard', { openAddModal: true })}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-sm font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    + Add Resource
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200/50 shadow-inner">
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 glass rounded-2xl py-3 z-50 origin-top-right"
                      >
                        <div className="px-5 py-3 border-b border-gray-100">
                          <p className="text-xs text-indigo-500 font-semibold tracking-wider uppercase mb-1">Active Business</p>
                          <p className="text-base font-bold text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                            <span>{currentUser.location}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-indigo-600 font-semibold">{currentUser.role}</span>
                          </p>
                        </div>

                        <div className="px-3 py-2 border-b border-gray-100">
                          <button
                            onClick={() => {
                              toggleActiveRole();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <ArrowLeftRight className="w-4 h-4" />
                              Toggle View Mode
                            </span>
                            <span className="bg-white px-2 py-1 rounded shadow-sm text-xs">
                              {activeRole}
                            </span>
                          </button>
                        </div>

                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
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
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                  biz.id === currentUser.id 
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                    : 'hover:bg-gray-50 text-gray-600'
                                }`}
                              >
                                <span className="truncate pr-2">{biz.name}</span>
                                <span className="text-xs text-gray-400">{biz.location.split(',')[0]}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="px-3 py-2">
                          <button
                            onClick={handleResetData}
                            disabled={resetting}
                            className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset Demo Data</span>
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setProfileDropdownOpen(false);
                              onOpenAuth('login');
                            }}
                            className="w-full px-3 py-2 mt-1 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 cursor-pointer">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </motion.div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t mt-2"
          >
            <div className="px-4 py-4 space-y-2">
               {navLinks.map((link) => (
                  <button 
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium cursor-pointer ${
                      currentView === link.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    {link.label}
                  </button>
               ))}
               {!currentUser && (
                 <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-center font-semibold text-gray-700 cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }}
                      className="px-4 py-3 rounded-xl bg-indigo-600 text-white text-center font-semibold cursor-pointer"
                    >
                      Sign Up
                    </button>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

