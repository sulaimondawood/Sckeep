
import React, { useState } from 'react';
import { 
  Settings, 
  Moon,
  Sun,
  Clock,
  ChevronUp,
  ChevronDown,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [notificationTimeOpen, setNotificationTimeOpen] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [notificationFrequencyOpen, setNotificationFrequencyOpen] = useState(false);

  return (
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
          
          {/* Notification Frequency */}
          <Collapsible
            open={notificationFrequencyOpen}
            onOpenChange={setNotificationFrequencyOpen}
            className="px-3 py-2 border-t border-gray-100 dark:border-gray-700"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
              <div className="flex items-center">
                <Bell size={16} className="mr-2" />
                <span>Notification Frequency</span>
              </div>
              <div>
                {notificationFrequencyOpen ? 
                  <ChevronUp size={16} /> : 
                  <ChevronDown size={16} />
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
                    className="text-xs"
                  >
                    Daily
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="weekly" 
                    className="text-xs"
                  >
                    Weekly
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="none" 
                    className="text-xs"
                  >
                    None
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time monitoring is always active
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SidebarSettings;
