import { useState, useEffect } from 'react';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

interface UseNotificationPermissionReturn {
  permission: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermissionState>;
  isSupported: boolean;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const isSupported = typeof Notification !== 'undefined';

  useEffect(() => {
    if (!isSupported) return;

    // Update permission state if it changes externally
    const checkPermission = () => {
      setPermission(Notification.permission);
    };

    // Check permission on mount
    checkPermission();

    // Listen for permission changes (some browsers support this)
    navigator.permissions?.query({ name: 'notifications' as PermissionName })
      .then((permissionStatus) => {
        permissionStatus.onchange = checkPermission;
      })
      .catch(() => {
        // Permissions API not supported in all browsers
      });
  }, [isSupported]);

  const requestPermission = async (): Promise<NotificationPermissionState> => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  return {
    permission,
    requestPermission,
    isSupported
  };
}
