# Firebase Realtime Database Security Rules - Setup Guide

## Overview

I've created comprehensive security rules for your Toi-Task Firebase database. These rules:

✅ **Protect user data** - Users can only access their own tasks
✅ **Secure team data** - Only admins can modify team members
✅ **Validate data** - Ensures data integrity
✅ **Enable queries** - Proper indexing for performance
✅ **Production-ready** - All security best practices

---

## Rules Included

### User Data Protection
- Users can only read/write their own data
- Tasks are isolated per user
- Comments are restricted to task owner
- Stats validation (no negative numbers)

### Team Member Management
- Public read access (all users can see team members)
- Write/delete restricted to admins only
- Email validation on team members
- Statistics tracking

### Admin Access
- Separate admin collection for verification
- Admin-only operations protected
- No public access to admin list

### Data Validation
- String length limits enforced
- Email format validation
- Boolean/number type checking
- URL validation for avatars
- Array size limits

### Database Indexing
- Indexed by createdAt for sorting
- Indexed by completed status
- Indexed by email for lookups
- Optimized for common queries

---

## How to Apply the Rules

### Method 1: Firebase Console (Recommended)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your "toi-task" project

2. **Navigate to Realtime Database**
   - Click "Realtime Database" in left menu
   - Click "Rules" tab at the top

3. **Copy the Rules**
   - Open `firebase_rules.json` file in this directory
   - Copy all the content inside the `"rules": { }` object

4. **Paste and Publish**
   - Paste into the rules editor
   - Click "Publish" button
   - Wait for confirmation message

### Method 2: Firebase CLI

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Project** (if not done)
   ```bash
   firebase init database
   ```

4. **Update Rules File**
   - Copy contents of `firebase_rules.json`
   - Paste into `database.rules.json` in your project

5. **Deploy Rules**
   ```bash
   firebase deploy --only database
   ```

### Method 3: Manual Copy-Paste

1. Open `firebase_rules.json` in this directory
2. Go to Firebase Console → Realtime Database → Rules
3. Copy the entire content
4. Paste into the rules editor
5. Click "Publish"

---

## Verifying the Rules

### Check in Firebase Console
1. Firebase Console → Realtime Database → Rules
2. Should show your rules (not the default test rules)
3. Look for green checkmark if valid

### Test the Rules
1. Try to read another user's data (should fail)
2. Try to create team member (should fail if not admin)
3. Try to write to your own tasks (should succeed)
4. Try to add comments (should succeed)

---

## Important: Setting Up Admin Users

Your rules reference an `admins` collection. Here's how to set it up:

### Step 1: Get Your Admin UID
1. Firebase Console → Authentication → Users
2. Find your admin user (the one with authorized email)
3. Copy their UID

### Step 2: Create Admin Entry
1. Firebase Console → Realtime Database
2. Click on "+" next to "root"
3. Create new key: `admins`
4. Click on "+" next to "admins"
5. Create new key: (paste the UID from Step 1)
6. Set value: `true`

**Example:**
```
admins/
  Nx5K4m2L8pQzR9X7vW4b6T3a1/ = true
  (your admin UID here)
```

---

## Rules Explanation

### User Tasks Structure
```json
{
  ".read": "auth.uid === $uid",           // Only owner can read
  ".write": "auth.uid === $uid",          // Only owner can write
  ".indexOn": ["createdAt", "completed"]  // For queries
}
```

### Team Members Structure
```json
{
  ".read": true,                          // Everyone can read
  ".write": "root.child('admins').child(auth.uid).exists()",
                                          // Only admins can write
  ".indexOn": ["createdAt", "email"]      // For queries
}
```

### Data Validation
```json
{
  "name": {
    ".validate": "newData.isString() && newData.val().length > 0"
    // Ensures name is non-empty string
  }
}
```

---

## Security Best Practices Applied

✅ **Least Privilege** - Users only access what they own
✅ **Admin Verification** - Separate admin collection check
✅ **Data Validation** - Type and format checking
✅ **Query Optimization** - Proper indexing
✅ **Rate Limiting Ready** - Can add later if needed
✅ **No Sensitive Data** - Admin list not readable

---

## Common Issues & Solutions

