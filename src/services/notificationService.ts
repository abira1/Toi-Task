import { ref, get } from 'firebase/database';
import { database } from '../firebase';

// Firebase Server Key for FCM
const FCM_SERVER_KEY = 'BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA';

/**
 * Get FCM token for a specific user from Firebase Database
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
 * Send notification to a single user using FCM REST API
 */
export async function sendNotificationToUser(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
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
          title: title,
          body: body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200]
        },
        data: data || {}
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[Notification] Sent successfully:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error('[Notification] Failed to send:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending notification:', error);
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
    console.log(`[Notification] Sending to ${userIds.length} users:`, userIds);
    
    // Get tokens for all users
    const tokenPromises = userIds.map(userId => getUserFCMToken(userId));
    const tokens = await Promise.all(tokenPromises);
    
    // Filter out null tokens
    const validTokens = tokens.filter(token => token !== null) as string[];
    
    if (validTokens.length === 0) {
      console.log('[Notification] No valid FCM tokens found for recipients');
      return;
    }
    
    console.log(`[Notification] Found ${validTokens.length} valid tokens`);
    
    // Send to all valid tokens
    const sendPromises = validTokens.map(token => 
      sendNotificationToUser(token, title, body, data)
    );
    
    await Promise.all(sendPromises);
    console.log('[Notification] Batch send complete');
  } catch (error) {
    console.error('[Notification] Error sending to multiple users:', error);
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
      sendNotificationToUser(token, title, body, data)
    );
    
    await Promise.all(sendPromises);
    console.log('[Notification] Team notification sent successfully');
  } catch (error) {
    console.error('[Notification] Error sending team notification:', error);
  }
}
