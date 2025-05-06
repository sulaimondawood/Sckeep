
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';

// Import logo images - using absolute paths from public folder
import darkLogo from '../../assets/dark-logo.png';
import lightLogo from '../../assets/light-logo.png';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Use useLocation to get current path
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Apply theme when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Determine which logo to use based on current theme
  const logoSrc = darkMode ? darkLogo : lightLogo;

  // Function to check if a route is active - exact match for home, startsWith for others
  const isRouteActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 dark:text-gray-100 flex">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        logoSrc={logoSrc}
        isRouteActive={isRouteActive}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-200 ease-in-out bg-slate-50 dark:bg-gray-900",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
