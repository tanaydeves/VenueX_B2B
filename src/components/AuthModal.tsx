import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, X, Check, ArrowRight, ShieldCheck, Mail, Lock, MapPin, Briefcase } from 'lucide-react';
import { BusinessRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose }) => {
  const { login, signup, switchUser, allBusinesses } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<'Hotel' | 'Catering Company' | 'Banquet Venue' | 'Event Production'>('Hotel');
  const [location, setLocation] = useState('Vashi, Navi Mumbai');
  const [role, setRole] = useState<BusinessRole>('BOTH');
  const [phone, setPhone] = useState('+91 98200 12345');
  const [gstin, setGstin] = useState('27AABCU9876E1Z5');
  const [signupError, setSignupError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = await login(loginEmail);
    if (success) {
      onClose();
    } else {
      setLoginError('No business found with this email. Try selecting a demo profile below.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!businessName.trim() || !email.trim()) {
      setSignupError('Please provide a business name and email address.');
      return;
    }

    try {
      await signup({
        name: businessName,
        email,
        category,
        location,
        distanceFromUserKm: 3.5,
        role,
        phone,
        gstin,
        avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80',
      });
      onClose();
    } catch {
      setSignupError('Failed to create account. Please try again.');
    }
  };

  const handleQuickDemoSelect = async (bizId: string) => {
    await switchUser(bizId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8E6DF] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64748B] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              {mode === 'login' ? 'Sign In to VenueX' : 'Create Business Profile'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {mode === 'login' 
                ? 'Access your hospitality bookings and resource catalog' 
                : 'Join the verified peer exchange network in Navi Mumbai'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#F4F3EF] p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-white text-[#1E293B] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-white text-[#1E293B] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Create Profile
          </button>
        </div>

        {/* Form Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Business Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. operations@grandhorizon.in"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Quick Demo Switcher Strip */}
            <div className="pt-4 border-t border-[#F4F3EF]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 text-center">
                Or One-Click Demo Login
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {allBusinesses.map(biz => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(biz.id)}
                    className="p-2.5 bg-[#FAF9F6] hover:bg-[#E6F4F1] border border-[#E8E6DF] hover:border-[#0F766E]/30 rounded-xl text-left transition-colors cursor-pointer flex flex-col"
                  >
                    <span className="text-xs font-bold text-[#1E293B] truncate">{biz.name}</span>
                    <span className="text-[10px] text-[#64748B]">
                      Role: {biz.role} · {biz.location.split(',')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Business Legal / Brand Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Heritage Banquets"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Banquet Venue">Banquet Venue</option>
                  <option value="Catering Company">Catering Company</option>
                  <option value="Event Production">Event Production</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Primary Location (Navi Mumbai)
                </label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Vashi, Navi Mumbai">Vashi, Navi Mumbai</option>
                  <option value="CBD Belapur, Navi Mumbai">CBD Belapur, Navi Mumbai</option>
                  <option value="Kharghar, Navi Mumbai">Kharghar, Navi Mumbai</option>
                  <option value="Panvel, Navi Mumbai">Panvel, Navi Mumbai</option>
                  <option value="Seawoods, Navi Mumbai">Seawoods, Navi Mumbai</option>
                  <option value="Airoli, Navi Mumbai">Airoli, Navi Mumbai</option>
                </select>
              </div>
            </div>

            {/* Role Selection (Provider / Seeker / Both) */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Marketplace Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BOTH', 'PROVIDER', 'SEEKER'] as BusinessRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      role === r 
                        ? 'bg-[#E6F4F1] border-[#0F766E] text-[#0F766E]' 
                        : 'bg-[#FAF9F6] border-[#E8E6DF] text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {r === 'BOTH' ? 'Both (Provider & Seeker)' : r === 'PROVIDER' ? 'Provider (List Only)' : 'Seeker (Rent Only)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@hotel.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                GSTIN / Trade License (Simulated)
              </label>
              <input
                type="text"
                placeholder="27AABCV1234F1Z8"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:border-[#0F766E] focus:outline-none font-mono"
              />
            </div>

            {signupError && (
              <p className="text-xs text-red-600 font-medium">{signupError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              Complete Registration & Access Network
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
