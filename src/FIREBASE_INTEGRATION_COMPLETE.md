# Firebase Integration Guide - Toi-Task

## Overview
This document outlines the complete Firebase Realtime Database and Google Authentication integration for the Toi-Task application.

## Firebase Configuration

### Initialized Services
- **Authentication**: Google OAuth with email-based admin verification
- **Realtime Database**: Stores tasks, comments, and team member data
- **Analytics**: Application analytics tracking

### Firebase Config Details
```typescript
{
  apiKey: "AIzaSyD7CHndlvxJgchePfbNC1NPKEG-TGxMsdg",
  authDomain: "toi-task.firebaseapp.com",
  databaseURL: "https://toi-task-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "toi-task",
  storageBucket: "toi-task.firebasestorage.app",
  messagingSenderId: "992959841228",
  appId: "1:992959841228:web:bb7728f4759fe1c02e1369",
  measurementId: "G-1VSV0V0XFQ"
}
```

## Authentication System

### Admin Authorization
Only these emails can access the admin panel:
- `abirsabirhossain@gmail.com`
- `indexcodebae@gmail.com`

### Authentication Flow
1. User clicks "Sign in with Google"
2. Google OAuth dialog opens
3. User signs in with their Google account
4. Firebase verifies the email against the authorized admin list
5. User is granted appropriate role (`admin` or `user`)
6. User is redirected to the appropriate dashboard

### Key Files
- `src/firebase.ts` - Firebase initialization and config
- `src/hooks/useFirebaseAuth.ts` - Authentication hook with Google login

## Database Structure

### Users Collection
```
users/
  {userId}/
    profile/
      name: string
      email: string
      avatar: string
      bio: string
      expertise: string[]
      stats:
        tasksCompleted: number
        streak: number
        points: number
    tasks/
      {taskId}/
        id: string
        text: string
        completed: boolean
        createdAt: string
        completedAt?: string
        likes: number
        userId: string
        comments/
          {commentId}/
            id: string
            text: string
            userId: string
            createdAt: string
```

### Team Members Collection
```
teamMembers/
  {memberId}/
    id: string
    name: string
    email: string
    avatar: string
    bio: string
    role: string
    expertise: string[]
    stats:
      tasksCompleted: number
      streak: number
      points: number
    createdAt: string
```

## React Hooks

### useFirebaseAuth
Manages user authentication state with Google OAuth.

**Usage:**
```typescript
const {
  user,              // Current user object
  firebaseUser,      // Raw Firebase user
  isAuthenticated,   // Boolean
  isAdmin,          // Boolean - true if user is authorized admin
  isLoading,        // Boolean - true while auth state is being determined
  error,            // Error message string
  loginWithGoogle,  // Function to trigger Google login
  logout,           // Function to logout
  allowedAdminEmails // Array of authorized admin emails
} = useFirebaseAuth();
```

### useFirebaseTasks
Manages real-time task data for a specific user.

**Usage:**
```typescript
const {
  tasks,                  // Array of tasks
  isLoading,             // Boolean
  error,                 // Error string
  addTask,               // Async function(text)
  toggleTaskCompletion,  // Async function(taskId)
  deleteTask,            // Async function(taskId)
  addComment,            // Async function(taskId, commentText)
  deleteComment,         // Async function(taskId, commentId)
  likeTask,              // Async function(taskId)
  updateTask,            // Async function(taskId, newText)
  getAllTeamTasks        // Async function(userIds[])
} = useFirebaseTasks(userId);
```

### useFirebaseTeamMembers
Manages team members data.

**Usage:**
```typescript
const {
  teamMembers,           // Array of team members
  isLoading,            // Boolean
  error,                // Error string
  addTeamMember,        // Async function(member) - admin only
  updateTeamMember,     // Async function(memberId, updates) - admin only
  getTeamMember,        // Async function(memberId)
  deleteTeamMember,     // Async function(memberId) - admin only
  updateUserProfile     // Async function(userId, updates)
} = useFirebaseTeamMembers(isAdmin);
```

