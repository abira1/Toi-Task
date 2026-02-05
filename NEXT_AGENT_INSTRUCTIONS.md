# 🚀 PHASE 3 - NEXT AGENT INSTRUCTIONS

## 📋 CURRENT SITUATION

### ✅ What's Complete:
1. **Notification Service Created** (`/app/src/services/notificationService.ts`)
   - All helper functions implemented
   - FCM token fetching works
   - User name fetching works
   - Notification logic is correct

2. **Task Hooks Updated** (`/app/src/hooks/useFirebaseTasks.ts`)
   - Task creation triggers notification ✅
   - Comment triggers notification ✅  
   - Task completion triggers notification ✅
   - All use fire-and-forget pattern ✅
   - Error handling implemented ✅

3. **Notification Backend Created** (`/app/notification-backend/`)
   - Express server to bypass CORS
   - Two endpoints: single & batch notifications
   - Uses FCM REST API properly
   - Ready to start but NOT running yet

### ❌ What's NOT Working:

**CRITICAL ISSUE**: Notifications are blocked by CORS!
- Browser cannot call FCM REST API directly (security restriction)
- Created backend server but NOT STARTED yet
- Frontend still calls FCM directly (which fails with CORS error)

**ADDITIONAL ISSUE**: Service worker update popup loops
- Fixed in code but not tested yet

---

## 🎯 WHAT YOU NEED TO DO (Step-by-step)

### STEP 1: Start the Notification Backend (5 mins)

```bash
# Update supervisor to include notification backend
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start notification-backend
sudo supervisorctl status
```

**Verify backend is running:**
```bash
# Check logs
tail -f /var/log/supervisor/notification-backend.out.log

# Test health endpoint
curl http://localhost:8080/health
# Should return: {"status":"ok","message":"Notification backend is running"}
```

---

### STEP 2: Update Notification Service to Use Backend (10 mins)

**File to edit**: `/app/src/services/notificationService.ts`

**Replace the `sendNotificationToUser` function** with:

```typescript
/**
 * Send notification to a single user via backend API
 */
export async function sendNotificationToUser(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  try {
    console.log('[Notification] Sending via backend API...');
    console.log('[Notification] Title:', title);
    console.log('[Notification] Body:', body);
    
    const response = await fetch('http://localhost:8080/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken,
        title,
        body,
        data: data || {}
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('[Notification] ✅ Sent successfully:', result);
      return true;
    } else {
      console.error('[Notification] ❌ Failed to send:', result);
      return false;
    }
  } catch (error) {
    console.error('[Notification] ❌ Error sending notification:', error);
    return false;
  }
}
```

**Replace the `sendNotificationToUsers` function** with:

```typescript
/**
 * Send notification to multiple users via backend API
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
    
    // Send batch notification via backend
    const response = await fetch('http://localhost:8080/send-batch-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: validTokens,
        title,
        body,
        data: data || {}
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('[Notification] ✅ Batch sent successfully:', result);
    } else {
      console.error('[Notification] ❌ Batch send failed:', result);
    }
  } catch (error) {
    console.error('[Notification] ❌ Error sending batch:', error);
  }
}
```

**Update `notifyAllTeamExcept` function** to use the new backend approach:

```typescript
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
    
    // Send batch via backend
    const response = await fetch('http://localhost:8080/send-batch-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens,
        title,
        body,
        data: data || {}
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('[Notification] ✅ Team notification sent:', result);
    } else {
      console.error('[Notification] ❌ Team notification failed:', result);
    }
  } catch (error) {
    console.error('[Notification] ❌ Error sending team notification:', error);
  }
}
```

---

### STEP 3: Restart Frontend (2 mins)

```bash
sudo supervisorctl restart frontend
sudo supervisorctl status
```

Wait 10 seconds, then check:
```bash
tail -n 30 /var/log/supervisor/frontend.out.log
```

Should see: "compiled successfully" or "ready in X ms"

---

### STEP 4: Test Notifications (10 mins)

#### Test 1: Check Backend is Accessible
```bash
# From terminal
curl -X POST http://localhost:8080/send-notification \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"test","title":"Test","body":"Hello"}'
```

Should return JSON with success/error (will fail because token is fake, but API works)

#### Test 2: Open Browser Console
1. Open the app in browser
2. Open DevTools Console (F12)
3. Look for any errors

#### Test 3: Enable Notifications
1. Go to Profile page
2. Click "Enable Notifications"
3. Allow permission
4. Check console for "[Notification]" logs
5. Verify FCM token is saved

#### Test 4: Test Task Creation Notification
**Requires 2 users logged in (different browsers/incognito):**

**User A (Browser 1):**
1. Login
2. Enable notifications in Profile
3. Note the user name

**User B (Browser 2):**
1. Login (use incognito)
2. Enable notifications in Profile
3. Create a new task
4. Check console - should see:
   ```
   [Notification] Sending via backend API...
   [Notification] ✅ Sent successfully
   ```

**User A should receive notification:**
- If app open: Banner at top
- If app closed: System notification

#### Test 5: Test Comment Notification
1. User A creates a task
2. User B comments on User A's task
3. User A should receive notification: "[User B Name] comment on your task"

#### Test 6: Test Completion Notification
1. User A marks a task as complete
2. User B should receive notification: "[User A Name] mark a task done"

---

### STEP 5: Fix Service Worker Loop (if still happening)

If you still see "New version available!" popup looping:

