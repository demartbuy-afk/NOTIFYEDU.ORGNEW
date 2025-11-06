import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, School } from '../types';

interface AuthContextType {
  user: User | School | null;
  loading: boolean;
  login: (userData: User | School) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | School | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }

    // Listens for authentication errors (e.g. expired token) from the API service
    const handleForceLogout = () => {
        console.warn('Authentication error detected. Forcing logout.');
        logout();
    };

    window.addEventListener('force-logout', handleForceLogout);

    return () => {
        window.removeEventListener('force-logout', handleForceLogout);
    };
  }, [logout]);

  const login = useCallback((userData: User | School) => {
    if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
