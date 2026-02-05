import React from 'react';
import { Bell, BellOff, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { useFCMToken } from '../hooks/useFCMToken';

interface NotificationSettingsProps {
  userId: string | undefined;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { permission, requestPermission, isSupported } = useNotificationPermission();
  const { token, error, loading, refreshToken } = useFCMToken(userId, permission);

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      console.log('[NotificationSettings] Permission granted, token will be generated');
    } else if (result === 'denied') {
      alert('Notification permission denied. Please enable notifications in your browser settings.');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white border-3 border-[var(--black)] rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-200 p-3 rounded-xl">
            <BellOff className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Notifications Not Supported</h4>
            <p className="text-sm text-gray-500">Your browser doesn't support push notifications</p>
          </div>
        </div>
      </div>
    );
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: CheckCircle2,
          text: 'Enabled',
          color: 'text-[var(--teal)]',
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-200'
        };
      case 'denied':
        return {
          icon: XCircle,
          text: 'Blocked',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Disabled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white border-3 border-[var(--black)] rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${permission === 'granted' ? 'bg-[var(--teal)]' : 'bg-gray-200'} p-3 rounded-xl transition-colors`}>
            <Bell className={`w-6 h-6 ${permission === 'granted' ? 'text-white' : 'text-gray-500'}`} />
          </div>
          <div>
            <h4 className="font-bold text-lg">Push Notifications</h4>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon className={`w-4 h-4 ${status.color}`} />
              <span className={`text-sm font-bold ${status.color}`}>{status.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-lg p-3 mb-4`}>
        <p className="text-sm text-gray-700">
          {permission === 'granted' && 'You will receive notifications when:'}
          {permission === 'denied' && 'Notifications are blocked. Enable them in your browser settings.'}
          {permission === 'default' && 'Enable notifications to stay updated with team activities.'}
        </p>
        {permission === 'granted' && (
          <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-4 list-disc">
            <li>Someone adds a new task</li>
            <li>Someone comments on your task</li>
            <li>Someone completes a task</li>
          </ul>
        )}
      </div>

      {/* Action Button */}
      {permission !== 'granted' && (
        <button
          onClick={handleEnableNotifications}
          disabled={permission === 'denied'}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm border-2 border-[var(--black)] transition-all flex items-center justify-center gap-2 ${
            permission === 'denied'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-[var(--teal)] text-white shadow-[4px_4px_0px_0px_var(--black)] hover:shadow-[6px_6px_0px_0px_var(--black)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--black)]'
          }`}
        >
          <Bell className="w-4 h-4" />
          {permission === 'denied' ? 'Blocked by Browser' : 'Enable Notifications'}
        </button>
      )}

      {/* Token Status (for granted permission) */}
      {permission === 'granted' && (
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating notification token...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800">Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {token && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-800">Connected</p>
                  <p className="text-xs text-green-600 mt-1">Your device is ready to receive notifications</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono truncate" title={token}>
                    Token: {token.substring(0, 30)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Token Button */}
          <button
            onClick={refreshToken}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg font-bold text-xs border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh Token
          </button>
        </div>
      )}

      {/* Browser Instructions for Denied */}
      {permission === 'denied' && (
        <div className="mt-4 bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
          <p className="text-xs font-bold text-gray-700 mb-2">To enable notifications:</p>
          <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
            <li>Click the lock icon in your browser's address bar</li>
            <li>Find "Notifications" in the permissions list</li>
            <li>Change it from "Block" to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      )}
    </div>
  );
}
