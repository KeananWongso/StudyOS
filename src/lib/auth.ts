import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { app, db } from './firebase';

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider with Gmail domain restriction
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'gmail.com', // Restrict to Gmail domains only
  prompt: 'select_account'
});

// User type definition
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'student' | 'tutor' | null; // null for new users who need to select role
  isNewUser: boolean;
  lastLogin: Date;
  createdAt: Date;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Convert Firebase User to AppUser
export const createAppUser = (firebaseUser: FirebaseUser, role: 'student' | 'tutor' | null = null, isNewUser: boolean = true): AppUser => {
  const now = new Date();
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'Anonymous User',
    photoURL: firebaseUser.photoURL,
    role,
    isNewUser,
    lastLogin: now,
    createdAt: now,
    preferences: {
      theme: 'light',
      notifications: true
    }
  };
};

// Sign in with Google (Gmail only) - Generic function
export const signInWithGoogle = async (): Promise<AppUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verify the user is using a Gmail account
    if (!user.email?.endsWith('@gmail.com')) {
      await firebaseSignOut(auth);
      throw new Error('Please sign in with a Gmail account');
    }

    // Check if user exists in Firestore
    const existingUser = await getUserFromFirestore(user.email);
    
    let appUser: AppUser;
    
    if (existingUser) {
      // Existing user - update last login
      appUser = {
        ...existingUser,
        lastLogin: new Date()
      };
      await saveUserToFirestore(appUser);
    } else {
      // New user - create with no role (needs to select)
      appUser = createAppUser(user, null, true);
      await saveUserToFirestore(appUser);
    }

    return appUser;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked. Please allow pop-ups and try again');
    } else if (error.message === 'Please sign in with a Gmail account') {
      throw error;
    } else {
      throw new Error('Failed to sign in. Please try again');
    }
  }
};

// Sign in as Student
export const signInAsStudent = async (): Promise<AppUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verify the user is using a Gmail account
    if (!user.email?.endsWith('@gmail.com')) {
      await firebaseSignOut(auth);
      throw new Error('Please sign in with a Gmail account');
    }

    // Create/update user with student role
    const appUser = createAppUser(user, 'student', false);
    await saveUserToFirestore(appUser);

    return appUser;
  } catch (error: any) {
    console.error('Error signing in as student:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked. Please allow pop-ups and try again');
    } else if (error.message === 'Please sign in with a Gmail account') {
      throw error;
    } else {
      throw new Error('Failed to sign in. Please try again');
    }
  }
};

// Sign in as Tutor
export const signInAsTutor = async (): Promise<AppUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verify the user is using a Gmail account
    if (!user.email?.endsWith('@gmail.com')) {
      await firebaseSignOut(auth);
      throw new Error('Please sign in with a Gmail account');
    }

    // Create/update user with tutor role
    const appUser = createAppUser(user, 'tutor', false);
    await saveUserToFirestore(appUser);

    return appUser;
  } catch (error: any) {
    console.error('Error signing in as tutor:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked. Please allow pop-ups and try again');
    } else if (error.message === 'Please sign in with a Gmail account') {
      throw error;
    } else {
      throw new Error('Failed to sign in. Please try again');
    }
  }
};

// Save user data to Firestore
export const saveUserToFirestore = async (user: AppUser): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.email);
    
    // Convert Date objects to Firestore Timestamps for saving
    const userData = {
      ...user,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw new Error('Failed to save user data');
  }
};

// Get user data from Firestore
export const getUserFromFirestore = async (email: string): Promise<AppUser | null> => {
  try {
    const userRef = doc(db, 'users', email);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        lastLogin: data.lastLogin?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      } as AppUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user's email for database queries
export const getCurrentUserEmail = (): string | null => {
  const user = getCurrentUser();
  return user?.email || null;
};

// Check if current user is a tutor
export const isCurrentUserTutor = async (): Promise<boolean> => {
  const email = getCurrentUserEmail();
  if (!email) return false;
  
  const userData = await getUserFromFirestore(email);
  return userData?.role === 'tutor';
};

// Set user role (admin function)
export const setUserRole = async (email: string, role: 'student' | 'tutor'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', email);
    await setDoc(userRef, { 
      role, 
      isNewUser: false,
      lastLogin: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new Error('Failed to update user role');
  }
};

// Update user role after selection
export const updateUserRole = async (email: string, role: 'student' | 'tutor'): Promise<AppUser> => {
  try {
    await setUserRole(email, role);
    const updatedUser = await getUserFromFirestore(email);
    
    if (!updatedUser) {
      throw new Error('User not found after role update');
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
};

// Authentication error types
export type AuthError = {
  code: string;
  message: string;
};

// Validate Gmail domain
export const isGmailAccount = (email: string): boolean => {
  return email.endsWith('@gmail.com');
};