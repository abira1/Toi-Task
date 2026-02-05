# Firebase Rules Deployment Guide

## ⚠️ IMPORTANT: Update Firebase Rules

The database structure has changed to use a global `tasks/` collection. You **MUST** update your Firebase Realtime Database rules for the app to work properly.

---

## Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **toi-task**
3. Click on **Realtime Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the entire content from `/app/firebase_rules.json`
6. Paste into the rules editor
7. Click **Publish**

---

## Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
cd /app
firebase deploy --only database
```

---

## What Changed

### New Global Tasks Collection

```json
"tasks": {
  ".read": "auth != null",  // All authenticated users can read all tasks
  ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid)",
  // Users can create tasks, but only modify/delete their own
  
  "comments": {
    ".read": "auth != null",
    ".write": "auth != null"  // All users can add comments to any task
  }
}
```

### Why This is Required

- **Without updated rules**: Users cannot read/write to the global `tasks/` collection
- **App will fail**: Firebase will reject all read/write operations
- **Error messages**: "Permission denied" errors in browser console

---

## Verification

After deploying rules, test in Firebase Console:

1. Go to Realtime Database → Data tab
2. You should see a `tasks` node (after creating first task)
3. Structure should look like:
   ```
   tasks/
     -NxAbCdEfGhIjKlMnOp/
       id: "-NxAbCdEfGhIjKlMnOp"
       userId: "abc123"
       text: "My first task"
       completed: false
       createdAt: "2025-02-05T10:30:00.000Z"
       likes: 0
       comments: {}
   ```

---

## Testing After Deployment

1. Login to the app
2. Create a task
3. Check browser console for errors
4. If you see "Permission denied" → Rules not deployed correctly
5. If task appears → ✅ Success!

---

## Rollback (If Needed)

If something goes wrong, you can rollback to the old structure:

1. In Firebase Console → Realtime Database → Rules
2. Remove the global `tasks` section
3. Publish rules
4. Revert code changes in `/app/src/hooks/useFirebaseTasks.ts`

---

## Support

If you encounter issues:
- Check Firebase Console → Realtime Database → Rules for syntax errors
- Review browser console for Firebase error messages
- Ensure user is authenticated before testing
