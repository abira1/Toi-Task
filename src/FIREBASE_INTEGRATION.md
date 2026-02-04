
# Firebase Integration API Reference

> Complete guide for integrating Firebase with Team Joy application

---

## Table of Contents

1. [Database Collections](#1-database-collections)
2. [Authentication](#2-authentication)
3. [API Endpoints & Operations](#3-api-endpoints--operations)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Real-time Listeners](#5-real-time-listeners)
6. [Sample Queries & Mutations](#6-sample-queries--mutations)

---

## 1. Database Collections

### Firestore Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── name: string
│       ├── email: string
│       ├── role: string
│       ├── bio: string
│       ├── avatar: string
│       ├── coverImage?: string
│       ├── expertise: string[]
│       ├── stats/
│       │   ├── tasksCompleted: number
│       │   ├── streak: number
│       │   └── points: number
│       └── createdAt: timestamp
│
├── tasks/
│   └── {taskId}/
│       ├── id: string
│       ├── userId: string
│       ├── text: string
│       ├── createdAt: timestamp
│       ├── completed: boolean
│       ├── completedAt?: timestamp
│       ├── likes: number
│       └── likedBy: string[]  // Array of userIds who liked
│
├── comments/
│   └── {commentId}/
│       ├── id: string
│       ├── taskId: string
│       ├── userId: string
│       ├── text: string
│       └── createdAt: timestamp
│
└── admins/
    └── {adminId}/
        ├── email: string
        └── createdAt: timestamp
```

### Collection Schemas

#### Users Collection
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  name: string;                  // Display name
  email: string;                 // Google email (unique)
  role: string;                  // Job title/role
  bio: string;                   // Short biography
  avatar: string;                // Profile image URL
  coverImage?: string;           // Optional cover image URL
  expertise: string[];           // Skills/expertise tags
  stats: {
    tasksCompleted: number;      // Total completed tasks
    streak: number;              // Current day streak
    points: number;              // Gamification points
  };
  createdAt: Timestamp;          // Account creation date
  updatedAt: Timestamp;          // Last profile update
}
```

#### Tasks Collection
```typescript
interface Task {
  id: string;                    // Auto-generated document ID
  userId: string;                // Creator's user ID
  text: string;                  // Task description
  createdAt: Timestamp;          // Creation timestamp
  completed: boolean;            // Completion status
  completedAt?: Timestamp;       // When task was completed
  likes: number;                 // Like count
  likedBy: string[];             // Array of user IDs who liked
}
```

#### Comments Collection
```typescript
interface Comment {
  id: string;                    // Auto-generated document ID
  taskId: string;                // Parent task ID
  userId: string;                // Commenter's user ID
  text: string;                  // Comment content
  createdAt: Timestamp;          // Creation timestamp
}
```

#### Admins Collection
```typescript
interface Admin {
  email: string;                 // Admin's Google email
  createdAt: Timestamp;          // When admin was added
}
```

---

## 2. Authentication

### Route Authentication Requirements

| Route | Auth Required | Auth Type | Description |
|-------|---------------|-----------|-------------|
| `/` | Yes | Google OAuth (User) | Main app - requires user to exist in `users` collection |
| `/admin` | Yes | Google OAuth (Admin) | Admin panel - requires email in `admins` collection |

### Firebase Auth Configuration

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow update: if isAuthenticated();
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Admins collection
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only manageable via Firebase Console or Cloud Functions
    }
  }
}
```

---

## 3. API Endpoints & Operations

### Users

| Operation | Path | Method | Auth | Description |
|-----------|------|--------|------|-------------|
| Get User | `users/{userId}` | READ | User | Fetch single user profile |
| List Users | `users` | READ | User | Fetch all team members |
| Create User | `users/{userId}` | WRITE | Admin | Add new team member |
| Update User | `users/{userId}` | UPDATE | Owner/Admin | Update profile |
| Update Stats | `users/{userId}` | UPDATE | System | Update user statistics |

### Tasks

| Operation | Path | Method | Auth | Description |
|-----------|------|--------|------|-------------|
| Get Task | `tasks/{taskId}` | READ | User | Fetch single task |
| List Tasks | `tasks` | READ | User | Fetch all tasks (with filters) |
| List Today's Tasks | `tasks` (query) | READ | User | Tasks created today |
| Create Task | `tasks` | WRITE | User | Create new task |
| Complete Task | `tasks/{taskId}` | UPDATE | Owner | Toggle completion |
| Like Task | `tasks/{taskId}` | UPDATE | User (not owner) | Add like |
| Delete Task | `tasks/{taskId}` | DELETE | Owner/Admin | Remove task |

### Comments

| Operation | Path | Method | Auth | Description |
|-----------|------|--------|------|-------------|
| List Comments | `comments` (query) | READ | User | Get comments for a task |
| Create Comment | `comments` | WRITE | User | Add comment to task |
| Delete Comment | `comments/{commentId}` | DELETE | Owner/Admin | Remove comment |

---

## 4. Data Flow Diagrams

### 4.1 User Login Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   User      │     │  LoginPage   │     │ Firebase    │     │  Firestore   │
│   clicks    │────▶│  Google Btn  │────▶│ Auth        │────▶│  users/      │
│   login     │     │              │     │ signIn      │     │  {uid}       │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                                                │                    │
                                                ▼                    ▼
                                         ┌─────────────┐     ┌──────────────┐
                                         │ Get UID &   │     │ Check user   │
                                         │ email from  │────▶│ exists in    │
                                         │ Google      │     │ collection   │
                                         └─────────────┘     └──────────────┘
                                                                     │
                                         ┌───────────────────────────┴───────────────────────────┐
                                         │                                                       │
                                         ▼                                                       ▼
                                  ┌─────────────┐                                       ┌──────────────┐
                                  │ User EXISTS │                                       │ User NOT     │
                                  │ → Allow     │                                       │ FOUND        │
                                  │   access    │                                       │ → Show error │
                                  └─────────────┘                                       └──────────────┘
```

### 4.2 Admin Login Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Admin     │     │ AdminLogin   │     │ Firebase    │     │  Firestore   │
│   clicks    │────▶│  Google Btn  │────▶│ Auth        │────▶│  admins/     │
│   login     │     │              │     │ signIn      │     │  check       │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                                                │                    │
                                                ▼                    ▼
                                         ┌─────────────┐     ┌──────────────┐
                                         │ Get email   │     │ Query where  │
                                         │ from Google │────▶│ email ==     │
                                         │ profile     │     │ admin email  │
                                         └─────────────┘     └──────────────┘
                                                                     │
                                         ┌───────────────────────────┴───────────────────────────┐
                                         │                                                       │
                                         ▼                                                       ▼
                                  ┌─────────────┐                                       ┌──────────────┐
                                  │ Admin FOUND │                                       │ NOT Admin    │
                                  │ → Show      │                                       │ → Deny       │
                                  │   AdminPage │                                       │   access     │
                                  └─────────────┘                                       └──────────────┘
```

### 4.3 Create Task Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   User      │     │ AddTaskForm  │     │  Firestore  │     │ Real-time    │
│   types     │────▶│ onSubmit()   │────▶│ tasks/      │────▶│ Listener     │
│   task      │     │              │     │ add()       │     │ updates UI   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Create task  │
                    │ document:    │
                    │ - id: auto   │
                    │ - userId     │
                    │ - text       │
                    │ - createdAt  │
                    │ - completed  │
                    │ - likes: 0   │
                    └──────────────┘
```

### 4.4 Complete Task Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   User      │     │  TaskCard    │     │  Firestore  │     │  Firestore   │
│   clicks    │────▶│ checkbox     │────▶│ tasks/      │────▶│ users/       │
│   checkbox  │     │ onChange()   │     │ {taskId}    │     │ {userId}     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                           │                    │                    │
                           ▼                    ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
                    │ Toggle       │     │ Update:     │     │ Update stats:│
                    │ completed    │     │ completed   │     │ tasksCompleted│
                    │ state        │     │ completedAt │     │ points       │
                    └──────────────┘     └─────────────┘     │ streak       │
                                                             └──────────────┘
```

### 4.5 Add Comment Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │     │ CommentForm  │     │  Firestore  │
│   submits   │────▶│ onSubmit()   │────▶│ comments/   │
│   comment   │     │              │     │ add()       │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Create:      │
                    │ - id: auto   │
                    │ - taskId     │
                    │ - userId     │
                    │ - text       │
                    │ - createdAt  │
                    └──────────────┘
```

### 4.6 Like Task Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │     │  TaskCard    │     │  Firestore  │
│   clicks    │────▶│ onLike()     │────▶│ tasks/      │
│   heart     │     │              │     │ {taskId}    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │ Check if     │     │ Update:     │
                    │ already      │     │ likes++     │
                    │ liked        │     │ likedBy[]   │
                    └──────────────┘     │ push(uid)   │
                                         └─────────────┘
```

### 4.7 Admin Add Member Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Admin     │     │  AdminPage   │     │  Firestore  │
│   submits   │────▶│ onAddMember()│────▶│ users/      │
│   form      │     │              │     │ add()       │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ Create user doc:     │
                    │ - id: generated      │
                    │ - name               │
                    │ - email (for login)  │
                    │ - role               │
                    │ - bio                │
                    │ - avatar             │
                    │ - coverImage         │
                    │ - expertise[]        │
                    │ - stats: defaults    │
                    │ - createdAt          │
                    └──────────────────────┘
```

---

## 5. Real-time Listeners

### Required Listeners

| Component | Collection | Query | Purpose |
|-----------|------------|-------|---------|
| HomePage | `tasks` | `where('createdAt', '>=', todayStart)` | Today's tasks |
| TaskCard | `comments` | `where('taskId', '==', taskId)` | Task comments |
| ProfilePage | `tasks` | `where('userId', '==', currentUserId)` | User's tasks |
| OverviewPage | `tasks` | All tasks | Statistics |
| AdminPage | `users` | All users | Team members list |

### Listener Implementation Pattern

```typescript
// hooks/useRealtimeTasks.ts
import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Task } from '../types';

export function useRealtimeTasks(filterToday: boolean = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    if (filterToday) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      q = query(
        collection(db, 'tasks'),
        where('createdAt', '>=', Timestamp.fromDate(todayStart)),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        setTasks(tasksData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterToday]);

  return { tasks, loading, error };
}
```

---

## 6. Sample Queries & Mutations

### 6.1 Authentication

#### Google Sign In (User)
```typescript
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase.config';

async function loginWithGoogle(): Promise<User | null> {
  try {
    // 1. Sign in with Google
    const result = await signInWithPopup(auth, googleProvider);
    const { uid, email } = result.user;

    // 2. Check if user exists in users collection
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      // User not in system - check by email
      const userByEmail = await getDocs(
        query(collection(db, 'users'), where('email', '==', email))
      );
      
      if (userByEmail.empty) {
        await auth.signOut();
        throw new Error('User not found. Contact admin to be added.');
      }
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

#### Google Sign In (Admin)
```typescript
async function loginAsAdmin(): Promise<boolean> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { email } = result.user;

    // Check if email is in admins collection
    const adminQuery = query(
      collection(db, 'admins'),
      where('email', '==', email)
    );
    const adminSnapshot = await getDocs(adminQuery);

    if (adminSnapshot.empty) {
      await auth.signOut();
      throw new Error('Not authorized as admin');
    }

    return true;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}
