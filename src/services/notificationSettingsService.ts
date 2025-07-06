
import { supabase } from '@/integrations/supabase/client';
import { getUserSettings, updateUserSettings } from './userSettingsService';

export interface NotificationSettings {
  notificationTime: string;
  notificationFrequency: 'daily' | 'weekly' | 'none';
  expiryNotifications: boolean;
  systemNotifications: boolean;
  pushNotifications: boolean;
}

// Get notification settings from user settings
export const getNotificationSettings = async (): Promise<NotificationSettings | null> => {
  try {
    const settings = await getUserSettings();
    
    return {
      notificationTime: '08:00', // Default time
      notificationFrequency: 'daily', // Default frequency
      expiryNotifications: settings?.notificationEnabled ?? true,
      systemNotifications: true, // Default enabled
      pushNotifications: true, // Always enabled
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<boolean> => {
  try {
    // Update expiry notifications setting in user settings
    if ('expiryNotifications' in settings) {
      await updateUserSettings({ 
        notificationEnabled: settings.expiryNotifications ?? true 
      });
    }
    
    // Store notification time and frequency in localStorage for now
    // In a real app, you'd want to store these in the database too
    if (settings.notificationTime) {
      localStorage.setItem('notificationTime', settings.notificationTime);
    }
    
    if (settings.notificationFrequency) {
      localStorage.setItem('notificationFrequency', settings.notificationFrequency);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return false;
  }
};

// Get stored notification time from localStorage
export const getStoredNotificationTime = (): string => {
  return localStorage.getItem('notificationTime') || '08:00';
};

// Get stored notification frequency from localStorage
export const getStoredNotificationFrequency = (): 'daily' | 'weekly' | 'none' => {
  const frequency = localStorage.getItem('notificationFrequency');
  return (frequency as 'daily' | 'weekly' | 'none') || 'daily';
};

// Schedule notification check based on settings
export const scheduleNotificationCheck = (userId: string) => {
  const frequency = getStoredNotificationFrequency();
  const time = getStoredNotificationTime();
  
  if (frequency === 'none') {
    return;
  }
  
  // Calculate milliseconds until next notification time
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const notificationTime = new Date();
  notificationTime.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (notificationTime <= now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }
  
  const msUntilNotification = notificationTime.getTime() - now.getTime();
  
  // Set up the scheduled check
  setTimeout(async () => {
    try {
      const { checkExpiringItems } = await import('./notificationService');
      await checkExpiringItems(userId);
      
      // Schedule the next check based on frequency
      if (frequency === 'daily') {
        scheduleNotificationCheck(userId); // Reschedule for next day
      } else if (frequency === 'weekly') {
        setTimeout(() => scheduleNotificationCheck(userId), 7 * 24 * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Error in scheduled notification check:', error);
    }
  }, msUntilNotification);
  
  console.log(`Next notification check scheduled for ${notificationTime.toLocaleString()}`);
};
