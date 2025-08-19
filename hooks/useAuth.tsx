'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

// Auth query keys
const authKeys = {
  session: ['auth', 'session'] as const,
  user: ['auth', 'user'] as const,
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
  const queryClient = useQueryClient();

  // Get current session using React Query
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Update React Query cache
        queryClient.setQueryData(authKeys.session, session);
        
        if (event === 'SIGNED_IN') {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          queryClient.clear();
          router.push('/auth/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session, data.session);
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });

  const signIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.session) {
        queryClient.setQueryData(authKeys.session, data.session);
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await signUpMutation.mutateAsync({ email, password, name });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      setSession(null);
      setUser(null);
      router.push('/auth/login');
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordMutation.mutateAsync(email);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading: loading || sessionLoading || signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending,
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