### Issue: "Permission denied" errors
**Solution**: 
1. Verify you're logged in as the task owner
2. Check that your UID matches the path
3. Wait 30 seconds after publishing rules

### Issue: "Can't add team members"
**Solution**:
1. Make sure your user is in the `admins` collection
2. Copy your exact UID from Firebase Auth
3. Wait for rules to propagate

### Issue: "Rules still showing old settings"
**Solution**:
1. Refresh the page
2. Clear browser cache
3. Try incognito/private window
4. Check Firebase Console shows the new rules

### Issue: "Can't read team members"
**Solution**:
1. Team members should be readable by all authenticated users
2. Check that `.read: true` is set
3. Verify authentication is working

---

## Rules vs. Test Mode

### Test Mode (Temporary)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
⚠️ Dangerous! Everyone can read/write everything!

### Production Rules (Included)
✅ Secure access control
✅ Data validation
✅ Admin verification
✅ User data isolation

---

## Testing Your Rules

### Test 1: User Can Read Own Data
1. Sign in as User A
2. Try to read `/users/{UserA_UID}/tasks`
3. ✅ Should succeed

### Test 2: User Cannot Read Other's Data
1. Sign in as User A
2. Try to read `/users/{UserB_UID}/tasks`
3. ❌ Should fail with "Permission denied"

### Test 3: Non-Admin Cannot Add Team Member
1. Sign in as regular user
2. Try to write to `/teamMembers/{newId}`
3. ❌ Should fail with "Permission denied"

### Test 4: Admin Can Add Team Member
1. Sign in as admin user
2. Try to write to `/teamMembers/{newId}`
3. ✅ Should succeed

### Test 5: Everyone Can Read Team Members
1. Sign in as any user
2. Try to read `/teamMembers`
3. ✅ Should succeed

---

## Advanced Customization

### Allow Read Access to User Profiles (Optional)
Current: Only owner can see full profile
To change:
```json
"profile": {
  ".read": true,  // Change from: "auth.uid === $uid"
  ".write": "auth.uid === $uid"
}
```

### Add Rate Limiting (Optional)
```json
".write": "auth.uid === $uid && root.child('users').child(auth.uid).child('writeCount').val() < 100"
```

### Add Timestamp Validation (Optional)
```json
"createdAt": {
  ".validate": "newData.isString() && now > newData.val()"
}
```

---

## Deploying to Production

### Step 1: Apply These Rules
Follow "How to Apply the Rules" section above

### Step 2: Test Everything
Use "Testing Your Rules" section to verify

### Step 3: Monitor for Errors
1. Firebase Console → Realtime Database
2. Check for any permission errors
3. Review application logs

### Step 4: Adjust if Needed
If legitimate operations fail:
1. Check the error in Firebase Console
2. Adjust rules accordingly
3. Test again
4. Redeploy

---

## Rules File Location

**File**: `firebase_rules.json` (in project root)

This file can be:
- Used with Firebase CLI
- Copied to `database.rules.json`
- Pasted directly in Firebase Console
- Version controlled in your repository

---

## Next Steps

1. **Apply the rules** using one of the three methods above
2. **Set up admin users** by adding to `admins` collection
3. **Test all operations** using test cases provided
4. **Monitor for errors** in Firebase Console
5. **Deploy to production** when confident

---

## Support

### If Rules Don't Work
1. Check Firebase Console for error messages
2. Verify your UID is correct
3. Make sure you're in the `admins` collection
4. Wait 30 seconds for propagation
5. Check browser console for JavaScript errors

### If You Need to Modify Rules
1. Edit `firebase_rules.json`
2. Test the changes
3. Redeploy using Firebase Console or CLI

### Questions?
- See FIREBASE_SETUP_GUIDE.md for more details
- Check Firebase documentation: https://firebase.google.com/docs/rules
- Review database structure in README_FIREBASE.md

---

## Important Reminders

⚠️ **Rules take effect immediately** - Be careful when modifying
⚠️ **Test before deploying** - Use test cases provided
⚠️ **Save backups** - Keep a copy of your rules
✅ **Version control** - Add to Git if using
✅ **Document changes** - Track rule modifications
✅ **Monitor usage** - Check Firebase Console regularly

---

**Your security rules are ready to deploy! 🔐**

Choose your deployment method above and apply them to your Firebase project.
