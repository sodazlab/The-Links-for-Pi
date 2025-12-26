import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { PiService } from './pi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'pi_links_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    // Attempt to initialize SDK silently in background on load
    PiService.init();
  }, []);

  const loginAsPioneer = async () => {
    try {
      // 1. Attempt to Authenticate via Pi SDK
      const authResult = await PiService.authenticate();

      if (authResult) {
        // 2. Map Pi User to App User
        const newUser: User = {
          id: authResult.user.uid,
          username: authResult.user.username,
          role: 'pioneer',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authResult.user.username}`,
          accessToken: authResult.accessToken
        };

        // 3. Update State & Storage
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        // If authResult is null, PiService has likely already alerted the error.
        // We check if we are NOT in Pi Browser to allow dev testing on PC.
        const isPiBrowser = navigator.userAgent.includes('PiBrowser');
        
        if (!isPiBrowser) {
            console.warn("Not in Pi Browser, mocking login.");
            const shouldMock = confirm("Pi SDK not detected (You are not in Pi Browser). Login as Mock User?");
            if (shouldMock) {
                const mockUsername = 'PiPioneer_' + Math.floor(Math.random() * 1000);
                const mockUser: User = {
                    id: 'mock-pi-user-' + Math.random().toString(36).substr(2, 9),
                    username: mockUsername,
                    role: 'pioneer',
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUsername}`
                };
                setUser(mockUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
            }
        }
      }

    } catch (e: any) {
      console.error("Login Context Error", e);
      alert(`Login Process Error: ${e.message}`);
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
