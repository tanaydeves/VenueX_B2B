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
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginGstin, setLoginGstin] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRememberMe, setLoginRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    if (!isValidGstinFormat(loginGstin)) {
      setLoginError('Please enter a valid 15-character GSTIN format.');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError('Please enter your password.');
      return;
    }

    const res = await login(loginEmail, loginGstin, loginPassword, loginRememberMe);
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMessage('Please enter your registered email address.');
      return;
    }
    // Mocking an API call
    setForgotMessage('If an account exists with this email, a recovery link has been sent to it.');
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

  const handleQuickDemoSelect = async (biz: { id: string; email: string; gstin: string }) => {
    setLoginEmail(biz.email);
    setLoginGstin(biz.gstin);
    await switchUser(biz.id);
    onClose();
  };

  const isValidGstinFormat = (val: string) => {
    return val.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8E6DF] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-500 hover:bg-[#F4F3EF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'login' ? 'Sign In to VenueX' : mode === 'forgot' ? 'Reset Password' : 'Create Business Profile'}
            </h2>
            <p className="text-xs text-gray-500">
              {mode === 'login' 
                ? 'Dual Verification Sign In (Work Email + 15-Digit GSTIN)' 
                : mode === 'forgot'
                ? 'Enter your work email to receive a recovery link'
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
              mode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Profile
          </button>
        </div>

        {/* Form Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Business Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. operations@grandhorizon.in"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[#E8E6DF] rounded-xl text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-900">
                  GSTIN / Trade License Number <span className="text-red-500">*</span>
                </label>
                {loginGstin && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isValidGstinFormat(loginGstin)
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isValidGstinFormat(loginGstin) ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Valid GSTIN Format (State {loginGstin.substring(0, 2)})
                      </>
                    ) : (
                      '15-Char Standard GSTIN Format'
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="e.g. 27AABCG1234F1Z8"
                  value={loginGstin}
                  onChange={e => setLoginGstin(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[#E8E6DF] rounded-xl text-sm font-mono text-gray-900 focus:border-blue-600 focus:outline-none uppercase"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Mandatory dual authentication: GSTIN must match the registered business work email.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-900">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setLoginError(''); }}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[#E8E6DF] rounded-xl text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={loginRememberMe}
                onChange={e => setLoginRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-50 border-[#E8E6DF] rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-gray-900 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign In with Dual Verification
            </button>

            {/* Quick Demo Switcher Strip */}
            <div className="pt-4 border-t border-[#F4F3EF]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 text-center">
                Or One-Click Demo Login (Auto-fills Email & GSTIN)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {allBusinesses.map(biz => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(biz)}
                    className="p-2.5 bg-gray-50 hover:bg-[#E6F4F1] border border-[#E8E6DF] hover:border-blue-600/30 rounded-xl text-left transition-colors cursor-pointer flex flex-col"
                  >
                    <span className="text-xs font-bold text-gray-900 truncate">{biz.name}</span>
                    <span className="text-[10px] text-gray-500 truncate">{biz.email}</span>
                    <span className="text-[10px] font-mono font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      GSTIN: {biz.gstin}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : mode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Business Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. operations@grandhorizon.in"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[#E8E6DF] rounded-xl text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {forgotMessage && (
              <div className={`p-3 border rounded-xl text-xs font-medium ${
                forgotMessage.includes('sent') 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {forgotMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Send Recovery Link
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setForgotMessage(''); }}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Business Legal / Brand Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Heritage Banquets"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Banquet Venue">Banquet Venue</option>
                  <option value="Catering Company">Catering Company</option>
                  <option value="Event Production">Event Production</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Primary Location (Navi Mumbai)
                </label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
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
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
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
                        ? 'bg-[#E6F4F1] border-blue-600 text-blue-600' 
                        : 'bg-gray-50 border-[#E8E6DF] text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {r === 'BOTH' ? 'Both (Provider & Seeker)' : r === 'PROVIDER' ? 'Provider (List Only)' : 'Seeker (Rent Only)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@hotel.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                GSTIN / Trade License (Simulated)
              </label>
              <input
                type="text"
                placeholder="27AABCV1234F1Z8"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-[#E8E6DF] rounded-xl text-xs text-gray-900 focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>

            {signupError && (
              <p className="text-xs text-red-600 font-medium">{signupError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              Complete Registration & Access Network
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
