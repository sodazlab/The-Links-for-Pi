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
    // Attempt silent init on load
    PiService.init().catch(e => console.log("Silent init failed", e));
  }, []);

  const loginAsPioneer = async () => {
    // NOTE: Strict UserAgent check removed to prevent false negatives in Pi Browser.
    // We rely on PiService.authenticate() handling the connection.

    try {
      // alert("Connecting..."); // Optional: Enable if visual feedback is needed immediately
      
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
      // If authResult is null, PiService handles the alert/error.

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
