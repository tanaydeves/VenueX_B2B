import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, initializeDatabase, subscribeToDatabase } from '../db/database';
import { BusinessProfile, BusinessRole } from '../types';

interface AuthContextType {
  currentUser: BusinessProfile | null;
  activeRole: 'SEEKER' | 'PROVIDER';
  allBusinesses: BusinessProfile[];
  login: (email: string, gstin: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (profile: Omit<BusinessProfile, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>) => Promise<BusinessProfile>;
  logout: () => void;
  switchUser: (businessId: string) => Promise<void>;
  toggleActiveRole: () => void;
  setActiveRole: (role: 'SEEKER' | 'PROVIDER') => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<BusinessProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'SEEKER' | 'PROVIDER'>('SEEKER');
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async () => {
    await initializeDatabase();
    const businesses = await db.getBusinesses();
    setAllBusinesses(businesses);

    const savedUserId = sessionStorage.getItem('venuex_active_user_id') || localStorage.getItem('venuex_active_user_id');
    const matchedUser = businesses.find(b => b.id === savedUserId);

    if (matchedUser) {
      setCurrentUser(matchedUser);
      // Auto-set role if not both
      if (matchedUser.role === 'PROVIDER') setActiveRole('PROVIDER');
      else if (matchedUser.role === 'SEEKER') setActiveRole('SEEKER');
    } else if (businesses.length > 0) {
      // Default to Grand Horizon Hotel for seamless immediate exploration
      const defaultUser = businesses[0];
      setCurrentUser(defaultUser);
      localStorage.setItem('venuex_active_user_id', defaultUser.id);
      setActiveRole('SEEKER');
    }

    const savedRole = (sessionStorage.getItem('venuex_active_role') || localStorage.getItem('venuex_active_role')) as 'SEEKER' | 'PROVIDER' | null;
    if (savedRole) {
      setActiveRole(savedRole);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();
    const unsubscribe = subscribeToDatabase(() => {
      db.getBusinesses().then(list => setAllBusinesses(list));
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, gstin: string, password?: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    const businesses = await db.getBusinesses();
    const cleanEmail = email.trim().toLowerCase();
    const cleanGstin = gstin.trim().toUpperCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered Business Work Email.' };
    }
    if (!cleanGstin) {
      return { success: false, error: 'Please enter your 15-character GSTIN / Trade License Number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const matchedEmailBiz = businesses.find(b => b.email.toLowerCase() === cleanEmail);
    if (!matchedEmailBiz) {
      return { success: false, error: 'No registered business account found matching this Work Email.' };
    }

    // Check Password
    if (matchedEmailBiz.password) {
      if (matchedEmailBiz.password !== password) {
        return { success: false, error: 'Incorrect password.' };
      }
    } else {
      // Default fallback for legacy accounts without a password
      if (password !== 'password123') {
        return { success: false, error: 'Incorrect password. (Hint: default is password123)' };
      }
    }

    // Check GSTIN Dual Verification
    if (matchedEmailBiz.gstin.trim().toUpperCase() !== cleanGstin) {
      return { 
        success: false, 
        error: `Dual verification failed: Entered GSTIN (${cleanGstin}) does not match the GSTIN registered on file for ${matchedEmailBiz.name}.` 
      };
    }

    setCurrentUser(matchedEmailBiz);
    
    if (rememberMe) {
      localStorage.setItem('venuex_active_user_id', matchedEmailBiz.id);
      sessionStorage.removeItem('venuex_active_user_id');
    } else {
      sessionStorage.setItem('venuex_active_user_id', matchedEmailBiz.id);
      localStorage.removeItem('venuex_active_user_id');
    }

    if (matchedEmailBiz.role === 'PROVIDER') setActiveRole('PROVIDER');
    else if (matchedEmailBiz.role === 'SEEKER') setActiveRole('SEEKER');
    return { success: true };
  };

  const signup = async (profileData: Omit<BusinessProfile, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>): Promise<BusinessProfile> => {
    const newProfile: BusinessProfile = {
      ...profileData,
      id: `biz-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    };
    await db.saveBusiness(newProfile);
    setCurrentUser(newProfile);
    sessionStorage.setItem('venuex_active_user_id', newProfile.id);
    localStorage.removeItem('venuex_active_user_id');
    setActiveRole(newProfile.role === 'PROVIDER' ? 'PROVIDER' : 'SEEKER');
    return newProfile;
  };

  const logout = () => {
    localStorage.removeItem('venuex_active_user_id');
    sessionStorage.removeItem('venuex_active_user_id');
    localStorage.removeItem('venuex_active_role');
    sessionStorage.removeItem('venuex_active_role');
    setCurrentUser(null);
  };

  const switchUser = async (businessId: string) => {
    const biz = await db.getBusinessById(businessId);
    if (biz) {
      setCurrentUser(biz);
      
      const isPersistent = !!localStorage.getItem('venuex_active_user_id');
      if (isPersistent) {
        localStorage.setItem('venuex_active_user_id', biz.id);
      } else {
        sessionStorage.setItem('venuex_active_user_id', biz.id);
      }

      if (biz.role === 'PROVIDER') {
        setActiveRole('PROVIDER');
        if (isPersistent) localStorage.setItem('venuex_active_role', 'PROVIDER');
        else sessionStorage.setItem('venuex_active_role', 'PROVIDER');
      } else if (biz.role === 'SEEKER') {
        setActiveRole('SEEKER');
        if (isPersistent) localStorage.setItem('venuex_active_role', 'SEEKER');
        else sessionStorage.setItem('venuex_active_role', 'SEEKER');
      }
    }
  };

  const toggleActiveRole = () => {
    setActiveRole(prev => {
      const next = prev === 'SEEKER' ? 'PROVIDER' : 'SEEKER';
      const isPersistent = !!localStorage.getItem('venuex_active_user_id');
      if (isPersistent) localStorage.setItem('venuex_active_role', next);
      else sessionStorage.setItem('venuex_active_role', next);
      return next;
    });
  };

  const handleSetActiveRole = (role: 'SEEKER' | 'PROVIDER') => {
    setActiveRole(role);
    const isPersistent = !!localStorage.getItem('venuex_active_user_id');
    if (isPersistent) localStorage.setItem('venuex_active_role', role);
    else sessionStorage.setItem('venuex_active_role', role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        allBusinesses,
        login,
        signup,
        logout,
        switchUser,
        toggleActiveRole,
        setActiveRole: handleSetActiveRole,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
