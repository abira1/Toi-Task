// Firebase Cloud Messaging Service Worker
// This file handles background notifications when the app is not in focus

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: 'AIzaSyD7CHndlvxJgchePfbNC1NPKEG-TGxMsdg',
  authDomain: 'toi-task.firebaseapp.com',
  databaseURL: 'https://toi-task-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'toi-task',
  storageBucket: 'toi-task.firebasestorage.app',
  messagingSenderId: '992959841228',
  appId: '1:992959841228:web:bb7728f4759fe1c02e1369',
  measurementId: 'G-1VSV0V0XFQ'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Toi-Task Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.taskId || 'default',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);

  event.notification.close();

  // Extract task ID from notification data
  const taskId = event.notification.data?.taskId;
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          // If task ID exists, navigate to home with task highlighted
          if (taskId) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              taskId: taskId
            });
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        const url = taskId ? `/?taskId=${taskId}` : '/';
        return clients.openWindow(url);
      }
    })
  );
});