**Option A: Clear cache completely**
```javascript
// In browser console, run:
sessionStorage.clear();
localStorage.clear();
location.reload();
```

**Option B: Unregister all service workers**
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
  location.reload();
});
```

**Option C: Update service worker cache name**
Edit `/app/public/service-worker.js`:
```javascript
// Change line 4 from:
const CACHE_NAME = 'toi-task-v1';
// To:
const CACHE_NAME = 'toi-task-v2';
```

Then restart frontend:
```bash
sudo supervisorctl restart frontend
```

---

## 🐛 TROUBLESHOOTING

### Problem: Backend won't start
**Check logs:**
```bash
tail -f /var/log/supervisor/notification-backend.err.log
```

**Solution**: Check if port 8080 is already in use:
```bash
lsof -i :8080
# If something is using it, kill it:
kill -9 <PID>
# Then restart:
sudo supervisorctl restart notification-backend
```

### Problem: "Connection refused" in frontend logs
**Cause**: Backend is not running

**Solution**:
```bash
sudo supervisorctl status notification-backend
# If not running:
sudo supervisorctl start notification-backend
```

### Problem: "Failed to fetch" from localhost:8080
**Cause**: Frontend and backend on different origins

**Solution**: Update notification service to use relative path or proxy

**Alternative**: Add proxy in vite.config.ts:
```typescript
export default {
  server: {
    proxy: {
      '/api/notify': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notify/, '')
      }
    }
  }
}
```

Then use `/api/notify/send-notification` in fetch calls.

### Problem: Notifications still not received
**Debug checklist:**
1. ✅ Backend running? Check `supervisorctl status`
2. ✅ FCM tokens saved? Check Firebase Console → Database → `/fcmTokens`
3. ✅ Permission granted? Check Profile page shows "Connected"
4. ✅ Console shows "✅ Sent successfully"? Check browser console
5. ✅ Backend logs show success? Check `tail -f /var/log/supervisor/notification-backend.out.log`

**Try sending test notification via Firebase Console:**
1. Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Copy FCM token from Profile page
4. Paste and send
5. Should receive notification
6. If this works, backend issue. If not, FCM setup issue.

### Problem: "CORS error" still appearing
**Cause**: Still calling FCM directly instead of backend

**Solution**: Make sure you replaced ALL THREE functions in Step 2:
- `sendNotificationToUser`
- `sendNotificationToUsers`  
- `notifyAllTeamExcept`

Search the file for `https://fcm.googleapis.com` - should NOT appear anymore!

---

## 📊 SUCCESS CRITERIA

Phase 3 is TRULY complete when:

- ✅ Backend server running on port 8080
- ✅ Health check returns 200 OK
- ✅ Frontend uses backend API (not FCM directly)
- ✅ Console shows "✅ Sent successfully" when creating tasks
- ✅ Backend logs show notifications being sent
- ✅ User B receives notification when User A creates task
- ✅ User A receives notification when User B comments on their task
- ✅ User B receives notification when User A completes task
- ✅ No CORS errors in console
- ✅ No service worker update loop
- ✅ Notifications work in foreground (banner) and background (system)

---

## 📝 FINAL CHECKLIST

Before calling Phase 3 complete:

```bash
# 1. Check all services running
sudo supervisorctl status
# Should see:
# - frontend: RUNNING
# - notification-backend: RUNNING
# - mongodb: RUNNING

# 2. Test backend health
curl http://localhost:8080/health
# Should return: {"status":"ok",...}

# 3. Check frontend compiled
tail -n 10 /var/log/supervisor/frontend.out.log
# Should see: "compiled successfully" or "ready"

# 4. Check no errors
tail -n 20 /var/log/supervisor/notification-backend.err.log
tail -n 20 /var/log/supervisor/frontend.err.log
# Should be minimal/no errors

# 5. Test in browser
# - Open app
# - Enable notifications
# - Create task
# - Check console for "[Notification] ✅ Sent successfully"
```

---

## 🎯 SUMMARY FOR NEXT AGENT

**Your mission:** Fix CORS issue so notifications actually send

**What to do:**
1. Start notification backend server (`supervisorctl`)
2. Update `/app/src/services/notificationService.ts` to use `http://localhost:8080` instead of `https://fcm.googleapis.com`
3. Restart frontend
4. Test with 2 users
5. Verify notifications are received

**Time estimate:** 30-45 minutes

**Expected outcome:** 
- Users receive push notifications when tasks created/commented/completed
- No CORS errors
- Console shows "✅ Sent successfully"

**Files to edit:**
- `/app/src/services/notificationService.ts` (3 functions)
- Possibly `/app/public/service-worker.js` (cache version if popup loops)

**Commands you'll run:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart all
curl http://localhost:8080/health
tail -f /var/log/supervisor/notification-backend.out.log
```

---

## 📞 IF YOU GET STUCK

1. **Read the error message carefully** - it tells you what's wrong
2. **Check the logs** - all services log to `/var/log/supervisor/`
3. **Test backend separately** - use curl to verify it works
4. **Check browser console** - all notification events are logged
5. **Use Firebase Console** - test FCM tokens directly without code

**Remember**: The notification logic is CORRECT. The only issue is CORS. Once backend is running and frontend uses it, everything will work!

---

**Status**: Backend created ✅ | Backend NOT started ❌ | Frontend NOT updated ❌

**Next agent**: Start backend + Update frontend = Notifications working! 🎉
