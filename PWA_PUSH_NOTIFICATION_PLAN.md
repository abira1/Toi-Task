# 🚀 PWA & Push Notification Implementation Plan

## 📊 Project Overview

**Application:** Toi-Task - Team Task Management System  
**Tech Stack:** React + TypeScript + Vite + Firebase  
**Implementation Date:** February 5, 2026  

---

## 🎯 Implementation Goals

### PWA Features
- ✅ Make app installable on mobile and desktop
- ✅ Enable offline functionality
- ✅ Fast loading with service worker caching
- ✅ App-like experience with custom icons and splash screens

### Push Notification Features
- ✅ **Task Created:** Notify ALL team members when someone adds a new task
- ✅ **Comment Added:** Notify ONLY the task owner when someone comments on their task
- ✅ **Task Completed:** Notify ALL team members when someone marks a task as done

---

## 📋 Phase-Wise Implementation Plan

---

## **PHASE 1: PWA Setup & Configuration** 🎨

### Objectives:
- Create PWA manifest file
- Configure app icons and metadata
- Update HTML for PWA support
- Add basic service worker
- Enable app installation

### Tasks:

#### 1.1 Create Manifest File
**File:** `/app/public/manifest.json`
- Define app name, description, colors
- Configure app icons (192x192, 512x512)
- Set display mode to "standalone"
- Define start URL and scope

#### 1.2 Update HTML
**File:** `/app/index.html`
- Add manifest link
- Add theme-color meta tag
- Add apple-touch-icon for iOS
- Add viewport settings for PWA

#### 1.3 Create Basic Service Worker
**File:** `/app/public/service-worker.js`
- Cache static assets (HTML, CSS, JS, images)
- Implement cache-first strategy for assets
- Network-first strategy for API calls
- Handle offline fallback

#### 1.4 Register Service Worker
**File:** `/app/src/serviceWorkerRegistration.ts`
- Create service worker registration utility
- Handle registration success/failure
- Add update notification logic

#### 1.5 Update Vite Config
**File:** `/app/vite.config.ts`
- Configure service worker in build
- Ensure proper asset handling

### Deliverables:
✅ App installable on devices  
✅ Offline mode working  
✅ Custom app icons displayed  
✅ Splash screen on launch  

### Success Criteria:
- [ ] Browser shows "Install App" prompt
- [ ] App can be installed on mobile/desktop
- [ ] App works without internet connection
- [ ] Custom icons appear in app launcher

---

## **PHASE 2: Firebase Cloud Messaging Setup** 📨

### Objectives:
- Integrate Firebase Cloud Messaging (FCM)
- Request notification permissions
- Store FCM tokens for users
- Handle token refresh

### Tasks:

#### 2.1 Update Firebase Configuration
**File:** `/app/src/firebase.ts`
- Import Firebase Messaging
- Initialize messaging instance
- Add FCM configuration

#### 2.2 Create FCM Service Worker
**File:** `/app/public/firebase-messaging-sw.js`
- Handle background notifications
- Customize notification display
- Handle notification clicks
- Navigate to relevant task on click

#### 2.3 Create Notification Permission Hook
**File:** `/app/src/hooks/useNotificationPermission.ts`
- Request notification permission from user
- Get FCM token after permission granted
- Handle permission denial
- Store token in state

#### 2.4 Create Token Management Hook
**File:** `/app/src/hooks/useFCMToken.ts`
- Get FCM token for current user
- Save token to Firebase Realtime Database
- Handle token refresh
- Delete token on logout

#### 2.5 Update Database Schema
**Location:** Firebase Realtime Database
- Create `/fcmTokens/{userId}` collection
- Store user tokens with timestamp
- Index tokens for efficient queries

#### 2.6 Add Environment Variables
**File:** `/app/.env`
- Add Firebase Web Push Certificate (VAPID Key)
- Add Server Key for backend notifications

### Deliverables:
✅ FCM integrated with Firebase project  
✅ Users can grant notification permission  
✅ FCM tokens stored in database  
✅ Token refresh handling implemented  

