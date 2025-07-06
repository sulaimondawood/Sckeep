
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/food';
import { v4 as uuidv4 } from 'uuid';

// Convert from Supabase format to our app format
const mapFromSupabase = (notification: any): Notification => ({
  id: notification.id,
  type: notification.type as 'expiry' | 'system',
  message: notification.message,
  itemId: notification.item_id || undefined,
  read: notification.read,
  date: notification.date,
  userId: notification.user_id,
  createdAt: notification.created_at
});

// Get all notifications for a specific user
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(mapFromSupabase);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Create a new notification
export const createNotification = async (
  type: 'expiry' | 'system',
  message: string,
  userId: string,
  itemId?: string
): Promise<Notification | null> => {
  try {
    const newNotification = {
      id: uuidv4(),
      type,
      message,
      item_id: itemId || null,
      user_id: userId,
      read: false,
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([newNotification])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    return false;
  }
};

// Check for expiring items and create notifications
export const checkExpiringItems = async (userId: string): Promise<number> => {
  try {
    // Get user settings for expiry warning days (default to 3)
    const { data: settingsData } = await supabase
      .from('user_settings')
      .select('expiry_warning_days')
      .eq('user_id', userId)
      .single();
    
    const warningDays = settingsData?.expiry_warning_days || 3;
    
    // Calculate date thresholds
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + warningDays);
    
    const todayStr = today.toISOString().split('T')[0];
    const warningDateStr = warningDate.toISOString().split('T')[0];
    
    // Get items that will expire soon
    const { data: expiringItems, error } = await supabase
      .from('food_items')
      .select('id, name, expiry_date')
      .eq('user_id', userId)
      .lte('expiry_date', warningDateStr)
      .gte('expiry_date', todayStr);
    
    if (error) {
      throw error;
    }
    
    if (!expiringItems.length) {
      return 0;
    }
    
    // Check which items don't already have notifications
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('item_id')
      .eq('user_id', userId)
      .eq('type', 'expiry')
      .in('item_id', expiringItems.map(item => item.id));
    
    const existingNotifiedItemIds = existingNotifications?.map(n => n.item_id) || [];
    
    // Create notifications for items without existing notifications
    const newNotifications = expiringItems
      .filter(item => !existingNotifiedItemIds.includes(item.id))
      .map(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let message;
        
        if (daysUntilExpiry === 0) {
          message = `${item.name} expires today`;
        } else if (daysUntilExpiry === 1) {
          message = `${item.name} expires tomorrow`;
        } else {
          message = `${item.name} expires in ${daysUntilExpiry} days`;
        }
        
        return {
          id: uuidv4(),
          type: 'expiry',
          message,
          item_id: item.id,
          user_id: userId,
          read: false,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
      });
    
    if (newNotifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(newNotifications);
      
      if (insertError) {
        throw insertError;
      }
    }
    
    return newNotifications.length;
  } catch (error) {
    console.error('Error checking for expiring items:', error);
    return 0;
  }
};
