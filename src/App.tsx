import React, { useState, useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFirebaseTasks } from './hooks/useFirebaseTasks';
import { useFirebaseTeamMembers } from './hooks/useFirebaseTeamMembers';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { OverviewPage } from './pages/OverviewPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { Sidebar } from './components/Sidebar';
import { InstallPrompt } from './components/InstallPrompt';
import { Page, User } from './types';
import { LogOut, AlertCircle, Bell, X } from 'lucide-react';

const LOGO_URL = 'https://i.postimg.cc/bw1Ww0m0/Toi-Task-(1).png';

// Default empty user for null-safe operations
const emptyUser: User = {
  id: '',
  name: 'Guest',
  email: '',
  role: '',
  bio: '',
  avatar: 'https://ui-avatars.com/api/?name=Guest&background=00BFA5&color=fff',
  expertise: [],
  stats: {
    tasksCompleted: 0,
    streak: 0,
    points: 0
  }
};

export function App() {
  const { user, isAuthenticated, isAuthorized, isLoading, isAdmin, error: authError, logout } = useFirebaseAuth();
  const { tasks, addTask, toggleTaskCompletion, addComment, likeTask, error: tasksError } = useFirebaseTasks(user?.id);
  const { teamMembers, addTeamMember, isAdmin: isAdminUser } = useFirebaseTeamMembers(isAdmin);
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Use authenticated user or empty user as fallback
  const currentUser = user || emptyUser;

  // Check if we're on the admin route
  const isAdminRoute = window.location.pathname === '/admin';

  // Handle admin login with email verification
  const handleAdminLogin = async () => {
    try {
      setAdminError(null);
      if (isAdmin) {
        setIsAdminLoggedIn(true);
      } else {
        setAdminError('Access denied. Only authorized administrators can access this page.');
      }
    } catch (error) {
      setAdminError('Failed to authenticate as admin');
      console.error('Admin login error:', error);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminError(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--black)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin Panel - requires admin authentication
  if (isAdminRoute) {
    // Check if user is admin
    if (!isAuthenticated) {
      return <AdminLoginPage onLogin={handleAdminLogin} />;
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Access Denied</h2>
            <p className="text-center text-gray-600 mb-6">
              You don't have permission to access the admin panel. Only authorized administrators can proceed.
            </p>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="w-full bg-[var(--black)] text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Go Back
            </button>
          </div>
        </div>
      );
    }

    // Show admin panel after authentication
    return (
      <div className="min-h-screen bg-gray-100 font-sans text-[var(--black)]">
        <div className="bg-[var(--black)] text-white py-3 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔐</span>
              <img
                src={LOGO_URL}
                alt="Toi-Task"
                className="h-8 sm:h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="text-sm sm:text-base font-bold text-gray-400">
                Admin Panel
              </span>
            </div>
            <button
              onClick={() => {
                handleAdminLogout();
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
        <main className="p-4 sm:p-8">
          <AdminPage teamMembers={teamMembers} onAddMember={addTeamMember} />
        </main>
      </div>
    );
  }

  // Main App - requires authentication
  if (!isAuthenticated) {
    return <LoginPage onLogin={async () => { /* Auth handled by Firebase */ }} />;
  }

  // Check if user is authenticated but NOT authorized (not in teamMembers)
  if (isAuthenticated && !isAuthorized && authError === 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fun background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--coral)] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[var(--teal)] rounded-full blur-3xl"></div>
        </div>

        <div className="relative bg-white border-4 border-[var(--black)] rounded-3xl p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_var(--coral)] animate-in fade-in zoom-in-95 duration-500">
          {/* Emoji Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-[var(--mustard)] border-4 border-[var(--black)] rounded-full flex items-center justify-center text-6xl shadow-[6px_6px_0px_0px_var(--black)]">
              🔒
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl font-black text-center text-[var(--black)] mb-4">
            Access Denied!
          </h2>
          
          <div className="bg-[var(--cream)] border-3 border-[var(--black)] rounded-xl p-6 mb-6">
            <p className="text-xl font-bold text-center text-[var(--black)] leading-relaxed">
              Sorry, you cannot login!! 😢
            </p>
            <p className="text-xl font-bold text-center text-[var(--black)] leading-relaxed mt-2">
              This is a very secure site!!
            </p>
            <p className="text-2xl font-black text-center text-[var(--teal)] mt-4">
              Go and cook the meal! 🍳👨‍🍳
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center font-medium">
              💡 <strong>Need access?</strong> Contact your administrator to add your email to the team members list.
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full bg-[var(--coral)] text-white py-4 px-6 rounded-xl font-black text-lg border-3 border-[var(--black)] shadow-[4px_4px_0px_0px_var(--black)] hover:shadow-[6px_6px_0px_0px_var(--black)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--black)] transition-all flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentUser={currentUser}
            tasks={tasks}
            teamMembers={teamMembers}
            addTask={addTask}
            toggleTaskCompletion={toggleTaskCompletion}
            addComment={addComment}
            likeTask={likeTask}
          />
        );

      case 'overview':
        return <OverviewPage tasks={tasks} teamMembers={teamMembers} />;
      case 'profile':
        return (
          <ProfilePage
            user={currentUser}
            tasks={tasks}
            toggleTaskCompletion={toggleTaskCompletion}
            onLogout={() => {
              logout();
              window.location.href = '/';
            }}
          />
        );

      default:
        return (
          <HomePage
            currentUser={currentUser}
            tasks={tasks}
            teamMembers={teamMembers}
            addTask={addTask}
            toggleTaskCompletion={toggleTaskCompletion}
            addComment={addComment}
            likeTask={likeTask}
          />
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--cream)] font-sans text-[var(--black)]">
      {/* Error Banner */}
      {tasksError && (
        <div className="fixed top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-4 z-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{tasksError}</span>
          </div>
        </div>
      )}
      
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">{renderPage()}</div>
      </main>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}