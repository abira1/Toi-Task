# Firebase Setup & Deployment Guide

## Prerequisites
- Firebase account (https://firebase.google.com)
- Node.js and npm installed
- Google Cloud Console access

## Step 1: Firebase Project Configuration

### 1.1 Enable Google Authentication
1. Go to Firebase Console → toi-task project
2. Navigate to Authentication → Sign-in method
3. Enable "Google" provider
4. Add your domain to authorized domains

### 1.2 Configure Realtime Database
1. Go to Firebase Console → Realtime Database
2. Click "Create Database"
3. Select region: `asia-southeast1` (same as configured)
4. Start in test mode initially
5. Later, update security rules (see section below)

### 1.3 Enable Analytics (Optional)
Already configured in firebase.ts

## Step 2: Add Authorized Admin Emails

Edit `src/firebase.ts` and update `ALLOWED_ADMIN_EMAILS`:

```typescript
export const ALLOWED_ADMIN_EMAILS = [
  'abirsabirhossain@gmail.com',
  'indexcodebae@gmail.com',
  'your-email@example.com'  // Add more as needed
];
```

## Step 3: Firebase Security Rules

### For Development (Test Mode)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### For Production
Apply these rules in Firebase Console:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid",
        "profile": {
          ".read": true
        },
        "tasks": {
          ".read": "auth.uid === $uid",
          ".write": "auth.uid === $uid",
          ".indexOn": ["createdAt", "completed"]
        }
      }
    },
    "teamMembers": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["createdAt"]
    },
    "admins": {
      ".read": false,
      ".write": false,
      ".validate": "newData.isString()"
    }
  }
}
```

## Step 4: Database Initialization

### Set Up Admin Users
1. Go to Firebase Console → Realtime Database
2. Create the following structure:

```
admins/
  {userId1}: true
  {userId2}: true
```

Where `{userId}` is the Firebase UID of authorized admins.

### (Alternative) Email-Based Admin Check
The current implementation checks against `ALLOWED_ADMIN_EMAILS`. This is simpler for initial setup.

## Step 5: Environment Variables (Optional)

Create a `.env.local` file (git-ignored):

```env
VITE_FIREBASE_API_KEY=AIzaSyD7CHndlvxJgchePfbNC1NPKEG-TGxMsdg
VITE_FIREBASE_AUTH_DOMAIN=toi-task.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://toi-task-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=toi-task
VITE_FIREBASE_STORAGE_BUCKET=toi-task.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=992959841228
VITE_FIREBASE_APP_ID=1:992959841228:web:bb7728f4759fe1c02e1369
VITE_FIREBASE_MEASUREMENT_ID=G-1VSV0V0XFQ
```

Then update `src/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

## Step 6: Test the Integration

1. **Start Development Server**:
   ```bash
   npm install
   npm run dev
   ```

2. **Test Login**:
   - Navigate to http://localhost:5173
   - Click "Sign in with Google"
   - Use an authorized admin email
   - Should see the home dashboard

3. **Test Admin Panel**:
   - Navigate to http://localhost:5173/admin
   - Should redirect to admin login
   - Login with authorized admin email
   - Should see admin panel

4. **Test Task Creation**:
   - From home page, add a task
   - Open Firebase Console → Realtime Database
   - Should see task data in `users/{userId}/tasks/`

5. **Test Real-Time Sync**:
   - Open app in two browser windows
   - Create task in one window
   - Should appear instantly in other window

## Step 7: Deploy to Production

### Option A: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Project**:
   ```bash
   firebase init hosting
   ```
   - Select existing project: `toi-task`
   - Public directory: `dist`
   - Single-page app: `Yes`

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Verify Deployment**:
   - Check Firebase Console for hosting URL
   - Test all functionality

### Option B: Other Platforms (Vercel, Netlify, etc.)

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to your hosting platform

3. **Configure**:
   - Ensure your domain is added to Firebase authorized domains
   - Set environment variables in deployment platform

## Step 8: Monitoring & Maintenance

### Monitor Firebase Usage
1. Go to Firebase Console → Usage
2. Check:
   - Concurrent connections
   - Database reads/writes
   - Authentication usage

### Set Up Alerts
1. Firebase Console → Budgets
2. Create budgets for unexpected usage spikes

### Regular Backups
1. Firebase Console → Backups
2. Enable automatic daily backups

### Monitor Performance
1. Firebase Console → Performance
3. Track app load times and crash rates

## Troubleshooting

### Issue: "Permission denied" errors
**Solution**: Check Firebase Security Rules
- Start with test mode rules
- Verify your database location matches config
- Check rule JSON syntax

### Issue: Google login not working
**Solution**:
- Verify Google OAuth provider is enabled
- Check authorized domains include your domain
- Check browser console for specific errors
- Verify API key in firebase.ts

### Issue: Tasks not saving
**Solution**:
- Verify user is authenticated (check Firebase Console Auth)
- Check Security Rules allow write
- Verify user ID is being passed correctly
- Check browser console for errors

### Issue: Real-time updates not working
**Solution**:
- Check internet connection
- Verify Security Rules allow read
- Check Firebase Console for database errors
- Try refreshing the page

## Common Tasks

### Add New Admin Email
Edit `src/firebase.ts`:
```typescript
export const ALLOWED_ADMIN_EMAILS = [
  'abirsabirhossain@gmail.com',
  'indexcodebae@gmail.com',
  'new-admin@example.com'  // Add here
];
```

### Reset User Data
1. Firebase Console → Realtime Database
2. Select user node
3. Click trash icon to delete

### View Database Data
1. Firebase Console → Realtime Database
2. Browse structure in console
3. Click to expand sections

### Check Authentication Logs
1. Firebase Console → Authentication
2. Check "Sign-in method" for activity
3. View users list and their sign-in times

## Production Checklist

- [ ] Security Rules are properly configured
- [ ] Admin email list is finalized
- [ ] Database backups are enabled
- [ ] Monitoring alerts are set up
- [ ] Domain is added to authorized domains
- [ ] Google OAuth is properly configured
- [ ] Environment variables are set
- [ ] App is tested on staging
- [ ] Error handling is working
- [ ] Analytics is tracking correctly
- [ ] Rate limiting is considered
- [ ] GDPR compliance is verified (if EU)

## Support & Resources

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com
- React Firebase Hooks: https://react-firebase-hooks.web.app
