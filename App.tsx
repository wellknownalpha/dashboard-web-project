// React imports for component functionality
import React, { useState, useEffect } from 'react';

// Type definitions for type safety and theme management
import { Theme, ThemeContextType, User, UserRole, AuthUser } from './types';

// Authentication and verification components
import LoginForm from './components/LoginForm';           // User login interface
import MFAVerification from './components/MFAVerification'; // Multi-factor authentication

// Main application components
import Navigation from './components/Navigation';         // Top navigation bar
import Dashboard from './components/Dashboard';           // Main dashboard with KPIs and charts
import DevicesPage from './components/DevicesPage';       // Device management page
import UserManagement from './components/UserManagement'; // User administration interface
import CompliancePage from './components/CompliancePage'; // Compliance monitoring dashboard

// Authentication service for user management
import { authService } from './services/authService';

// React Context for theme management (dark/light mode)
export const ThemeContext = React.createContext<ThemeContextType | null>(null);

/**
 * Main Application Component
 * Manages authentication, routing, theme, and global application state
 * 
 * Key Features:
 * - Role-based authentication (GlobalAdmin, Admin, Viewer)
 * - Multi-factor authentication (TOTP/Google Authenticator)
 * - Dark/Light theme switching with system preference detection
 * - Single-page application routing
 * - Real-time user permission updates
 * - Persistent login sessions
 */
const App: React.FC = () => {
  // Authentication state management
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);     // Currently logged-in user
  const [showMFA, setShowMFA] = useState(false);                             // MFA verification modal state
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);     // User pending MFA verification
  
  // Application state management
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'devices' | 'users' | 'compliance'>('dashboard'); // Current page
  const [theme, setTheme] = useState<Theme>('dark');                         // Theme preference (dark/light)
  const [loading, setLoading] = useState(true);                              // Initial loading state

  /**
   * Refresh current user data to reflect permission changes
   * Important for real-time updates when GlobalAdmin modifies user roles or MFA settings
   */
  const refreshCurrentUser = () => {
    const updatedUser = authService.getCurrentUser();
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  /**
   * Periodic user data refresh to ensure UI reflects latest permissions
   * Runs every second to catch role changes made by GlobalAdmin
   */
  useEffect(() => {
    const interval = setInterval(refreshCurrentUser, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize application on mount
   * - Load theme preference from localStorage or system preference
   * - Restore user session if available
   * - Set initial loading state
   */
  useEffect(() => {
    // Load theme preference
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Default to dark theme if system preference is dark
        setTheme('dark');
    }
    
    // Restore user session if available
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  /**
   * Apply theme changes to DOM and persist to localStorage
   * Tailwind CSS uses 'dark' class on html element for dark mode styling
   */
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  /**
   * Handle user login process
   * Checks if MFA is enabled and routes accordingly
   * @param {AuthUser} user - Authenticated user object
   */
  const handleLogin = (user: AuthUser) => {
    setPendingUser(user);
    if (authService.isMFAEnabled(user.id)) {
      // User has MFA enabled - show verification screen
      setShowMFA(true);
    } else {
      // No MFA required - complete login immediately
      authService.completeLogin(user);
      setCurrentUser(user);
    }
  };

  /**
   * Handle successful MFA verification
   * Completes the login process after TOTP verification
   */
  const handleMFAVerified = () => {
    if (pendingUser) {
      authService.completeLogin(pendingUser);
      localStorage.setItem('mfaVerified', 'true'); // Mark MFA as verified for session
      setCurrentUser(pendingUser);
      setPendingUser(null);
    }
    setShowMFA(false);
  };

  /**
   * Handle MFA verification cancellation
   * Returns user to login screen
   */
  const handleMFACancel = () => {
    setPendingUser(null);
    setShowMFA(false);
  };

  /**
   * Handle user logout
   * Clears all session data and returns to login screen
   */
  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('mfaVerified'); // Clear MFA verification status
    setCurrentUser(null);
    setCurrentPage('dashboard'); // Reset to default page
  };

  /**
   * Toggle between light and dark themes
   * Used by ThemeToggle component in navigation
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Show loading spinner during initial app load
  if (loading) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ThemeContext.Provider>
    );
  }

  // Show MFA verification screen when required
  if (showMFA && pendingUser) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <MFAVerification 
          userId={pendingUser.id}
          onVerified={handleMFAVerified}
          onCancel={handleMFACancel}
        />
      </ThemeContext.Provider>
    );
  }

  // Show login form when no user is authenticated
  if (!currentUser) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <LoginForm onLogin={handleLogin} />
      </ThemeContext.Provider>
    );
  }

  /**
   * Convert AuthUser to User interface for Dashboard component compatibility
   * Dashboard component expects User interface from Microsoft Graph API
   */
  const dashboardUser: User = {
    id: currentUser.id,
    displayName: currentUser.displayName,
    mail: currentUser.email,
    jobTitle: 'Dashboard User',
    department: 'IT',
    role: currentUser.role,
    photoUrl: null
  };

  /**
   * Render the current page based on navigation state
   * Implements client-side routing for single-page application
   * @returns {JSX.Element} Current page component
   */
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'devices':
        return <DevicesPage />;
      case 'users':
        // Only GlobalAdmin and Admin can access user management
        return <UserManagement currentUser={currentUser} />;
      case 'compliance':
        return <CompliancePage />;
      default:
        // Default to dashboard page
        return <Dashboard currentUser={dashboardUser} onLogout={handleLogout} />;
    }
  };

  // Main application layout with navigation and content
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen font-sans bg-gray-100 dark:bg-gray-900">
        {/* Top Navigation Bar */}
        <Navigation 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        {/* Dynamic Page Content */}
        {renderCurrentPage()}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;