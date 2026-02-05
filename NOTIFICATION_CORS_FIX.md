# 🔧 Setting Up Push Notifications (CORS Fix)

## ⚠️ Important Issue Discovered

The notification system is implemented but **notifications cannot be sent directly from the browser** due to CORS restrictions on the FCM REST API.

### The Problem:
- FCM REST API (`https://fcm.googleapis.com/fcm/send`) blocks browser requests
- Browser shows CORS error when trying to send notifications
- This is a security feature by Firebase

### The Solution:
You need to set up **Firebase Cloud Functions** (a serverless backend) to send notifications.

---

## 🚀 Quick Setup (5 minutes)

### Option 1: Firebase Cloud Functions (Recommended)

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Initialize Cloud Functions
```bash
cd /app
firebase init functions
# Select JavaScript
# Install dependencies: Yes
```

#### Step 3: Create the notification function

Create file: `/app/functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function to send notifications
exports.sendNotification = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { fcmToken, title, body, data: notificationData } = data;

  if (!fcmToken) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'FCM token is required'
    );
  }

  const message = {
    token: fcmToken,
    notification: {
      title: title || 'Notification',
      body: body || ''
    },
    data: notificationData || {},
    webpush: {
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200]
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Batch notification function
exports.sendBatchNotifications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { tokens, title, body, data: notificationData } = data;

  if (!tokens || tokens.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Tokens array is required'
    );
  }

  const messages = tokens.map(token => ({
    token,
    notification: {
      title: title || 'Notification',
      body: body || ''
    },
    data: notificationData || {},
    webpush: {
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200]
      }
    }
  }));

  try {
    const response = await admin.messaging().sendEach(messages);
    console.log('Successfully sent messages:', response);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending messages:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

#### Step 4: Deploy Cloud Functions
```bash
firebase deploy --only functions
```

#### Step 5: Update notification service

Replace `/app/src/services/notificationService.ts` to use Cloud Functions:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

const functions = getFunctions(app);

export async function sendNotificationToUser(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  try {
    const sendNotification = httpsCallable(functions, 'sendNotification');
    const result = await sendNotification({
      fcmToken,
      title,
      body,
      data
    });
    
    console.log('[Notification] Sent successfully:', result);
    return true;
  } catch (error) {
    console.error('[Notification] Error:', error);
    return false;
  }
}

export async function sendNotificationToUsers(
  tokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    const sendBatch = httpsCallable(functions, 'sendBatchNotifications');
    const result = await sendBatch({
      tokens,
      title,
      body,
      data
    });
    
    console.log('[Notification] Batch sent:', result);
  } catch (error) {
    console.error('[Notification] Error:', error);
  }
}
```

---

### Option 2: Simple Node.js Backend (Alternative)

If you prefer a simple Express backend:

#### Step 1: Create `/app/notification-server/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const FCM_SERVER_KEY = 'BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA';

app.post('/send-notification', async (req, res) => {
  const { fcmToken, title, body, data } = req.body;

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title, body },
        data: data || {}
      })
    });

    const result = await response.json();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(8080, () => {
  console.log('Notification server running on port 8080');
});
```

#### Step 2: Run the server
```bash
cd /app/notification-server
npm install express cors node-fetch
node server.js
```

#### Step 3: Update notification service to use backend
```typescript
const NOTIFICATION_API = 'http://localhost:8080/send-notification';

export async function sendNotificationToUser(...) {
  const response = await fetch(NOTIFICATION_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fcmToken, title, body, data })
  });
  return response.ok;
}
```

---

## 🎯 Current Status

### ✅ What's Working:
- Service worker registration
- FCM token generation and storage
- Notification UI in Profile page
- Foreground notification handler
- Background notification handler
- Notification trigger logic (task create/comment/complete)

### ⚠️ What's Blocked:
- **Actually sending notifications** (blocked by CORS)

### 💡 Next Steps:
1. Choose Option 1 (Cloud Functions) or Option 2 (Express backend)
2. Deploy the backend
3. Update notification service to use the backend
4. Test notifications with multiple users

---

## 🧪 Testing After Setup

Once backend is deployed:

1. **Test with Firebase Console** (no code needed):
   - Go to Firebase Console → Cloud Messaging
   - Click "Send test message"
   - Enter FCM token from Profile page
   - Send notification
   - Should receive notification!

2. **Test app functionality**:
   - User A creates task → User B gets notification ✅
   - User B comments → User A gets notification ✅
   - User A completes task → User B gets notification ✅

---

## 📚 Resources

- [Firebase Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [FCM Send Messages](https://firebase.google.com/docs/cloud-messaging/send-message)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 🆘 Troubleshooting

### Issue: "CORS error" in console
**Solution**: Backend/Cloud Functions not set up yet. Follow Option 1 or 2 above.

### Issue: "Failed to fetch" error
**Solution**: Same as above - need backend.

### Issue: Notifications work in Firebase Console but not in app
**Solution**: Check Cloud Function is deployed and notification service is updated.

---

**Status**: Notification infrastructure complete ✅ | Backend setup required ⚠️
