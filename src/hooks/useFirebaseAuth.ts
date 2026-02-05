import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, googleProvider, isUserAdmin, ALLOWED_ADMIN_EMAILS, database } from '../firebase';
import { User } from '../types';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if user email exists in teamMembers
  const checkTeamMemberAccess = async (email: string): Promise<User | null> => {
    try {
      const membersRef = ref(database, 'teamMembers');
      const snapshot = await get(membersRef);
      
      if (snapshot.exists()) {
        const members = snapshot.val();
        // Find member by email
        const memberEntry = Object.entries(members).find(
          ([_, memberData]: [string, any]) => 
            memberData.email?.toLowerCase() === email.toLowerCase()
        );
        
        if (memberEntry) {
          const [_, memberData] = memberEntry as [string, any];
          return memberData as User;
        }
      }
      return null;
    } catch (err) {
      console.error('Error checking team member access:', err);
      return null;
    }
  };

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

          // Check if user is admin or exists in teamMembers
          if (adminStatus) {
            // Admin can access without being in teamMembers
            const userData: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Admin',
              email: firebaseUser.email || '',
              role: 'admin',
              bio: 'Administrator',
              avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'Admin'}&background=00BFA5&color=fff`,
              expertise: ['Administration'],
              stats: {
                tasksCompleted: 0,
                streak: 0,
                points: 0
              }
            };
            setUser(userData);
            setIsAuthorized(true);
            setError(null);
          } else {
            // Non-admin: Check if email exists in teamMembers
            const memberData = await checkTeamMemberAccess(firebaseUser.email || '');
            
            if (memberData) {
              // User is authorized - sync with teamMember data
              const userData: User = {
                id: memberData.id || firebaseUser.uid,
                name: memberData.name || firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                role: memberData.role || 'Team Member',
                bio: memberData.bio || '',
                avatar: memberData.avatar || firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=00BFA5&color=fff`,
                coverImage: memberData.coverImage,
                expertise: memberData.expertise || [],
                stats: memberData.stats || {
                  tasksCompleted: 0,
                  streak: 0,
                  points: 0
                }
              };
              setUser(userData);
              setIsAuthorized(true);
              setError(null);
            } else {
              // User NOT in teamMembers - unauthorized
              setUser(null);
              setIsAuthorized(false);
              setError('UNAUTHORIZED');
            }
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsAuthorized(false);
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
        setIsAuthorized(true);

        const userData: User = {
          id: result.user.uid,
          name: result.user.displayName || 'Admin',
          email: userEmail || '',
          role: 'admin',
          bio: 'Administrator',
          avatar: result.user.photoURL || `https://ui-avatars.com/api/?name=${result.user.displayName || 'Admin'}&background=00BFA5&color=fff`,
          expertise: ['Administration'],
          stats: {
            tasksCompleted: 0,
            streak: 0,
            points: 0
          }
        };
        setUser(userData);
        return result.user;
      } else {
        // Non-admin: Check if email exists in teamMembers
        const memberData = await checkTeamMemberAccess(userEmail || '');
        
        if (memberData) {
          // User is authorized
          setFirebaseUser(result.user);
          setIsAdmin(false);
          setIsAuthenticated(true);
          setIsAuthorized(true);

          const userData: User = {
            id: memberData.id || result.user.uid,
            name: memberData.name || result.user.displayName || 'User',
            email: userEmail || '',
            role: memberData.role || 'Team Member',
            bio: memberData.bio || '',
            avatar: memberData.avatar || result.user.photoURL || `https://ui-avatars.com/api/?name=${result.user.displayName || 'User'}&background=00BFA5&color=fff`,
            coverImage: memberData.coverImage,
            expertise: memberData.expertise || [],
            stats: memberData.stats || {
              tasksCompleted: 0,
              streak: 0,
              points: 0
            }
          };
          setUser(userData);
          return result.user;
        } else {
          // User NOT in teamMembers
          setFirebaseUser(result.user);
          setIsAdmin(false);
          setIsAuthenticated(true);
          setIsAuthorized(false);
          setUser(null);
          setError('UNAUTHORIZED');
          return result.user;
        }
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
      setIsAuthorized(false);
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
    isAuthorized,
    isAdmin,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    allowedAdminEmails: ALLOWED_ADMIN_EMAILS
  };
}
