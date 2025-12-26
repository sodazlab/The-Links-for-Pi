import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { PiService } from './pi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'pi_links_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Load User from Storage
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    // 2. Initialize Pi SDK silently on mount
    PiService.init();
  }, []);

  const loginAsPioneer = async () => {
    try {
      const authResult = await PiService.authenticate();

      if (authResult) {
        const newUser: User = {
          id: authResult.user.uid,
          username: authResult.user.username,
          role: 'pioneer',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authResult.user.username}`,
          accessToken: authResult.accessToken
        };

        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      }
    } catch (e: any) {
      console.error("Login Context Error", e);
      
      // DEBUG: Force alert everything to identify why the window is not opening
      let errorMessage = "Unknown Error";

      if (typeof e === 'string') {
        errorMessage = e;
      } else if (e instanceof Error) {
        // Standard JS Errors usually stringify to {}, so we access properties directly
        errorMessage = `[Error Object] Name: ${e.name}\nMessage: ${e.message}\nStack: ${e.stack}`;
      } else if (typeof e === 'object') {
        // Try to stringify, but handle circular references or empty objects
        try {
          errorMessage = `[Object]: ${JSON.stringify(e, null, 2)}`;
        } catch (jsonErr) {
          errorMessage = `[Object] (Not stringifiable)`;
        }
      }

      alert(`DEBUG ERROR:\n\n${errorMessage}`);
    }
  };

  const loginAsAdmin = () => {
    const adminUser: User = {
      id: 'admin-id',
      username: 'linkadmin',
      role: 'admin',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=admin`
    };
    setUser(adminUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginAsPioneer, 
      loginAsAdmin, 
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
