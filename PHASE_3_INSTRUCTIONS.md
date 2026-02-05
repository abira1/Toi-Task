# 🚀 PHASE 3: Notification Trigger System - Instructions for Next Agent

## 📋 Quick Context

**Phase 1:** ✅ PWA Setup Complete  
**Phase 2:** ✅ Firebase Cloud Messaging Setup Complete  
**Phase 3:** ⏳ YOU ARE HERE - Implement notification triggers

---

## 🎯 Your Mission: Send Notifications on Task Events

Implement automatic push notifications when users perform these actions:

| Event | Who Gets Notified | Message Format | Exclude |
|-------|-------------------|----------------|---------|
| **Task Created** | ALL team members | "[User Name] Added a New task" | Task creator |
| **Comment Added** | ONLY task owner | "[User Name] comment on [Owner Name]'s task" | If commenter = owner |
| **Task Completed** | ALL team members | "[User Name] mark a task done" | Task completer |

---

## 🔑 Key Information You Need

### Firebase Server Key (for sending notifications):
```
BBRZGkxOXXIVzhJMuBS_htazyNWzxYRGTLSuSBO_CRbnbQw4Q-f8N8W69Cjit5QsY_H66n5Yg1awieEj_IzIfDA
```

### FCM Tokens Location:
- Firebase Realtime Database path: `/fcmTokens/{userId}`
- Each token has: `{ token: string, updatedAt: string }`

### Files You Need to Modify:
1. `/app/src/hooks/useFirebaseTasks.ts` - Add notification triggers to task operations
2. Create `/app/src/services/notificationService.ts` - Helper functions to send notifications

---

## 📝 Step-by-Step Implementation

### Step 1: Create Notification Service (20 mins)

**File:** `/app/src/services/notificationService.ts`

**What to create:**
```typescript
// Function to get FCM token for a user
export async function getUserFCMToken(userId: string): Promise<string | null>

// Function to send notification to one user
export async function sendNotificationToUser(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean>

// Function to send notification to multiple users
export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: any
): Promise<void>

// Function to get all team member tokens except specified users
export async function getAllTeamTokensExcept(excludeUserIds: string[]): Promise<string[]>
```

**How to send notifications:**
Use Firebase Cloud Messaging REST API:
```typescript
const response = await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `key=${SERVER_KEY}`
  },
  body: JSON.stringify({
    to: fcmToken,
    notification: {
      title: title,
      body: body
    },
    data: data
  })
});
```

---

### Step 2: Update Task Hook - Add Task (15 mins)

**File:** `/app/src/hooks/useFirebaseTasks.ts`

**Find:** `addTask` function  
**Add:** After task is successfully added to database:

```typescript
// Get all team member tokens except the creator
const tokens = await getAllTeamTokensExcept([user.id]);

// Send notification to all team members
await sendNotificationToUsers(
  tokens,
  'New Task Created',
  `${user.name} Added a New task`,
  { taskId: newTask.id, type: 'task_created' }
);
```

---

### Step 3: Update Task Hook - Add Comment (15 mins)

**File:** `/app/src/hooks/useFirebaseTasks.ts`

**Find:** `addComment` function  
**Add:** After comment is successfully added:

```typescript
// Get task owner
const task = tasks.find(t => t.id === taskId);
const ownerId = task.userId;

// Don't notify if owner is commenting on their own task
if (ownerId !== user.id) {
  const ownerToken = await getUserFCMToken(ownerId);
  
  if (ownerToken) {
    await sendNotificationToUser(
      ownerToken,
      'New Comment',
      `${user.name} comment on your task`,
      { taskId: taskId, type: 'comment_added' }
    );
  }
}
```

---

### Step 4: Update Task Hook - Toggle Completion (15 mins)

**File:** `/app/src/hooks/useFirebaseTasks.ts`

**Find:** `toggleTaskCompletion` function  
**Add:** After task completion status is updated:

```typescript
// Only send notification when marking as complete
if (!task.completed) { // Task is being marked as complete
  // Get all team member tokens except the completer
  const tokens = await getAllTeamTokensExcept([user.id]);
  
  // Send notification to all team members
  await sendNotificationToUsers(
    tokens,
    'Task Completed',
    `${user.name} mark a task done`,
    { taskId: taskId, type: 'task_completed' }
  );
}
```

