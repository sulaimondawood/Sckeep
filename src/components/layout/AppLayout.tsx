
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import MobileSidebarToggle from './Sidebar/MobileSidebarToggle';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath }) => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 dark:text-gray-100 flex">
      {/* Mobile sidebar toggle */}
      <MobileSidebarToggle sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        currentPath={currentPath} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
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
