
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/types/food';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from './authService';

// Convert from Supabase format to our app format
const mapFromSupabase = (settings: any): UserSettings => ({
  id: settings.id,
  userId: settings.user_id,
  theme: settings.theme,
  notificationEnabled: settings.notification_enabled,
  expiryWarningDays: settings.expiry_warning_days,
  createdAt: settings.created_at,
  updatedAt: settings.updated_at
});

// Get user settings
export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    if (!data) {
      // Create default settings if none exist
      return await createDefaultUserSettings();
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

// Create default user settings
export const createDefaultUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const defaultSettings = {
      id: uuidv4(),
      user_id: user.id,
      theme: 'system',
      notification_enabled: true,
      expiry_warning_days: 3,
      created_at: new Date().toISOString(),
      updated_at: null
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error('Error creating default user settings:', error);
    return null;
  }
};

// Update user settings
export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {
      theme: settings.theme,
      notification_enabled: settings.notificationEnabled,
      expiry_warning_days: settings.expiryWarningDays,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return null;
  }
};