---

## 🧪 Testing Checklist

After implementation, test these scenarios:

### Test 1: Task Creation Notification
1. User A creates a new task
2. ✅ User B receives notification: "[User A Name] Added a New task"
3. ✅ User A does NOT receive notification (creator excluded)
4. ✅ Clicking notification navigates to task

### Test 2: Comment Notification
1. User A creates a task (User A is owner)
2. User B comments on User A's task
3. ✅ User A receives notification: "[User B Name] comment on your task"
4. ✅ User B does NOT receive notification (commenter excluded)
5. ✅ User C does NOT receive notification (not task owner)

### Test 3: Task Completion Notification
1. User A marks a task as complete
2. ✅ User B receives notification: "[User A Name] mark a task done"
3. ✅ User A does NOT receive notification (completer excluded)
4. ✅ Notification only sent when marking complete (not when unchecking)

### Test 4: Error Handling
1. ✅ Works if user has no FCM token (graceful skip)
2. ✅ Works if notification send fails (logs error, doesn't crash)
3. ✅ Works with multiple users receiving simultaneously

---

## 📂 Files to Read First

Before starting, read these files to understand the codebase:

1. `/app/PWA_PUSH_NOTIFICATION_PLAN.md` - Overall plan
2. `/app/PHASE_2_COMPLETION.md` - What was done in Phase 2
3. `/app/src/hooks/useFirebaseTasks.ts` - Current task operations
4. `/app/src/hooks/useFirebaseTeamMembers.ts` - Team member management
5. `/app/src/firebase.ts` - Firebase configuration

---

## 💡 Implementation Tips

### Getting User Name:
```typescript
// User name is available in the hook's context
const userName = user?.name || 'Someone';
```

### Getting Team Members:
```typescript
// Import from Firebase Database
import { ref, get } from 'firebase/database';
import { database } from '../firebase';

const teamsRef = ref(database, 'teamMembers');
const snapshot = await get(teamsRef);
const teamMembers = snapshot.val();
```

### Error Handling:
```typescript
try {
  await sendNotification(...);
} catch (error) {
  console.error('[Notification] Failed to send:', error);
  // Don't throw - notifications are non-critical
}
```

### Async Operations:
```typescript
// Don't wait for notification to complete before returning
// Send notifications in background (fire and forget)
sendNotificationToUsers(...).catch(err => console.error(err));
```

---

## 🚨 Important Notes

1. **Don't Block User Actions:** Send notifications asynchronously (don't await them)
2. **Handle Missing Tokens:** Users might not have enabled notifications
3. **Exclude Self:** Always exclude the user performing the action
4. **Only When Completing:** Don't send notification when un-completing a task
5. **Log Errors:** Log all notification failures for debugging

---

## ✅ Success Criteria

Phase 3 is complete when:

- [ ] Notification service created with all required functions
- [ ] Task creation triggers notifications to all team members (except creator)
- [ ] Comments trigger notification to task owner only (except if owner comments)
- [ ] Task completion triggers notifications to all team members (except completer)
- [ ] No errors in console during normal operations
- [ ] Notifications appear in foreground (banner) and background (system)
- [ ] Notification clicks navigate to correct task
- [ ] Tested with at least 2 users
- [ ] Code properly typed with TypeScript
- [ ] Error handling for missing tokens/failed sends

---

## 📞 Need Help?

If you encounter issues:

1. **Check Console Logs:** Look for `[Notification]` prefixed messages
2. **Check Firebase Database:** Verify tokens exist at `/fcmTokens/{userId}`
3. **Test Server Key:** Send test notification via Firebase Console first
4. **Check CORS:** FCM REST API might have CORS issues (use proxy if needed)

---

## 🎉 After Completion

Create `/app/PHASE_3_COMPLETION.md` documenting:
- What was implemented
- Files created/modified
- Testing results
- Known issues
- Ready for Phase 4 (Notification Handling & UX)

---

**Estimated Time:** 60-90 minutes  
**Difficulty:** Medium  
**Prerequisites:** Phase 1 & 2 completed ✅

🚀 **Start Phase 3 implementation now!**