### Success Criteria:
- [ ] Permission dialog appears correctly
- [ ] FCM token generated after permission
- [ ] Token saved to Firebase Database
- [ ] Token updates on app reload

---

## **PHASE 3: Notification Trigger System** 🔔

### Objectives:
- Hook into task operations
- Send notifications on specific events
- Format notification messages
- Include user names and context

### Tasks:

#### 3.1 Create Notification Service
**File:** `/app/src/services/notificationService.ts`
- Function to send notification to single user
- Function to send notification to all users
- Format notification payload
- Handle errors gracefully

#### 3.2 Update Task Hook - Add Task
**File:** `/app/src/hooks/useFirebaseTasks.ts`
- Modify `addTask` function
- Get all team member tokens
- Send notification: "[User Name] Added a New task"
- Exclude notification to task creator

#### 3.3 Update Task Hook - Add Comment
**File:** `/app/src/hooks/useFirebaseTasks.ts`
- Modify `addComment` function
- Get task owner's token
- Send notification: "[User Name] comment on [Owner Name]'s task"
- Exclude notification if commenter is task owner

#### 3.4 Update Task Hook - Toggle Completion
**File:** `/app/src/hooks/useFirebaseTasks.ts`
- Modify `toggleTaskCompletion` function
- Get all team member tokens
- Send notification: "[User Name] mark a task done"
- Exclude notification to task completer

#### 3.5 Create Notification Backend API (Optional)
**File:** `/app/src/api/notifications.ts`
- Create API endpoint to send FCM notifications
- Use Firebase Server Key
- Handle multiple recipients
- Return success/failure status

### Deliverables:
✅ Notifications sent on task creation  
✅ Notifications sent on comments  
✅ Notifications sent on task completion  
✅ Proper recipient filtering  

### Success Criteria:
- [ ] All members notified when task added
- [ ] Only task owner notified on comment
- [ ] All members notified when task completed
- [ ] Notifications show correct user names
- [ ] Task creator doesn't receive own notifications

---

## **PHASE 4: Notification Handling & UX** 🎨

### Objectives:
- Handle foreground notifications
- Handle background notifications
- Navigate to task on notification click
- Add notification settings UI

### Tasks:

#### 4.1 Foreground Notification Handler
**File:** `/app/src/App.tsx`
- Listen for foreground messages
- Display in-app notification banner
- Auto-dismiss after 5 seconds
- Add click to navigate to task

#### 4.2 Background Notification Handler
**File:** `/app/public/firebase-messaging-sw.js`
- Enhance notification click handling
- Extract task ID from notification data
- Navigate to home page with task highlighted
- Handle app not open scenario

#### 4.3 Add Notification Settings Component
**File:** `/app/src/components/NotificationSettings.tsx`
- Toggle notifications on/off
- Show current notification status
- Request permission if not granted
- Display FCM token status

#### 4.4 Add Install App Prompt
**File:** `/app/src/components/InstallPrompt.tsx`
- Detect if app is installable
- Show custom install button
- Handle install flow
- Hide after installation

#### 4.5 Update Profile Page
**File:** `/app/src/pages/ProfilePage.tsx`
- Add notification settings section
- Display notification permission status
- Add button to enable/disable notifications

#### 4.6 Add Notification Badge (Optional)
**File:** `/app/src/components/Sidebar.tsx`
- Show unread notification count
- Clear count on page view
- Persist count in localStorage

### Deliverables:
✅ Foreground notifications displayed in-app  
✅ Background notifications work when app closed  
✅ Clicking notification navigates to task  
✅ User can control notification settings  
✅ Install app prompt shown to users  

### Success Criteria:
- [ ] Notifications appear when app is open
- [ ] Notifications appear when app is closed
- [ ] Clicking notification opens correct task
- [ ] Users can enable/disable notifications
- [ ] Install prompt works correctly
- [ ] App installs successfully on devices

---

