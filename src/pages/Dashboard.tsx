
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
import { Plus, AlertCircle, Info } from 'lucide-react';
import FoodItemCard from '@/components/food/FoodItemCard';
import { useToast } from '@/hooks/use-toast';
import { 
  mockFoodItems, 
  mockNotifications 
} from '@/data/mockData';
import { getExpiryStatus } from '@/utils/expiryUtils';
import { ExpiryStatus } from '@/types/food';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

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

  // Data for the donut chart
  const chartData = [
    { name: 'Safe', value: safeItems.length, color: '#10B981', status: 'safe' },
    { name: 'Expiring Soon', value: warningItems.length, color: '#FBBF24', status: 'warning' },
    { name: 'Critical', value: criticalItems.length, color: '#EF4444', status: 'danger' },
    { name: 'Expired', value: expiredItems.length, color: '#9CA3AF', status: 'expired' }
  ];

  // Function to render status details when hovering over chart segments
  const renderStatusDetails = (status: ExpiryStatus) => {
    const items = filterItemsByStatus(status);
    const statusText = {
      'safe': 'Safe items have more than 7 days left before expiry.',
      'warning': 'These items will expire in 3-7 days. Consider using them soon.',
      'danger': 'Critical items will expire in less than 3 days. Use immediately!',
      'expired': 'These items have already expired and should be discarded.'
    };

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{statusText[status]}</p>
        {items.length > 0 ? (
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            <p className="font-semibold">Top items:</p>
            {items.slice(0, 3).map((item, index) => (
              <p key={index} className="truncate">{item.name}</p>
            ))}
            {items.length > 3 && <p className="text-muted-foreground">+{items.length - 3} more items</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No items in this category</p>
        )}
      </div>
    );
  };

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

      {/* Donut Chart replacing the summary cards */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Food Inventory Overview</CardTitle>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info size={18} />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="text-sm">
                    This chart shows the distribution of your food items by expiry status.
                    Hover over each segment to see more details.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: data.color }}
                                />
                                <span className="font-medium">{data.name}</span>
                              </div>
                              <div className="mt-1">
                                <span className="text-muted-foreground">
                                  {data.value} items ({(data.value / foodItems.length * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{foodItems.length}</span>
                    <p className="text-xs text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {chartData.map((item) => (
                  <Card key={item.name} className="border p-3 hover:shadow-md transition-shadow">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.value} items</p>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        {renderStatusDetails(item.status as ExpiryStatus)}
                      </HoverCardContent>
                    </HoverCard>
                  </Card>
                ))}
              </div>
            </div>
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
