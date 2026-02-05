import { useState, useEffect, useCallback } from 'react';
import { getToken, deleteToken, onMessage } from 'firebase/messaging';
import { ref, set, remove } from 'firebase/database';
import { messaging, database } from '../firebase';
import { NotificationPermissionState } from './useNotificationPermission';

const VAPID_KEY = 'BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA';

interface UseFCMTokenReturn {
  token: string | null;
  error: string | null;
  loading: boolean;
  refreshToken: () => Promise<void>;
  clearToken: () => Promise<void>;
}

export function useFCMToken(
  userId: string | undefined,
  permission: NotificationPermissionState
): UseFCMTokenReturn {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate FCM token
  const generateToken = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    if (permission !== 'granted') {
      setError('Notification permission not granted');
      return;
    }

    if (!messaging) {
      setError('Firebase messaging not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (currentToken) {
        console.log('[FCM] Token generated:', currentToken.substring(0, 20) + '...');
        setToken(currentToken);

        // Save token to Firebase Realtime Database
        const tokenRef = ref(database, `fcmTokens/${userId}`);
        await set(tokenRef, {
          token: currentToken,
          updatedAt: new Date().toISOString()
        });

        console.log('[FCM] Token saved to database');
      } else {
        setError('No registration token available. Request permission to generate one.');
      }
    } catch (err) {
      console.error('[FCM] Error getting token:', err);
      setError(`Failed to get FCM token: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [userId, permission]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    await generateToken();
  }, [generateToken]);

  // Clear token (for logout)
  const clearToken = useCallback(async () => {
    if (!userId || !messaging) return;

    try {
      // Delete token from FCM
      await deleteToken(messaging);
      
      // Remove token from database
      const tokenRef = ref(database, `fcmTokens/${userId}`);
      await remove(tokenRef);
      
      setToken(null);
      console.log('[FCM] Token cleared');
    } catch (err) {
      console.error('[FCM] Error clearing token:', err);
    }
  }, [userId]);

  // Generate token when permission is granted
  useEffect(() => {
    if (userId && permission === 'granted' && !token) {
      generateToken();
    }
  }, [userId, permission, token, generateToken]);

  // Listen for token refresh
  useEffect(() => {
    if (!messaging) return;

    // Token refresh is handled automatically by Firebase SDK
    // But we can listen for messages to ensure token is valid
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
    });

    return () => unsubscribe();
  }, []);

  return {
    token,
    error,
    loading,
    refreshToken,
    clearToken
  };
}
