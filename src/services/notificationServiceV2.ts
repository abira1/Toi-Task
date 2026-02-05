import { ref, get } from 'firebase/database';
import { database } from '../firebase';

/**
 * ALTERNATIVE NOTIFICATION SERVICE
 * 
 * This version uses a workaround for CORS issues with FCM REST API.
 * 
 * IMPORTANT: FCM REST API cannot be called directly from browser due to CORS.
 * 
 * Solutions:
 * 1. Firebase Cloud Functions (Recommended for production)
 * 2. Backend API endpoint (Simple Node.js/Express server)
 * 3. Client-side workaround using Firebase SDK methods (Limited)
 * 
 * For now, we'll use console logging to demonstrate the flow.
 * Users will need to set up Cloud Functions for actual notifications.
 */

// Firebase Server Key
const FCM_SERVER_KEY = 'BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA';

/**
 * Get FCM token for a specific user
 */
export async function getUserFCMToken(userId: string): Promise<string | null> {
  try {
    const tokenRef = ref(database, `fcmTokens/${userId}`);
    const snapshot = await get(tokenRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data.token || null;
    }
    
    console.log(`[Notification] No FCM token found for user: ${userId}`);
    return null;
  } catch (error) {
    console.error('[Notification] Error fetching FCM token:', error);
    return null;
  }
}

/**
 * Get user name from teamMembers database
 */
export async function getUserName(userId: string): Promise<string> {
  try {
    const userRef = ref(database, `teamMembers/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.name || 'Someone';
    }
    
    return 'Someone';
  } catch (error) {
    console.error('[Notification] Error fetching user name:', error);
    return 'Someone';
  }
}

/**
 * Create notification data for Cloud Function
 */
export function createNotificationPayload(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
) {
  return {
    to: fcmToken,
    notification: {
      title: title,
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    },
    data: data || {},
    webpush: {
      headers: {
        Urgency: 'high'
      },
      notification: {
        title: title,
        body: body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false
      }
    }
  };
}

/**
 * Send notification using Cloud Function (placeholder)
 */
export async function sendNotificationViaCloudFunction(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  try {
    console.log('[Notification] 📨 Preparing to send notification...');
    console.log('[Notification] Title:', title);
    console.log('[Notification] Body:', body);
    console.log('[Notification] Token:', fcmToken.substring(0, 20) + '...');
    
    // TODO: Replace with actual Cloud Function URL
    const cloudFunctionUrl = 'YOUR_CLOUD_FUNCTION_URL/sendNotification';
    
    console.log('[Notification] ⚠️ Cloud Function not configured yet!');
    console.log('[Notification] 💡 To enable notifications:');
    console.log('[Notification]    1. Deploy Firebase Cloud Function (see instructions below)');
    console.log('[Notification]    2. Update cloudFunctionUrl in this file');
    console.log('[Notification]    3. Or set up a backend API endpoint');
    
    // For testing: Log what would be sent
    const payload = createNotificationPayload(fcmToken, title, body, data);
    console.log('[Notification] 📦 Notification payload:', payload);
    
    return false; // Return false until Cloud Function is set up
  } catch (error) {
    console.error('[Notification] ❌ Error:', error);
    return false;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    console.log(`[Notification] 📨 Sending to ${userIds.length} users:`, userIds);
    
    // Get tokens for all users
    const tokenPromises = userIds.map(userId => getUserFCMToken(userId));
    const tokens = await Promise.all(tokenPromises);
    
    // Filter out null tokens
    const validTokens = tokens.filter(token => token !== null) as string[];
    
    if (validTokens.length === 0) {
      console.log('[Notification] ⚠️ No valid FCM tokens found for recipients');
      return;
    }
    
    console.log(`[Notification] ✅ Found ${validTokens.length} valid tokens`);
    
    // Send to all valid tokens
    const sendPromises = validTokens.map(token => 
      sendNotificationViaCloudFunction(token, title, body, data)
    );
    
    await Promise.all(sendPromises);
    console.log('[Notification] 📬 Batch send complete (logged)');
  } catch (error) {
    console.error('[Notification] ❌ Error sending to multiple users:', error);
  }
}

/**
 * Get all team member tokens except specified users
 */
export async function getAllTeamTokensExcept(excludeUserIds: string[]): Promise<string[]> {
  try {
    // Get all team members
    const membersRef = ref(database, 'teamMembers');
    const snapshot = await get(membersRef);
    
    if (!snapshot.exists()) {
      console.log('[Notification] No team members found');
      return [];
    }
    
    const allMembers = snapshot.val();
    const memberIds = Object.keys(allMembers);
    
    // Filter out excluded users
    const targetUserIds = memberIds.filter(id => !excludeUserIds.includes(id));
    
    console.log(`[Notification] Target users (${targetUserIds.length}):`, targetUserIds);
    console.log(`[Notification] Excluded users (${excludeUserIds.length}):`, excludeUserIds);
    
    // Get tokens for target users
    const tokenPromises = targetUserIds.map(userId => getUserFCMToken(userId));
    const tokens = await Promise.all(tokenPromises);
    
    // Filter out null tokens
    const validTokens = tokens.filter(token => token !== null) as string[];
    
    console.log(`[Notification] Found ${validTokens.length} valid tokens out of ${targetUserIds.length} users`);
    
    return validTokens;
  } catch (error) {
    console.error('[Notification] Error getting team tokens:', error);
    return [];
  }
}

/**
 * Send notification to all team members except specified users
 */
export async function notifyAllTeamExcept(
  excludeUserIds: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    const tokens = await getAllTeamTokensExcept(excludeUserIds);
    
    if (tokens.length === 0) {
      console.log('[Notification] No recipients found for team notification');
      return;
    }
    
    // Send to all tokens
    const sendPromises = tokens.map(token => 
      sendNotificationViaCloudFunction(token, title, body, data)
    );
    
    await Promise.all(sendPromises);
    console.log('[Notification] Team notification logged');
  } catch (error) {
    console.error('[Notification] Error sending team notification:', error);
  }
}

/**
 * Test notification function (for debugging)
 */
export async function testNotification(userId: string): Promise<void> {
  console.log('[Notification] 🧪 Testing notification system...');
  
  const token = await getUserFCMToken(userId);
  if (!token) {
    console.error('[Notification] ❌ No FCM token found for user:', userId);
    return;
  }
  
  console.log('[Notification] ✅ FCM token found');
  
  await sendNotificationViaCloudFunction(
    token,
    'Test Notification',
    'This is a test notification from Toi-Task',
    { type: 'test' }
  );
}
