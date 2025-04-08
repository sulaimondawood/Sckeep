
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Bell, 
  Settings, 
  BarChart2, 
  Menu, 
  X,
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Import logo images - using relative paths from public folder
import darkLogo from '../../assets/dark-logo.png';
import lightLogo from '../../assets/light-logo.png';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active }) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 mb-1",
          active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
        )}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Package, label: "Inventory", to: "/inventory" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: BarChart2, label: "Analytics", to: "/analytics" },
  ];

  // Determine which logo to use based on color scheme preference
  // This is a basic implementation; for proper dark mode support, 
  // you might want to use a theme provider
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const logoSrc = isDarkMode ? darkLogo : lightLogo;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar toggle - repositioned to left side and fixed */}
      <div className="fixed z-30 top-4 left-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar} 
          className="rounded-full bg-white shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-center">
            {/* Logo in the center of the sidebar header */}
            <div className="flex items-center justify-center w-full">
              <img 
                src={logoSrc} 
                alt="Sckeep Logo" 
                className="h-10 object-contain"
              />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={currentPath === item.to}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <Button variant="ghost" className="w-full justify-start gap-2 text-gray-500">
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-200 ease-in-out",
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
