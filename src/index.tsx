import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);

// Track if we've already shown an update prompt in this session
let updatePromptShown = false;
let isRefreshing = false;

// Only register service worker in production or if explicitly enabled
const isDevelopment = import.meta.env.DEV;
const shouldRegisterSW = !isDevelopment || import.meta.env.VITE_REGISTER_SW === 'true';

if (shouldRegisterSW) {
  // Register service worker for PWA
  serviceWorkerRegistration.register({
    onSuccess: () => {
      console.log('[PWA] Content cached for offline use.');
    },
    onUpdate: (registration) => {
      console.log('[PWA] New content available; please refresh.');
      
      // Prevent multiple update prompts in the same session
      if (updatePromptShown) {
        console.log('[PWA] Update prompt already shown in this session, skipping...');
        return;
      }
      
      // Mark that we've shown the prompt
      updatePromptShown = true;
      
      // Use a timeout to ensure we don't show the prompt immediately on page load
      setTimeout(() => {
        // Show update notification
        if (confirm('New version available! Click OK to update.')) {
          if (registration.waiting) {
            // Tell the waiting service worker to activate
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Listen for the controlling service worker to change (only once)
            const handleControllerChange = () => {
              if (!isRefreshing) {
                isRefreshing = true;
                window.location.reload();
              }
            };
            
            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
            
            // If controllerchange doesn't fire within 3 seconds, reload anyway
            setTimeout(() => {
              if (!isRefreshing) {
                isRefreshing = true;
                window.location.reload();
              }
            }, 3000);
          } else {
            // No waiting worker, just reload
            if (!isRefreshing) {
              isRefreshing = true;
              window.location.reload();
            }
          }
        } else {
          // User declined update, reset the flag so they can be prompted again later
          updatePromptShown = false;
        }
      }, 500);
    },
  });
} else {
  console.log('[PWA] Service Worker registration skipped in development mode');
}

