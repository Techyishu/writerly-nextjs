"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (from server)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            // Store user in localStorage for persistence
            localStorage.setItem('writerly_user', JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.user) {
        setUser(data.user);
        // Store user in localStorage for persistence
        localStorage.setItem('writerly_user', JSON.stringify(data.user));
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoggingIn(true);
    try {
      const response = await authService.register(email, password, name);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('writerly_user', JSON.stringify(response.user));
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/login', {
        method: 'DELETE',
      });
      setUser(null);
      localStorage.removeItem('writerly_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isLoggingIn,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During static generation, provide a fallback context
    if (typeof window === 'undefined') {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isLoggingIn: false,
        login: async () => {},
        register: async () => {},
        logout: () => {},
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};