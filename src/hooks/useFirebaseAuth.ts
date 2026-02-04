import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, isUserAdmin, ALLOWED_ADMIN_EMAILS } from '../firebase';
import { User } from '../types';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          setIsAuthenticated(true);
          const adminStatus = isUserAdmin(firebaseUser.email);
          setIsAdmin(adminStatus);

          // Create user object from Firebase user
          const userData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: adminStatus ? 'admin' : 'user',
            bio: '',
            avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=00BFA5&color=fff`,
            expertise: [],
            stats: {
              tasksCompleted: 0,
              streak: 0,
              points: 0
            }
          };
          setUser(userData);
          setError(null);
        } else {
          setFirebaseUser(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication error';
        setError(errorMessage);
        console.error('Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Google login
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;

      // Check if user is admin
      if (isUserAdmin(userEmail)) {
        setFirebaseUser(result.user);
        setIsAdmin(true);
        setIsAuthenticated(true);

        const userData: User = {
          id: result.user.uid,
          name: result.user.displayName || 'User',
          email: userEmail || '',
          role: 'admin',
          bio: '',
          avatar: result.user.photoURL || `https://ui-avatars.com/api/?name=${result.user.displayName || 'User'}&background=00BFA5&color=fff`,
          expertise: [],
          stats: {
            tasksCompleted: 0,
            streak: 0,
            points: 0
          }
        };
        setUser(userData);
        return result.user;
      } else {
        // Non-admin user login - allow but set role as 'user'
        setFirebaseUser(result.user);
        setIsAdmin(false);
        setIsAuthenticated(true);

        const userData: User = {
          id: result.user.uid,
          name: result.user.displayName || 'User',
          email: userEmail || '',
          role: 'user',
          bio: '',
          avatar: result.user.photoURL || `https://ui-avatars.com/api/?name=${result.user.displayName || 'User'}&background=00BFA5&color=fff`,
          expertise: [],
          stats: {
            tasksCompleted: 0,
            streak: 0,
            points: 0
          }
        };
        setUser(userData);
        return result.user;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login with Google';
      setError(errorMessage);
      console.error('Google login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout';
      setError(errorMessage);
      console.error('Logout error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    firebaseUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    allowedAdminEmails: ALLOWED_ADMIN_EMAILS
  };
}