```

#### Sign Out
```typescript
import { signOut } from 'firebase/auth';

async function logout(): Promise<void> {
  await signOut(auth);
  // Clear any local state
}
```

### 6.2 Tasks

#### Create Task
```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function createTask(userId: string, text: string): Promise<string> {
  const taskRef = await addDoc(collection(db, 'tasks'), {
    userId,
    text,
    createdAt: serverTimestamp(),
    completed: false,
    completedAt: null,
    likes: 0,
    likedBy: []
  });
  
  return taskRef.id;
}
```

#### Get Today's Tasks
```typescript
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

async function getTodaysTasks(): Promise<Task[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'tasks'),
    where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Task[];
}
```

#### Toggle Task Completion
```typescript
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

async function toggleTaskCompletion(
  taskId: string, 
  currentlyCompleted: boolean,
  userId: string
): Promise<void> {
  const taskRef = doc(db, 'tasks', taskId);
  const userRef = doc(db, 'users', userId);

  // Update task
  await updateDoc(taskRef, {
    completed: !currentlyCompleted,
    completedAt: !currentlyCompleted ? serverTimestamp() : null
  });

  // Update user stats
  if (!currentlyCompleted) {
    // Task being completed
    await updateDoc(userRef, {
      'stats.tasksCompleted': increment(1),
      'stats.points': increment(10)
    });
  } else {
    // Task being uncompleted
    await updateDoc(userRef, {
      'stats.tasksCompleted': increment(-1),
      'stats.points': increment(-10)
    });
  }
}
```

#### Like Task
```typescript
import { doc, updateDoc, arrayUnion, increment, getDoc } from 'firebase/firestore';

