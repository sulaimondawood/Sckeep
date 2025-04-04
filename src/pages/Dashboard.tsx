
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import FoodItemCard from '@/components/food/FoodItemCard';
import { useToast } from '@/hooks/use-toast';
import { 
  mockFoodItems, 
  mockNotifications 
} from '@/data/mockData';
import { getExpiryStatus } from '@/utils/expiryUtils';
import { ExpiryStatus } from '@/types/food';

const Dashboard: React.FC = () => {
  const [foodItems, setFoodItems] = useState(mockFoodItems);
  const [notifications] = useState(mockNotifications);
  const { toast } = useToast();

  const handleEditItem = (id: string) => {
    toast({
      title: "Edit Item",
      description: `Editing item with ID: ${id}`,
    });
  };

  const handleDeleteItem = (id: string) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Food item has been removed from your inventory.",
    });
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  
  // Filter items based on expiry status
  const filterItemsByStatus = (status: ExpiryStatus) => {
    return foodItems.filter(item => getExpiryStatus(item.expiryDate) === status);
  };
  
  const expiredItems = filterItemsByStatus('expired');
  const criticalItems = filterItemsByStatus('danger');
  const warningItems = filterItemsByStatus('warning');
  const safeItems = filterItemsByStatus('safe');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Manage your food inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="space-x-1">
            <AlertCircle size={16} />
            <span>{unreadNotifications.length}</span>
          </Button>
          <Button className="space-x-1">
            <Plus size={16} />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{foodItems.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-danger/5 border-danger/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-danger">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-danger">{criticalItems.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning-dark">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning-dark">{warningItems.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-500">{expiredItems.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Items ({foodItems.length})</TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({criticalItems.length})
          </TabsTrigger>
          <TabsTrigger value="warning">
            Expiring Soon ({warningItems.length})
          </TabsTrigger>
          <TabsTrigger value="safe">
            Safe ({safeItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="warning" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warningItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="safe" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
