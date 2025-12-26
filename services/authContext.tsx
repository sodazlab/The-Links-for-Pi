import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { PiService } from './pi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'pi_links_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    // Attempt silent init
    PiService.init();
  }, []);

  const loginAsPioneer = async () => {
    // 1. Immediate feedback to user (Debug Step)
    // Remove this alert later if it gets annoying, but keep it now to prove the button works
    alert("Starting Pi Network Login...");

    try {
      // 2. Authenticate
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
        // Success feedback
        // alert(`Welcome back, ${newUser.username}!`);
      } else {
        // Auth failed or cancelled, handled by PiService alert usually.
        // Fallback for PC testing:
        const isPiBrowser = navigator.userAgent.includes('PiBrowser');
        if (!isPiBrowser) {
           const shouldMock = confirm("Not in Pi Browser. Login as Mock User?");
           if (shouldMock) {
               const mockUser: User = {
                   id: 'mock-' + Math.random().toString(36).substr(2, 5),
                   username: 'MockPioneer',
                   role: 'pioneer',
                   avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Mock`
               };
               setUser(mockUser);
               localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
           }
        }
      }

    } catch (e: any) {
      console.error("Login Context Error", e);
      alert(`Critical Login Error: ${e.message}`);
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
