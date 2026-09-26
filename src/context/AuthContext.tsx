import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, initializeDatabase, subscribeToDatabase } from '../db/database';
import { BusinessProfile, BusinessRole } from '../types';

interface AuthContextType {
  currentUser: BusinessProfile | null;
  activeRole: 'SEEKER' | 'PROVIDER';
  allBusinesses: BusinessProfile[];
  login: (email: string, password?: string) => Promise<boolean>;
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

    const savedUserId = localStorage.getItem('venuex_active_user_id');
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

    const savedRole = localStorage.getItem('venuex_active_role') as 'SEEKER' | 'PROVIDER' | null;
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

  const login = async (email: string): Promise<boolean> => {
    const businesses = await db.getBusinesses();
    const found = businesses.find(b => b.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('venuex_active_user_id', found.id);
      if (found.role === 'PROVIDER') setActiveRole('PROVIDER');
      else if (found.role === 'SEEKER') setActiveRole('SEEKER');
      return true;
    }
    return false;
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
    localStorage.setItem('venuex_active_user_id', newProfile.id);
    setActiveRole(newProfile.role === 'PROVIDER' ? 'PROVIDER' : 'SEEKER');
    return newProfile;
  };

  const logout = () => {
    localStorage.removeItem('venuex_active_user_id');
    setCurrentUser(null);
  };

  const switchUser = async (businessId: string) => {
    const biz = await db.getBusinessById(businessId);
    if (biz) {
      setCurrentUser(biz);
      localStorage.setItem('venuex_active_user_id', biz.id);
      if (biz.role === 'PROVIDER') {
        setActiveRole('PROVIDER');
        localStorage.setItem('venuex_active_role', 'PROVIDER');
      } else if (biz.role === 'SEEKER') {
        setActiveRole('SEEKER');
        localStorage.setItem('venuex_active_role', 'SEEKER');
      }
    }
  };

  const toggleActiveRole = () => {
    setActiveRole(prev => {
      const next = prev === 'SEEKER' ? 'PROVIDER' : 'SEEKER';
      localStorage.setItem('venuex_active_role', next);
      return next;
    });
  };

  const handleSetActiveRole = (role: 'SEEKER' | 'PROVIDER') => {
    setActiveRole(role);
    localStorage.setItem('venuex_active_role', role);
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
