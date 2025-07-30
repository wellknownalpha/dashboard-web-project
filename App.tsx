import React, { useState, useEffect } from 'react';
import { Theme, ThemeContextType, User, UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { login } from './services/microsoftApi';

export const ThemeContext = React.createContext<ThemeContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark theme

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = async (role: UserRole) => {
    // In a real app, this would involve an OAuth flow with MSAL.
    // Here, we'll simulate a login by fetching a user with the specified role.
    const user = await login(role);
    if(user){
      setCurrentUser(user);
    } else {
      // Handle case where no user with that role is found
      alert(`Could not find a user with the role: ${role}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  }

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen font-sans">
        {currentUser ? <Dashboard currentUser={currentUser} onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;