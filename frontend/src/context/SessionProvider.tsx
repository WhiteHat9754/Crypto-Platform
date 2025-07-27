import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  role: string;
}

interface SessionContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: User | null;
  reloadSession: () => Promise<void>;
  loginSession: (user: User) => void;
  logoutSession: () => void;
}

const SessionContext = createContext<SessionContextType>({
  isLoading: true,
  isLoggedIn: false,
  user: null,
  reloadSession: async () => {},
  loginSession: () => {},
  logoutSession: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

// Add to your SessionProvider.tsx
const reloadSession = async () => {
  setIsLoading(true);
  try {
    // Try user session first
    let res;
    try {
      res = await axios.get('http://localhost:5000/api/user/profile', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (userError) {
      // If user session fails, try admin session
      try {
        res = await axios.get('http://localhost:5000/api/admin/profile', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      } catch (adminError) {
        console.log('❌ No valid session found');
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
    }
    
    if (res.data?.success && res.data?.data) {
      setIsLoggedIn(true);
      setUser(res.data.data);
      console.log('✅ User session loaded:', res.data.data);
    }
  } catch (err: any) {
    console.error('❌ Session reload error:', err);
    setIsLoggedIn(false);
    setUser(null);
  }
  setIsLoading(false);
};


  const loginSession = (userData: User) => {
    console.log('✅ Login session called with:', userData);
    setIsLoggedIn(true);
    setUser(userData);
    setIsLoading(false);
  };

  const logoutSession = () => {
    console.log('✅ Logout session called');
    setIsLoggedIn(false);
    setUser(null);
    setIsLoading(false);
  };

  useEffect(() => {
    reloadSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        user,
        reloadSession,
        loginSession,
        logoutSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
