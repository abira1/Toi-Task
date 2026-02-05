# Copy and Paste These Rules into Firebase Console

Go to Firebase Console → Realtime Database → Rules tab and paste this:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid"
      }
    },
    "tasks": {
      ".read": "auth != null",
      ".indexOn": ["createdAt", "userId"],
      "$taskId": {
        ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid)",
        "comments": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "teamMembers": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists() === true"
    },
    "admins": {
      ".read": false,
      ".write": false
    }
  }
}
```

## What These Rules Do:

1. **users/** - Users can only read/write their own data
2. **tasks/** - All authenticated users can:
   - ✅ Read all tasks
   - ✅ Create new tasks
   - ✅ Edit/delete only their own tasks (checked by userId)
   - ✅ Add comments to any task
3. **teamMembers/** - All authenticated users can read, only admins can write
4. **admins/** - Internal use only

## Steps:
1. Copy the JSON rules above (including the outer `{}`)
2. Go to Firebase Console
3. Select your project: **toi-task**
4. Click **Realtime Database** → **Rules** tab
5. Delete everything and paste the new rules
6. Click **Publish**

✅ Done!
