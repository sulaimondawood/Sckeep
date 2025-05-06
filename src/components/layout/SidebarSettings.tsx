
import React from 'react';
import NavItem from './NavItem';
import { 
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

interface SidebarSettingsProps {
  isRouteActive: (path: string) => boolean;
  darkMode: boolean;
  toggleTheme: () => void;
}

const SidebarSettings: React.FC<SidebarSettingsProps> = ({ 
  isRouteActive, 
  darkMode, 
  toggleTheme 
}) => {
  return (
    <div className="mt-auto px-3 pb-3">
      {/* Settings section - with increased padding bottom */}
      <div className="pb-4">
        <h2 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Settings
        </h2>
        <NavItem
          icon={Settings}
          label="Settings"
          to="/settings"
          active={isRouteActive('/settings')}
        />
        <div className="flex items-center px-2 py-1.5">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
      
      {/* Logout - with no bottom padding/margin */}
      <div>
        <NavItem
          icon={LogOut}
          label="Logout"
          to="/login"
          active={false}
          isLogout={true}
        />
      </div>
    </div>
  );
};

export default SidebarSettings;
