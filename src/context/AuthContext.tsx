
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { signIn, signOut, signUp, UserCredentials, UserData, getCurrentUser } from '@/services/authService';
import { migrateLocalStorageToSupabase } from '@/services/foodItemService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (credentials: UserCredentials, name?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session && session.user && mounted) {
          const userData: UserData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name
          };
          setUser(userData);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (session && session.user) {
          const userData: UserData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name
          };
          setUser(userData);
          
          // If newly signed in, migrate localStorage data
          if (event === 'SIGNED_IN') {
            try {
              await migrateLocalStorageToSupabase();
            } catch (err) {
              console.error('Error migrating data:', err);
            }
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: UserCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user, error } = await signIn(credentials);
      if (error || !user) {
        toast.error(error || 'Login failed');
        return false;
      }
      
      setUser(user);
      toast.success('Logged in successfully');
      navigate('/');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error);
        return;
      }
      
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: UserCredentials, name?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user, error } = await signUp(credentials, name);
      if (error || !user) {
        toast.error(error || 'Registration failed');
        return false;
      }
      
      toast.success('Account created successfully! Please verify your email.');
      navigate('/login');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user, 
        login, 
        logout, 
        register 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
