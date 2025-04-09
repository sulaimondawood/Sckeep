
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import SidebarHeader from './SidebarHeader';
import Navigation from './Navigation';
import SettingsPanel from './SettingsPanel';
import SidebarFooter from './SidebarFooter';

// Import logo images - using relative paths from public folder
import darkLogo from '../../../assets/dark-logo.png';
import lightLogo from '../../../assets/light-logo.png';

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPath: string;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  toggleSidebar,
  currentPath,
  darkMode,
  setDarkMode
}) => {
  const [notificationTime, setNotificationTime] = useState('1day');
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Determine which logo to use based on current theme
  const logoSrc = darkMode ? darkLogo : lightLogo;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader logoSrc={logoSrc} toggleSidebar={toggleSidebar} />
        <Navigation currentPath={currentPath} />
        
        <SettingsPanel 
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          notificationFrequency={notificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
        
        <SidebarFooter />
      </div>
    </aside>
  );
};

export default Sidebar;
