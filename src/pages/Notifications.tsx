
import React, { useState } from 'react';
import { mockNotifications } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read);
  const readNotifications = notifications.filter(notif => notif.read);

  const NotificationItem = ({ notification }: { notification: typeof notifications[0] }) => (
    <Card className={`mb-3 ${notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-primary'}`}>
      <CardContent className="p-4 flex justify-between items-start">
        <div className="flex items-start">
          <div className="mr-4 mt-1">
            {notification.type === 'expiry' ? (
              <Bell className="h-5 w-5 text-warning-dark" />
            ) : (
              <Settings className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification.date).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAsRead(notification.id)}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => deleteNotification(notification.id)}
            className="h-8 w-8 p-0"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500">Stay updated on your food inventory</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="mr-2">
            {unreadNotifications.length} unread
          </Badge>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadNotifications.length === 0}>
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg border">
        <h2 className="font-medium mb-3">Notification Preferences</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="expiry-notifications">Expiry Notifications</Label>
            <Switch id="expiry-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="system-notifications">System Notifications</Label>
            <Switch id="system-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch id="push-notifications" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread" className="mt-4">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No unread notifications</p>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          {notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </TabsContent>
        
        <TabsContent value="read" className="mt-4">
          {readNotifications.length > 0 ? (
            readNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No read notifications</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
