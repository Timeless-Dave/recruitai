import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, name: string, company: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const firebaseToken = await user.getIdToken();

    // Try backend signup, but don't block UX if it fails
    let backendData: any = null;
    try {
      const resp = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, orgName: company, firebaseUid: user.uid }),
      });
      if (resp.ok) {
        backendData = await resp.json();
      }
    } catch (_) {
      // swallow; we’ll sync later
    }

    localStorage.setItem('firebaseToken', firebaseToken);
    if (backendData?.user) {
      localStorage.setItem('userData', JSON.stringify(backendData.user));
    }
    return { user, firebaseToken, backendData };
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    }
    throw new Error(err?.message || 'Failed to sign up');
  }
}

/**
 * Sign in with email and password
 * With retry logic for backend cold starts
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    // 1. Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseToken = await userCredential.user.getIdToken();
    
    // 2. Verify with backend (with retry for cold starts)
    let response;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        response = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseToken }),
        });
        
        if (response.ok) break; // Success
        
        // If failed and we have retries left, wait and retry
        if (retries < maxRetries) {
          console.log(`Backend verify failed, retrying in 2s (${retries + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries++;
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to verify with backend');
        }
      } catch (fetchError: any) {
        if (retries < maxRetries && (fetchError.message === 'Failed to fetch' || fetchError.name === 'TypeError')) {
          console.log(`Backend unreachable, retrying in 2s (${retries + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries++;
        } else {
          throw fetchError;
        }
      }
    }
    
    const userData = await response!.json();
    
    // 3. Store token and user data
    localStorage.setItem('firebaseToken', firebaseToken);
    localStorage.setItem('userData', JSON.stringify(userData.user));
    
    return { firebaseToken, userData };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Provide helpful error messages
    if (error?.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    if (error?.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up.');
    }
    if (error?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(name?: string, company?: string) {
  try {
    // 1. Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const firebaseToken = await user.getIdToken();
    
    // 2. Check if user exists in backend
    const verifyResponse = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken }),
    });
    
    if (verifyResponse.ok) {
      // User exists, just sign in
      const userData = await verifyResponse.json();
      localStorage.setItem('firebaseToken', firebaseToken);
      localStorage.setItem('userData', JSON.stringify(userData.user));
      return { user, firebaseToken, userData, isNewUser: false };
    }
    
    // 3. New user - need to create account in backend
    if (name && company) {
      const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: 'google-oauth', // Placeholder
          name,
          orgName: company,
          firebaseUid: user.uid,
        }),
      });
      
      if (!signupResponse.ok) {
        throw new Error('Failed to create account');
      }
      
      const backendData = await signupResponse.json();
      localStorage.setItem('firebaseToken', firebaseToken);
      localStorage.setItem('userData', JSON.stringify(backendData.user));
      
      return { user, firebaseToken, backendData, isNewUser: true };
    }
    
    // Return user data to collect name/company
    return { user, firebaseToken, isNewUser: true, needsProfile: true };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Make authenticated API request
 */
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('firebaseToken');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

