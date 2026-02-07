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
    
    // Prevent multiple update prompts
    const updatePromptShown = sessionStorage.getItem('updatePromptShown');
    if (updatePromptShown === 'true') {
      console.log('[PWA] Update prompt already shown, skipping...');
      return;
    }
    
    sessionStorage.setItem('updatePromptShown', 'true');
    
    // Show update notification
    if (confirm('New version available! Click OK to update.')) {
      if (registration.waiting) {
        // Tell the waiting service worker to activate
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the controlling service worker to change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            sessionStorage.removeItem('updatePromptShown');
            window.location.reload();
          }
        });
      } else {
        sessionStorage.removeItem('updatePromptShown');
        window.location.reload();
      }
    } else {
      sessionStorage.removeItem('updatePromptShown');
    }
  },
});
