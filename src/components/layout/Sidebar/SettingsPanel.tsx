
import React from 'react';
import { Clock, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface SettingsPanelProps {
  darkMode: boolean;
  toggleTheme: () => void;
  notificationTime: string;
  setNotificationTime: (value: string) => void;
  notificationFrequency: string;
  setNotificationFrequency: (value: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  darkMode,
  toggleTheme,
  notificationTime,
  setNotificationTime,
  notificationFrequency,
  setNotificationFrequency
}) => {
  return (
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
    </div>
  );
};

export default SettingsPanel;
