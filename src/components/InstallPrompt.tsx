import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed === 'true') {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('[PWA] App installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white border-4 border-[var(--black)] rounded-2xl p-4 shadow-[8px_8px_0px_0px_var(--black)]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-[var(--teal)] border-2 border-[var(--black)] rounded-xl flex items-center justify-center text-2xl">
            📱
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--black)] text-sm mb-1">
              Install Toi-Task App
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get quick access and work offline!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-[var(--teal)] text-white px-4 py-2 rounded-lg font-bold text-sm border-2 border-[var(--black)] shadow-[2px_2px_0px_0px_var(--black)] hover:shadow-[4px_4px_0px_0px_var(--black)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--black)] transition-all"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
