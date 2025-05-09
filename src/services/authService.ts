
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get current user
export const getCurrentUser = async (): Promise<UserData | null> => {
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    return null;
  }
  
  return {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.name
  };
};

// Sign up
export const signUp = async ({ email, password }: UserCredentials, name?: string): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      return { user: null, error: 'No user data returned' };
    }
    
    return { 
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name
      },
      error: null
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { user: null, error: error.message || 'Failed to sign up' };
  }
};

// Sign in
export const signIn = async ({ email, password }: UserCredentials): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      return { user: null, error: 'No user data returned' };
    }
    
    return { 
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { user: null, error: error.message || 'Failed to sign in' };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('Signout error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
};

// Initialize auth context - Call this at app startup
export const initAuth = async () => {
  try {
    const { data } = await supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          localStorage.setItem('authenticated', 'true');
          toast.success('Signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('authenticated');
          toast.info('Signed out');
        }
      }
    );
    
    return data;
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
};
