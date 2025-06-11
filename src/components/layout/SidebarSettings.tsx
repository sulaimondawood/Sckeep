
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  getNotificationSettings, 
  updateNotificationSettings, 
  getStoredNotificationTime, 
  getStoredNotificationFrequency,
  scheduleNotificationCheck 
} from '@/services/notificationSettingsService';

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
  const [notificationFrequency, setNotificationFrequency] = useState<'daily' | 'weekly' | 'none'>('daily');
  const [notificationFrequencyOpen, setNotificationFrequencyOpen] = useState(false);
  const [expiryNotifications, setExpiryNotifications] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getNotificationSettings();
        if (settings) {
          setExpiryNotifications(settings.expiryNotifications);
        }
        
        // Load stored time and frequency
        setNotificationTime(getStoredNotificationTime());
        setNotificationFrequency(getStoredNotificationFrequency());
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleNotificationTimeChange = async (newTime: string) => {
    setNotificationTime(newTime);
    
    const success = await updateNotificationSettings({ notificationTime: newTime });
    if (success) {
      toast({
        title: "Notification time updated",
        description: `Daily notifications will be sent at ${newTime}`,
        duration: 2000,
      });
      
      // Reschedule notifications with new time
      if (user) {
        scheduleNotificationCheck(user.id);
      }
    } else {
      toast({
        title: "Error updating notification time",
        variant: "destructive",
      });
    }
  };

  const handleNotificationFrequencyChange = async (newFrequency: 'daily' | 'weekly' | 'none') => {
    if (!newFrequency) return;
    
    setNotificationFrequency(newFrequency);
    
    const success = await updateNotificationSettings({ notificationFrequency: newFrequency });
    if (success) {
      let description = '';
      switch (newFrequency) {
        case 'daily':
          description = 'You will receive daily notifications about expiring items';
          break;
        case 'weekly':
          description = 'You will receive weekly notifications about expiring items';
          break;
        case 'none':
          description = 'Scheduled notifications disabled (real-time monitoring still active)';
          break;
      }
      
      toast({
        title: "Notification frequency updated",
        description,
        duration: 3000,
      });
      
      // Reschedule notifications with new frequency
      if (user) {
        scheduleNotificationCheck(user.id);
      }
    } else {
      toast({
        title: "Error updating notification frequency",
        variant: "destructive",
      });
    }
  };

  const handleExpiryNotificationsChange = async (enabled: boolean) => {
    setExpiryNotifications(enabled);
    
    const success = await updateNotificationSettings({ expiryNotifications: enabled });
    if (success) {
      toast({
        title: enabled ? "Expiry notifications enabled" : "Expiry notifications disabled",
        duration: 2000,
      });
    } else {
      toast({
        title: "Error updating expiry notifications",
        variant: "destructive",
      });
    }
  };

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
          
          {/* Expiry Notifications Toggle */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Bell size={16} />
              <span>Expiry Alerts</span>
            </div>
            <Switch 
              checked={expiryNotifications} 
              onCheckedChange={handleExpiryNotificationsChange}
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
                  onChange={(e) => handleNotificationTimeChange(e.target.value)}
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
                    if (value) handleNotificationFrequencyChange(value as 'daily' | 'weekly' | 'none');
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
