
import React from 'react';
import { cn } from '@/lib/utils';
import SidebarNavigation from './SidebarNavigation';
import SidebarSettings from './SidebarSettings';
import { 
  Home, 
  Package, 
  Bell, 
  BarChart2,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  sidebarOpen: boolean;
  logoSrc: string;
  isRouteActive: (path: string) => boolean;
  darkMode: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  sidebarRef?: React.RefObject<HTMLDivElement>;
  toggleBtnRef?: React.RefObject<HTMLButtonElement>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarOpen, 
  logoSrc, 
  isRouteActive, 
  darkMode, 
  toggleTheme,
  toggleSidebar,
  sidebarRef,
  toggleBtnRef
}) => {
  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Package, label: "Inventory", to: "/inventory" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: BarChart2, label: "Analytics", to: "/analytics" },
  ];

  return (
    <>
      {/* Mobile sidebar toggle - moved up */}
      <div className="lg:hidden fixed top-2 left-2">
        <Button 
          ref={toggleBtnRef}
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar} 
          className="rounded-full bg-white dark:bg-gray-800 shadow-md"
        >
          <Menu size={18} />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            {/* Logo in the center of the sidebar header */}
            <div className="flex items-center justify-center w-full">
              <img 
                src={logoSrc} 
                alt="Sckeep Logo" 
                className="h-10 object-contain"
              />
            </div>
          </div>

          <SidebarNavigation 
            navItems={navItems} 
            isRouteActive={isRouteActive} 
          />
          
          <SidebarSettings 
            isRouteActive={isRouteActive}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
