
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Bell, 
  Settings, 
  BarChart2, 
  Menu,
  LogOut,
  Moon,
  Sun,
  Clock,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Import logo images - using absolute paths from public folder
import darkLogo from '../../assets/dark-logo.png';
import lightLogo from '../../assets/light-logo.png';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active, onClick }) => {
  return (
    <Link to={to} onClick={onClick}>
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
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Use useLocation to get current path instead of relying on the prop
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [notificationTimeOpen, setNotificationTimeOpen] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [notificationFrequencyOpen, setNotificationFrequencyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
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
    { icon: BarChart2, label: "Analytics", to: "/analytics" },
  ];

  // Determine which logo to use based on current theme
  const logoSrc = darkMode ? darkLogo : lightLogo;

  // Function to check if a route is active - exact match for home, startsWith for others
  const isRouteActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

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
          <Menu size={18} />
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
            {/* Mobile close button - removed per user request */}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={isRouteActive(item.to)}
              />
            ))}
            
            {/* Settings with dropdown */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between gap-2 mb-1",
                      isRouteActive("/settings") ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center">
                      <Settings size={18} className="mr-2" />
                      <span>Settings</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={cn(
                        "transition-transform duration-200",
                        settingsOpen ? "rotate-180" : ""
                      )} 
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {/* Dark Mode Toggle */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center space-x-2">
                      {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                      <span>Dark Mode</span>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                  
                  {/* Notification Time */}
                  <Collapsible
                    open={notificationTimeOpen}
                    onOpenChange={setNotificationTimeOpen}
                    className="px-3 py-2 border-t border-gray-100 dark:border-gray-700"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <span>Notification Time</span>
                      </div>
                      <div>
                        {notificationTimeOpen ? 
                          <ChevronUp size={16} /> : 
                          <ChevronDown size={16} />
                        }
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-2 mt-2">
                        <Label htmlFor="notification-time" className="block mb-1">Daily notification time:</Label>
                        <Input
                          id="notification-time"
                          type="time"
                          value={notificationTime}
                          onChange={(e) => setNotificationTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Notification Frequency - Made more visible */}
                  <Collapsible
                    open={notificationFrequencyOpen}
                    onOpenChange={setNotificationFrequencyOpen}
                    className="px-3 py-2 border-t border-gray-100 dark:border-gray-700"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
                      <div className="flex items-center">
                        <Bell size={16} className="mr-2 text-purple-500" />
                        <span className="font-semibold">Notification Frequency</span>
                      </div>
                      <div>
                        {notificationFrequencyOpen ? 
                          <ChevronUp size={16} className="text-purple-500" /> : 
                          <ChevronDown size={16} className="text-purple-500" />
                        }
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-2 mt-2">
                        <ToggleGroup 
                          type="single" 
                          value={notificationFrequency}
                          onValueChange={(value) => {
                            if (value) setNotificationFrequency(value);
                          }}
                          className="w-full grid grid-cols-3 gap-1"
                        >
                          <ToggleGroupItem 
                            value="daily" 
                            className={cn(
                              "text-xs",
                              notificationFrequency === "daily" ? "bg-purple-500 text-white" : ""
                            )}
                          >
                            Daily
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="weekly" 
                            className={cn(
                              "text-xs",
                              notificationFrequency === "weekly" ? "bg-purple-500 text-white" : ""
                            )}
                          >
                            Weekly
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="none" 
                            className={cn(
                              "text-xs",
                              notificationFrequency === "none" ? "bg-purple-500 text-white" : ""
                            )}
                          >
                            None
                          </ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                          Real-time monitoring is always active
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Recently Deleted Items */}
                  <DropdownMenuItem asChild className="px-0 py-0 focus:bg-transparent">
                    <Link to="/deleted-items" className="w-full">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 rounded-none",
                          isRouteActive("/deleted-items") ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        )}
                      >
                        <Trash2 size={18} />
                        <span>Recently Deleted</span>
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