## Real-Time Features

### Live Task Updates
- Tasks are automatically synced from Firebase Realtime Database
- Changes made by any user are instantly reflected in all connected clients
- Comments and likes update in real-time

### Live Team Member Updates
- Team member data is automatically synced
- Admin can add/edit/delete team members
- Changes are reflected across all instances

## Security Rules (To Be Applied)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid",
        "tasks": {
          ".indexOn": ["createdAt", "completed"]
        }
      }
    },
    "teamMembers": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "admins": {
      ".read": false,
      ".write": false
    }
  }
}
```

## Error Handling

All Firebase operations include error handling:
- Authentication errors are displayed to the user
- Database operation errors are caught and returned via the hook's `error` state
- Error messages guide users on what went wrong

## Components Updated for Firebase

### LoginPage
- Uses `useFirebaseAuth()` for Google authentication
- Shows real-time loading and error states
- Automatically redirects authenticated users

### AdminLoginPage
- Verifies user is in authorized admin list
- Shows which emails are authorized
- Prevents non-admin access

### App.tsx (Main Component)
- Integrates Firebase auth for route protection
- Implements admin panel access control
- Shows loading states while auth is determined
- Displays error messages for failed operations

### HomePage
- Integrates `useFirebaseTasks` for real-time task sync
- Shows loading states for task operations
- Displays errors when operations fail

### AddTaskForm
- Async task creation with Firebase
- Loading and error states
- Prevents submission while saving

## Backward Compatibility

### Legacy Hooks
- `useAuth()` - Wraps `useFirebaseAuth()` for backward compatibility
- `useTasks()` - Wraps `useFirebaseTasks()` for backward compatibility

Existing code using the old hooks will continue to work with Firebase as the backend.

## Getting Started

1. **Install Firebase** (already done):
   ```bash
   npm install firebase
   ```

2. **Configure Firebase** in `src/firebase.ts` (already done)

3. **Use Firebase Auth**:
   ```typescript
   import { useFirebaseAuth } from './hooks/useFirebaseAuth';
   
   const { loginWithGoogle, logout, user, isAdmin } = useFirebaseAuth();
   ```

4. **Use Firebase Tasks**:
   ```typescript
   import { useFirebaseTasks } from './hooks/useFirebaseTasks';
   
   const { tasks, addTask, toggleTaskCompletion } = useFirebaseTasks(userId);
   ```

5. **Use Firebase Team Members**:
   ```typescript
   import { useFirebaseTeamMembers } from './hooks/useFirebaseTeamMembers';
   
   const { teamMembers, addTeamMember } = useFirebaseTeamMembers(isAdmin);
   ```

## Testing Firebase Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Try to login with a Google account
3. If using an admin email, you'll have access to `/admin` route
4. Create, update, and delete tasks to test real-time sync
5. Check Firebase Console to see data being written in real-time

## Troubleshooting

### "Access denied" when trying to use admin features
- Verify your email is in `ALLOWED_ADMIN_EMAILS` in `src/firebase.ts`
- Update the list with your admin emails if needed

### Tasks not appearing
- Ensure you're authenticated
- Check that the user ID is being passed to `useFirebaseTasks()`
- Check Firebase Console for database errors

### Real-time updates not working
- Ensure internet connection is stable
- Check browser console for Firebase errors
- Verify Firebase security rules are correctly set

### Google login not working
- Check that Google authentication is enabled in Firebase Console
- Verify the authorized domain is set correctly
- Check browser console for specific error messages

## Next Steps

1. Set Firebase Security Rules in Firebase Console
2. Set up proper admin email list in production
3. Implement user profile picture uploads
4. Add task filtering and search functionality
5. Implement statistics and achievements tracking
6. Set up email notifications for task updates