## **PHASE 5: Testing & Optimization** ✅

### Objectives:
- Test on multiple devices
- Test all notification scenarios
- Optimize performance
- Handle edge cases

### Tasks:

#### 5.1 Device Testing
- Test on Android Chrome
- Test on iOS Safari
- Test on Desktop Chrome
- Test on Desktop Edge/Firefox

#### 5.2 Notification Flow Testing
- Test task creation notification
- Test comment notification
- Test task completion notification
- Test with multiple users
- Test offline mode
- Test notification click navigation

#### 5.3 Edge Case Handling
- Handle permission denial gracefully
- Handle FCM token generation failure
- Handle network errors
- Handle browser compatibility issues
- Handle user without FCM token

#### 5.4 Performance Optimization
- Optimize service worker caching
- Minimize notification payload size
- Batch notifications if needed
- Add rate limiting to prevent spam

#### 5.5 Error Handling & Logging
- Add error logging for FCM failures
- Log notification send failures
- Add retry mechanism for failed sends
- Display user-friendly error messages

### Deliverables:
✅ Tested on all major browsers  
✅ All notification scenarios working  
✅ Edge cases handled  
✅ Performance optimized  

### Success Criteria:
- [ ] Works on Android and iOS
- [ ] All 3 notification types working
- [ ] No errors in console
- [ ] Fast notification delivery
- [ ] Proper error handling

---

## 🔑 Configuration Details

### Firebase Server Key
```
BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA
```

### Notification Recipients
| Event | Recipients | Example |
|-------|-----------|---------|
| Task Added | ALL team members (except creator) | "Abir Hossain Added a New task" |
| Comment Added | ONLY task owner (except if owner comments) | "Jihad comment on Abir's task" |
| Task Completed | ALL team members (except completer) | "Fahim mark a task done" |

### App Icons
- ✅ 192x192 (icon-192.png)
- ✅ 512x512 (icon-512.png)
- ✅ Maskable icons for Android
- ✅ Apple touch icon for iOS
- ✅ Favicon

---

## 📦 Dependencies to Add

```json
{
  "firebase": "^12.8.0" // Already installed
}
```

No additional dependencies needed! Firebase SDK includes FCM.

---

## 🚀 Deployment Checklist

- [ ] Service worker registered
- [ ] Manifest file served correctly
- [ ] Icons accessible via HTTPS
- [ ] FCM VAPID key configured
- [ ] Firebase Cloud Messaging enabled in console
- [ ] Notification permission requested from users
- [ ] FCM tokens stored in database
- [ ] All notification triggers working
- [ ] Tested on mobile devices
- [ ] Tested on desktop browsers

---

## 📝 Notes

1. **HTTPS Required:** PWA and Push Notifications only work on HTTPS (or localhost)
2. **Browser Support:** 
   - Chrome, Edge: Full support
   - Safari: Limited PWA support, no push on iOS < 16.4
   - Firefox: Full support
3. **Token Management:** FCM tokens can change, so always refresh on app load
4. **Rate Limiting:** Consider adding limits to prevent notification spam
5. **Testing:** Use Firebase Console to test notifications manually first

---

## 🎯 Success Metrics

After implementation, we should achieve:
- ✅ 100% notification delivery rate
- ✅ < 2 second notification delay
- ✅ 90%+ user permission grant rate
- ✅ App installation rate > 60%
- ✅ Zero notification errors
- ✅ Offline mode works perfectly

---

## 📞 Support & Troubleshooting

### Common Issues:
1. **Notification permission denied:** Guide user to re-enable in browser settings
2. **FCM token not generated:** Check Firebase config and browser console
3. **Service worker not registering:** Check HTTPS and browser support
4. **Notifications not received:** Verify FCM token in database
5. **App not installable:** Check manifest.json syntax and icon paths

---

**Plan Created:** February 5, 2026  
**Total Phases:** 5  
**Estimated Implementation Time:** 4-6 hours  
**Current Status:** Ready to Start Phase 1 🚀
