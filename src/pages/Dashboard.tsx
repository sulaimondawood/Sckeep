
import React, { useState, useEffect } from 'react';
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
import { toast } from "sonner";
import { getExpiryStatus } from '@/utils/expiryUtils';
import { ExpiryStatus, FoodItem } from '@/types/food';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import ScannerModal from '@/components/scanner/ScannerModal';
import EditFoodItemDialog from '@/components/food/EditFoodItemDialog';
import WasteTrackingDialog from '@/components/waste/WasteTrackingDialog';
import { 
  getAllFoodItems, 
  createFoodItem, 
  updateFoodItem, 
  deleteFoodItem,
  migrateLocalStorageToSupabase 
} from '@/services/foodItemService';
import { checkExpiringItems } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wasteTrackingOpen, setWasteTrackingOpen] = useState(false);
  const [wasteTrackingItem, setWasteTrackingItem] = useState<FoodItem | null>(null);
  const { toast: uiToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Load food items from Supabase
  useEffect(() => {
    const loadFoodItems = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading food items for user:', user.id);
        setLoading(true);
        
        // Try to migrate localStorage data first
        await migrateLocalStorageToSupabase(user.id);
        
        // Load items from Supabase
        const items = await getAllFoodItems(user.id);
        console.log('Loaded food items:', items);
        setFoodItems(items);
        
        // Check for expiring items and create notifications
        await checkExpiringItems(user.id);
      } catch (error) {
        console.error('Error loading food items:', error);
        uiToast({
          title: "Error loading items",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadFoodItems();
  }, [uiToast, isAuthenticated, user]);

  // Show push notifications on first dashboard load
  useEffect(() => {
    // Check if we've already shown the notification
    const notificationShown = sessionStorage.getItem('dashboardNotificationShown');
    
    if (!notificationShown && 'Notification' in window && foodItems.length > 0) {
      sessionStorage.setItem('dashboardNotificationShown', 'true');
      
      // Show notification for expiring items
      const criticalItems = filterItemsByStatus('danger');
      const expiredItems = filterItemsByStatus('expired');
      
      if (Notification.permission === 'granted') {
        if (expiredItems.length > 0) {
          new Notification('Food Expiry Alert', {
            body: `You have ${expiredItems.length} expired items that need attention`,
            icon: '/favicon.ico'
          });
          
          toast.error(`${expiredItems.length} expired items`, {
            description: "These items have passed their expiry date"
          });
        }
        
        if (criticalItems.length > 0) {
          setTimeout(() => {
            new Notification('Items Expiring Soon', {
              body: `${criticalItems.length} items will expire in the next 3 days`,
              icon: '/favicon.ico'
            });
            
            toast.warning(`${criticalItems.length} items expiring soon`, {
              description: "Use these items within the next 3 days"
            });
          }, 3000);
        }
      }
    }
  }, [foodItems]);

  const handleEditItem = (id: string) => {
    const item = foodItems.find(item => item.id === id);
    if (item) {
      setEditingItem(item);
      setIsEditDialogOpen(true);
    } else {
      uiToast({
        title: "Edit Error",
        description: "Could not find the item to edit.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user) return;

    const success = await deleteFoodItem(id, user.id);
    if (success) {
      setFoodItems(foodItems.filter(item => item.id !== id));
      
      // Check for expiring items after deletion
      await checkExpiringItems(user.id);
      
      uiToast({
        title: "Item Deleted",
        description: "Food item has been permanently removed.",
      });
    } else {
      uiToast({
        title: "Delete Error",
        description: "Failed to delete the item.",
        variant: "destructive"
      });
    }
  };

  const handleTrackWaste = (id: string) => {
    const item = foodItems.find(item => item.id === id);
    if (item) {
      setWasteTrackingItem(item);
      setWasteTrackingOpen(true);
    }
  };

  const handleWasteTrackingSuccess = async () => {
    if (!user || !wasteTrackingItem) return;
    
    // Remove the item from the list since it's been disposed
    setFoodItems(prev => prev.filter(item => item.id !== wasteTrackingItem.id));
    
    // Delete the item from the database
    await deleteFoodItem(wasteTrackingItem.id, user.id);
    
    // Reset waste tracking state
    setWasteTrackingItem(null);
    setWasteTrackingOpen(false);
    
    // Check for expiring items after tracking
    await checkExpiringItems(user.id);
  };

  const handleAddNewItem = () => {
    setScannerOpen(true);
  };

  const handleScanComplete = async (itemData: any) => {
    if (!user) return;

    const newItemData = {
      name: itemData.name,
      category: itemData.category,
      expiryDate: itemData.expiryDate,
      addedDate: new Date().toISOString().split('T')[0],
      barcode: itemData.barcode,
      quantity: itemData.quantity,
      unit: itemData.unit,
      notes: itemData.notes,
      imageUrl: itemData.imageUrl
    };
    
    const result = await createFoodItem(newItemData, user.id);
    if (result) {
      setFoodItems(prev => [result, ...prev]);
      setScannerOpen(false);
      
      // Check for expiring items after adding new item
      await checkExpiringItems(user.id);
      
      toast.success(`${itemData.name} added to inventory`, {
        description: `Expires on ${new Date(itemData.expiryDate).toLocaleDateString()}`
      });
    } else {
      uiToast({
        title: "Add Error",
        description: "Failed to add the item.",
        variant: "destructive"
      });
    }
  };

  const handleSaveEdit = async (updatedItem: FoodItem) => {
    if (!user) return;

    const result = await updateFoodItem(updatedItem, user.id);
    if (result) {
      setFoodItems(prev => 
        prev.map(item => item.id === updatedItem.id ? result : item)
      );
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      // Check for expiring items after update
      await checkExpiringItems(user.id);
      
      uiToast({
        title: "Item Updated",
        description: "Food item has been successfully updated.",
      });
    } else {
      uiToast({
        title: "Update Error",
        description: "Failed to update the item.",
        variant: "destructive"
      });
    }
  };

  const filterItemsByStatus = (status: ExpiryStatus) => {
    return foodItems.filter(item => getExpiryStatus(item.expiryDate) === status);
  };
  
  const expiredItems = filterItemsByStatus('expired');
  const criticalItems = filterItemsByStatus('danger');
  const warningItems = filterItemsByStatus('warning');
  const safeItems = filterItemsByStatus('safe');

  const chartData = [
    { name: 'Safe', value: safeItems.length, color: '#10B981', status: 'safe' },
    { name: 'Expiring Soon', value: warningItems.length, color: '#FBBF24', status: 'warning' },
    { name: 'Critical', value: criticalItems.length, color: '#EF4444', status: 'danger' },
    { name: 'Expired', value: expiredItems.length, color: '#9CA3AF', status: 'expired' }
  ];

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

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Manage your food inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="space-x-1" onClick={() => window.location.href = '/notifications'}>
            <AlertCircle size={16} />
            <span>Notifications</span>
          </Button>
          <Button className="space-x-1" onClick={handleAddNewItem}>
            <Plus size={16} />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

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
                                  {data.value} items ({foodItems.length > 0 ? (data.value / foodItems.length * 100).toFixed(1) : 0}%)
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
          {foodItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onTrackWaste={handleTrackWaste}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500 dark:text-gray-400">No items in your inventory</p>
              <Button onClick={handleAddNewItem} className="mt-4">
                <Plus size={16} className="mr-2" />
                Add your first item
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="critical" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onTrackWaste={handleTrackWaste}
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
                onTrackWaste={handleTrackWaste}
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
                onTrackWaste={handleTrackWaste}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Scanner Modal */}
      <ScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Edit Food Item Dialog */}
      <EditFoodItemDialog 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveEdit}
      />

      {/* Waste Tracking Dialog */}
      <WasteTrackingDialog
        isOpen={wasteTrackingOpen}
        onClose={() => {
          setWasteTrackingOpen(false);
          setWasteTrackingItem(null);
        }}
        item={wasteTrackingItem}
        onSuccess={handleWasteTrackingSuccess}
      />
    </div>
  );
};

export default Dashboard;
