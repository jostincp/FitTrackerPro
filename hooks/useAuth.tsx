'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Mock user for development
const mockUser: User = {
  id: 'mock-user-id',
  email: 'usuario@ejemplo.com',
  user_metadata: { name: 'Usuario Demo' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: undefined,
  confirmation_sent_at: undefined,
  recovery_sent_at: undefined,
  email_change_sent_at: undefined,
  new_email: undefined,
  invited_at: undefined,
  action_link: undefined,
  phone: undefined,
  role: 'authenticated'
};

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock authentication for development
    const initMockAuth = () => {
      setTimeout(() => {
        setSession(mockSession);
        setUser(mockUser);
        setLoading(false);
      }, 500); // Simulate loading time
    };

    initMockAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Mock sign in
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSession(mockSession);
    setUser(mockUser);
    setLoading(false);
    router.push('/dashboard');
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    // Mock sign up
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newMockUser = { ...mockUser, email, user_metadata: { name } };
    const newMockSession = { ...mockSession, user: newMockUser };
    setSession(newMockSession);
    setUser(newMockUser);
    setLoading(false);
    router.push('/dashboard');
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    // Mock sign out
    await new Promise(resolve => setTimeout(resolve, 500));
    setSession(null);
    setUser(null);
    setLoading(false);
    router.push('/auth/login');
  };

  const resetPassword = async (email: string) => {
    // Mock password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for checking if user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}

// Hook for redirecting authenticated users
export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return { user, loading };
}