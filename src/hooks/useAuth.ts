import { useFirebaseAuth } from './useFirebaseAuth';

// Backward compatibility wrapper - delegates to Firebase auth
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    isAdmin
  } = useFirebaseAuth();

  // Legacy login function that now uses Google
  const login = async (email?: string) => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    isAdmin,
    loginWithGoogle
  };
}