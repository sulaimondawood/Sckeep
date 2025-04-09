
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Bell, 
  Settings, 
  BarChart2, 
  Menu, 
  X,
  LogOut,
  Moon,
  Sun,
  Clock,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [notificationTime, setNotificationTime] = useState('1day');
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  
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

  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Package, label: "Inventory", to: "/inventory" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: BarChart2, label: "Analytics", to: "/analytics" },
  ];

  // Determine which logo to use based on current theme
  const logoSrc = darkMode ? darkLogo : lightLogo;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 dark:text-gray-100 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed z-20 top-4 left-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar} 
          className="rounded-full bg-white dark:bg-gray-800 shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
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
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="absolute right-2"
            >
              <X size={18} />
            </Button>
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
            
            {/* Settings Panel */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-600 dark:text-gray-300">Settings</h3>
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                  <span>Dark Mode</span>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={toggleTheme}
                />
              </div>
              
              {/* Notification Settings */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Clock size={16} className="mr-2" />
                  Notification Time
                </h4>
                <RadioGroup value={notificationTime} onValueChange={setNotificationTime} className="ml-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12hours" id="12hours" />
                    <Label htmlFor="12hours">12 hours before expiry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1day" id="1day" />
                    <Label htmlFor="1day">1 day before expiry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3days" id="3days" />
                    <Label htmlFor="3days">3 days before expiry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1week" id="1week" />
                    <Label htmlFor="1week">1 week before expiry</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Notification Frequency</h4>
                <ToggleGroup 
                  type="single" 
                  value={notificationFrequency}
                  onValueChange={(value) => {
                    if (value) setNotificationFrequency(value);
                  }}
                  className="w-full grid grid-cols-3 gap-1 ml-2"
                >
                  <ToggleGroupItem value="daily" className="text-xs">Daily</ToggleGroupItem>
                  <ToggleGroupItem value="weekly" className="text-xs">Weekly</ToggleGroupItem>
                  <ToggleGroupItem value="none" className="text-xs">None</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Recently Deleted Items */}
              <Link to="/deleted-items">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 mb-1 mt-3"
                >
                  <Trash2 size={18} />
                  <span>Recently Deleted</span>
                </Button>
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="ghost" className="w-full justify-start gap-2 text-gray-500 dark:text-gray-400">
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

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
