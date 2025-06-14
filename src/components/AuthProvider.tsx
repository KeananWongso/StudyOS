'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  AppUser, 
  onAuthStateChange, 
  getUserFromFirestore, 
  signInWithGoogle,
  signInAsStudent,
  signInAsTutor,
  signOut,
  createAppUser,
  updateUserRole as updateUserRoleInAuth 
} from '@/lib/auth';

// Auth context type
interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  needsRoleSelection: boolean;
  signIn: () => Promise<void>;
  signInAsStudent: () => Promise<void>;
  signInAsTutor: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'student' | 'tutor') => Promise<void>;
  clearError: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false); // Deprecated, kept for compatibility

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser && firebaseUser.email) {
          // User is signed in
          setFirebaseUser(firebaseUser);
          
          // Get user data from Firestore
          let userData = await getUserFromFirestore(firebaseUser.email);
          
          // If user doesn't exist in Firestore, create them
          if (!userData) {
            userData = createAppUser(firebaseUser, null, true);
            // Note: User will be saved to Firestore during sign-in process
          }
          
          // Role selection is now handled at login, no longer needed here
          setNeedsRoleSelection(false);
          setUser(userData);
        } else {
          // User is signed out
          setFirebaseUser(null);
          setUser(null);
          setNeedsRoleSelection(false);
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        setError('Failed to load user data');
        setUser(null);
        setFirebaseUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in function
  const handleSignIn = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await signInWithGoogle();
      setUser(userData);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in as student function
  const handleSignInAsStudent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await signInAsStudent();
      setUser(userData);
      setNeedsRoleSelection(false);
    } catch (error: any) {
      console.error('Student sign in error:', error);
      setError(error.message || 'Failed to sign in as student');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in as tutor function
  const handleSignInAsTutor = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await signInAsTutor();
      setUser(userData);
      setNeedsRoleSelection(false);
    } catch (error: any) {
      console.error('Tutor sign in error:', error);
      setError(error.message || 'Failed to sign in as tutor');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user role function
  const handleUpdateUserRole = async (role: 'student' | 'tutor'): Promise<void> => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }

      setLoading(true);
      setError(null);
      
      const updatedUser = await updateUserRoleInAuth(user.email, role);
      setUser(updatedUser);
      setNeedsRoleSelection(false);
    } catch (error: any) {
      console.error('Update role error:', error);
      setError(error.message || 'Failed to update role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
  };

  // Context value
  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    needsRoleSelection,
    signIn: handleSignIn,
    signInAsStudent: handleSignInAsStudent,
    signInAsTutor: handleSignInAsTutor,
    signOut: handleSignOut,
    updateUserRole: handleUpdateUserRole,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook to get current user email (convenience)
export const useCurrentUserEmail = (): string | null => {
  const { user } = useAuth();
  return user?.email || null;
};

// Hook to check if user is tutor
export const useIsTutor = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'tutor';
};

// Hook to check authentication status
export const useIsAuthenticated = (): boolean => {
  const { user, loading } = useAuth();
  return !loading && user !== null;
};

// Loading component for auth state
export const AuthLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error boundary for auth errors
interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const { error, clearError } = useAuth();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={clearError}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};