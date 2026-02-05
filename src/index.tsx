import './index.css';
import React from "react";
import { render } from "react-dom";
import { App } from "./App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

render(<App />, document.getElementById("root"));

// Register service worker for PWA
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[PWA] Content cached for offline use.');
  },
  onUpdate: (registration) => {
    console.log('[PWA] New content available; please refresh.');
    // Optionally show a notification to user about update
    if (confirm('New version available! Click OK to update.')) {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  },
});

// Register Firebase Messaging Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('[FCM] Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('[FCM] Service Worker registration failed:', error);
    });
}