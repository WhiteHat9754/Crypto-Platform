import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface SessionContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: any;
  reloadSession: () => Promise<void>;
  loginSession: (user: any) => void; 
}

const SessionContext = createContext<SessionContextType>({
  isLoading: true,
  isLoggedIn: false,
  user: null,
  reloadSession: async () => {},
  loginSession: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const reloadSession = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/session', {
        withCredentials: true,
      });
      if (res.data?.user) {
        setIsLoggedIn(true);
        setUser(res.data.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  const loginSession = (user: any) => {
    setIsLoggedIn(true);
    setUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    reloadSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{ isLoading, isLoggedIn, user, reloadSession, loginSession }}
    >
      {children}
    </SessionContext.Provider>
  );
};
