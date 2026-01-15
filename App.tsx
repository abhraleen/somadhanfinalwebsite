
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicHome from './views/PublicHome';
import AdminDashboard from './views/AdminDashboard';
import AdminLogin from './views/AdminLogin';
import { ADMIN_AUTH_KEY } from './constants';
import { Language } from './translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('somadhan_lang') as Language) || 'en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('somadhan_theme') as 'light' | 'dark') || 'dark');

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_AUTH_KEY);
    if (token === 'authenticated') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('somadhan_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('somadhan_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = () => {
    localStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdminAuthenticated(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, toggleTheme }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route 
            path="/admin" 
            element={isAdminAuthenticated ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/login" 
            element={!isAdminAuthenticated ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/admin" />} 
          />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
