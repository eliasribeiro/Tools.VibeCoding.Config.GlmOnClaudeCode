import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ApiKeyPage from './pages/ApiKeyPage';
import ClaudeCodePage from './pages/ClaudeCodePage';
import CrushPage from './pages/CrushPage';
import SettingsPage from './pages/SettingsPage';
import NotificationProvider from './contexts/NotificationContext';
import ConfigProvider from './contexts/ConfigContext';
import Notification from './components/Notification';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <ConfigProvider>
        <NotificationProvider>
          <Router>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <div className="p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/api-key" element={<ApiKeyPage />} />
                    <Route path="/claude-code" element={<ClaudeCodePage />} />
                    <Route path="/crush" element={<CrushPage />} />
                    <Route path="/settings" element={<SettingsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
                  </Routes>
                </div>
              </main>
            </div>
            <Notification />
          </Router>
        </NotificationProvider>
      </ConfigProvider>
    </div>
  );
}

export default App;