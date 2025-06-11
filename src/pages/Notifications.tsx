
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/food';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  checkExpiringItems
} from '@/services/notificationService';
import { getUserSettings, updateUserSettings } from '@/services/userSettingsService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expiryNotifications, setExpiryNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load notifications and settings
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading notifications data...');
        setLoading(true);
        setError(null);
        
        // Load notifications and settings in parallel
        const [notificationsData, settingsData] = await Promise.all([
          getNotifications(),
          getUserSettings()
        ]);
        
        console.log('Loaded notifications:', notificationsData);
        setNotifications(notificationsData || []);
        
        if (settingsData) {
          setExpiryNotifications(settingsData.notificationEnabled);
        }
        
        // Check for new expiring items
        await checkExpiringItems();
        
        // Reload notifications after checking for new ones
        const updatedNotifications = await getNotifications();
        setNotifications(updatedNotifications || []);
      } catch (error) {
        console.error('Error loading notifications data:', error);
        setError('Failed to load notifications. Please try again.');
        toast({
          title: "Error loading notifications",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        async () => {
          // Reload notifications when there are changes
          console.log('Notifications updated, reloading...');
          try {
            const updatedNotifications = await getNotifications();
            setNotifications(updatedNotifications || []);
          } catch (error) {
            console.error('Error reloading notifications:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Set up real-time subscription for food items to update notifications
  useEffect(() => {
    const channel = supabase
      .channel('food-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_items'
        },
        async () => {
          // When food items change, check for new expiring items and reload notifications
          console.log('Food items updated, checking for expiring items...');
          try {
            await checkExpiringItems();
            const updatedNotifications = await getNotifications();
            setNotifications(updatedNotifications || []);
          } catch (error) {
            console.error('Error updating notifications after food items change:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check for expiring items periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('Checking expiry dates...');
      try {
        await checkExpiringItems();
        const updatedNotifications = await getNotifications();
        setNotifications(updatedNotifications || []);
      } catch (error) {
        console.error('Error in periodic expiry check:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
      toast({
        title: "Notification marked as read",
        duration: 2000,
      });
    } else {
      toast({
        title: "Error marking notification as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const success = await deleteNotification(id);
    if (success) {
      setNotifications(notifications.filter(notif => notif.id !== id));
      toast({
        title: "Notification deleted",
        duration: 2000,
      });
    } else {
      toast({
        title: "Error deleting notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllNotificationsAsRead();
    if (success) {
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      toast({
        title: "All notifications marked as read",
        duration: 2000,
      });
    } else {
      toast({
        title: "Error marking all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleSettingChange = async (setting: string, value: boolean) => {
    try {
      if (setting === 'expiryNotifications') {
        setExpiryNotifications(value);
        await updateUserSettings({ notificationEnabled: value });
      } else if (setting === 'systemNotifications') {
        setSystemNotifications(value);
      }
      
      toast({
        title: "Settings updated",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        variant: "destructive",
      });
    }
  };

  const unreadNotifications = notifications.filter(notif => !notif.read);
  const readNotifications = notifications.filter(notif => notif.read);

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <Card className={`mb-3 transition-colors ${notification.read 
      ? 'bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700' 
      : 'bg-white dark:bg-gray-800 border-l-4 border-l-primary dark:border-l-purple-400'}`}>
      <CardContent className="p-4 flex justify-between items-start">
        <div className="flex items-start">
          <div className="mr-4 mt-1">
            {notification.type === 'expiry' ? (
              <Bell className="h-5 w-5 text-warning-dark dark:text-warning-light" />
            ) : (
              <Settings className="h-5 w-5 text-primary dark:text-purple-300" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium dark:text-gray-200">{notification.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(notification.date).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleMarkAsRead(notification.id)}
              className="h-8 w-8 p-0 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteNotification(notification.id)}
            className="h-8 w-8 p-0 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated on your food inventory</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="mr-2 dark:border-gray-600 dark:text-gray-300">
            {unreadNotifications.length} unread
          </Badge>
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead} 
            disabled={unreadNotifications.length === 0}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="font-medium mb-3 dark:text-white">Notification Preferences</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="expiry-notifications" className="dark:text-gray-300">Expiry Notifications</Label>
            <Switch 
              id="expiry-notifications" 
              checked={expiryNotifications}
              onCheckedChange={(value) => handleSettingChange('expiryNotifications', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="system-notifications" className="dark:text-gray-300">System Notifications</Label>
            <Switch 
              id="system-notifications" 
              checked={systemNotifications}
              onCheckedChange={(value) => handleSettingChange('systemNotifications', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="dark:text-gray-300">Push Notifications</Label>
            <Switch 
              id="push-notifications" 
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
              disabled={true}
              className="opacity-100"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Push notifications are always active to ensure you receive important expiry reminders.
          </p>
        </div>
      </div>

      <Tabs defaultValue="unread" className="dark:border-gray-700">
        <TabsList className="dark:bg-gray-800">
          <TabsTrigger value="unread" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="read" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread" className="mt-4">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No unread notifications</p>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No notifications</p>
          )}
        </TabsContent>
        
        <TabsContent value="read" className="mt-4">
          {readNotifications.length > 0 ? (
            readNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No read notifications</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
