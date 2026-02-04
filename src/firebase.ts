import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD7CHndlvxJgchePfbNC1NPKEG-TGxMsdg',
  authDomain: 'toi-task.firebaseapp.com',
  databaseURL: 'https://toi-task-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'toi-task',
  storageBucket: 'toi-task.firebasestorage.app',
  messagingSenderId: '992959841228',
  appId: '1:992959841228:web:bb7728f4759fe1c02e1369',
  measurementId: 'G-1VSV0V0XFQ'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics
export const analytics = getAnalytics(app);

// Allowed admin emails
export const ALLOWED_ADMIN_EMAILS = [
  'abirsabirhossain@gmail.com',
  'indexcodebae@gmail.com' // Updated based on your request
];

// Function to check if user is admin
export const isUserAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
};

export default app;
