const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 8080;

// Enable CORS for all origins (adjust for production)
app.use(cors());
app.use(express.json());

// Firebase Server Key
const FCM_SERVER_KEY = 'BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Notification backend is running' });
});

// Send single notification
app.post('/send-notification', async (req, res) => {
  const { fcmToken, title, body, data } = req.body;

  console.log('[Notification Backend] Received request to send notification');
  console.log('[Notification Backend] Title:', title);
  console.log('[Notification Backend] Body:', body);
  console.log('[Notification Backend] Token:', fcmToken ? fcmToken.substring(0, 20) + '...' : 'none');

  if (!fcmToken) {
    return res.status(400).json({ 
      success: false, 
      error: 'FCM token is required' 
    });
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: title || 'Notification',
          body: body || '',
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        },
        data: data || {},
        webpush: {
          notification: {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200]
          }
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('[Notification Backend] ✅ Notification sent successfully:', result);
      res.json({ success: true, result });
    } else {
      console.error('[Notification Backend] ❌ FCM error:', result);
      res.status(500).json({ success: false, error: result });
    }
  } catch (error) {
    console.error('[Notification Backend] ❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send batch notifications
app.post('/send-batch-notifications', async (req, res) => {
  const { tokens, title, body, data } = req.body;

  console.log('[Notification Backend] Received batch notification request');
  console.log('[Notification Backend] Number of tokens:', tokens ? tokens.length : 0);

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Tokens array is required' 
    });
  }

  try {
    const sendPromises = tokens.map(token =>
      fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${FCM_SERVER_KEY}`
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: title || 'Notification',
            body: body || '',
            icon: '/icon-192.png',
            badge: '/icon-192.png'
          },
          data: data || {},
          webpush: {
            notification: {
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              vibrate: [200, 100, 200]
            }
          }
        })
      }).then(r => r.json())
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success !== false).length;
    
    console.log('[Notification Backend] ✅ Batch sent:', successCount, 'of', tokens.length);
    
    res.json({ 
      success: true, 
      results,
      successCount,
      totalCount: tokens.length
    });
  } catch (error) {
    console.error('[Notification Backend] ❌ Batch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Notification backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Send notification: POST http://localhost:${PORT}/send-notification`);
  console.log(`   Batch notifications: POST http://localhost:${PORT}/send-batch-notifications`);
});
