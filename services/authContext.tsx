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
    
    // Initialize Pi SDK on load if possible
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
        // Fallback for Desktop Development (Optional: remove this block for strict Pi Browser only)
        // If not in Pi Browser, authResult is null.
        // We can throw an error or handle it.
        const isPiBrowser = typeof window.Pi !== 'undefined';
        if (!isPiBrowser) {
            alert("Pi SDK not detected. Mocking login for desktop development.");
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

    } catch (e) {
      console.error("Login failed", e);
      alert("Login failed. Please try again.");
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
