import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthResponse } from '@/types';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';
import { signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      handleAuthResponse(response);
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      // Step 1: Open Google sign-in popup via Firebase
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      // Step 2: Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      // Step 3: Send to our backend for verification and JWT creation
      const response: AuthResponse = await authService.googleLogin(idToken);
      handleAuthResponse(response);
      toast.success(`Welcome, ${response.user.name}!`);
    } catch (error: any) {
      // Handle Firebase popup errors (user closed popup, etc.)
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      toast.error(error.response?.data?.detail || error.message || 'Google sign-in failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
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