async function likeTask(taskId: string, userId: string): Promise<void> {
  const taskRef = doc(db, 'tasks', taskId);
  
  // Check if already liked
  const taskDoc = await getDoc(taskRef);
  const taskData = taskDoc.data();
  
  if (taskData?.likedBy?.includes(userId)) {
    throw new Error('Already liked this task');
  }

  await updateDoc(taskRef, {
    likes: increment(1),
    likedBy: arrayUnion(userId)
  });
}
```

### 6.3 Comments

#### Add Comment
```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function addComment(
  taskId: string, 
  userId: string, 
  text: string
): Promise<string> {
  const commentRef = await addDoc(collection(db, 'comments'), {
    taskId,
    userId,
    text,
    createdAt: serverTimestamp()
  });
  
  return commentRef.id;
}
```

#### Get Comments for Task
```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

async function getTaskComments(taskId: string): Promise<Comment[]> {
  const q = query(
    collection(db, 'comments'),
    where('taskId', '==', taskId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
}
```

#### Real-time Comments Listener
```typescript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

function subscribeToComments(
  taskId: string, 
  callback: (comments: Comment[]) => void
): () => void {
  const q = query(
    collection(db, 'comments'),
    where('taskId', '==', taskId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
    callback(comments);
  });
}
```

### 6.4 Users (Admin Operations)

#### Add New Team Member
```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface NewMemberData {
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  expertise: string[];
}

async function addTeamMember(data: NewMemberData): Promise<string> {
  const userRef = await addDoc(collection(db, 'users'), {
    ...data,
    stats: {
      tasksCompleted: 0,
      streak: 0,
      points: 0
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return userRef.id;
}
```

#### Get All Team Members
```typescript
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

async function getAllTeamMembers(): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}
```

#### Real-time Team Members Listener
```typescript
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

function subscribeToTeamMembers(
  callback: (members: User[]) => void
): () => void {
  const q = query(
    collection(db, 'users'),
    orderBy('name', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    callback(members);
  });
}
```

### 6.5 Statistics Queries

#### Get Overview Statistics
```typescript
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

interface OverviewStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeMembers: number;
}

async function getOverviewStats(): Promise<OverviewStats> {
  // Get all tasks
  const tasksSnapshot = await getDocs(collection(db, 'tasks'));
  const totalTasks = tasksSnapshot.size;
  
  // Count completed
  const completedTasks = tasksSnapshot.docs.filter(
    doc => doc.data().completed
  ).length;
  
  // Get active members (users who created tasks this week)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentTasksQuery = query(
    collection(db, 'tasks'),
    where('createdAt', '>=', Timestamp.fromDate(weekAgo))
  );
  const recentTasks = await getDocs(recentTasksQuery);
  const activeUserIds = new Set(
    recentTasks.docs.map(doc => doc.data().userId)
  );

  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0,
    activeMembers: activeUserIds.size
  };
}
```

#### Get User's Task Statistics
```typescript
async function getUserTaskStats(userId: string): Promise<{
  pending: number;
  completed: number;
}> {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map(doc => doc.data());

  return {
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };
}
```

---

## Environment Variables

Create a `.env` file with the following:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## Index Requirements

Create the following composite indexes in Firebase Console:

1. **Tasks by date (today's tasks)**
   - Collection: `tasks`
   - Fields: `createdAt` (Ascending)

2. **Comments by task**
   - Collection: `comments`
   - Fields: `taskId` (Ascending), `createdAt` (Ascending)

3. **Tasks by user**
   - Collection: `tasks`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

---

## Migration Notes

When migrating from mock data to Firebase:

1. Create admin accounts first in `admins` collection
2. Use admin panel to add team members to `users` collection
3. Existing tasks will need to be migrated with proper timestamps
4. Update all component hooks to use Firebase real-time listeners
5. Replace localStorage auth with Firebase Auth state persistence
