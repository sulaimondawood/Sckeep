
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Barcode } from 'lucide-react';
import FoodItemCard from '@/components/food/FoodItemCard';
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";
import { FoodItem } from '@/types/food';
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

const Inventory: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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

  const handleDeleteItem = async (id: string) => {
    if (!user) return;

    const success = await deleteFoodItem(id, user.id);
    if (success) {
      setFoodItems(foodItems.filter(item => item.id !== id));
      
      // Check for expiring items after deletion
      await checkExpiringItems(user.id);
      
      uiToast({
        title: "Item Deleted",
        description: "Food item has been removed from your inventory.",
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
    if (!user) {
      console.error('No user found for item creation');
      uiToast({
        title: "Authentication Error",
        description: "Please log in to add items.",
        variant: "destructive"
      });
      return;
    }

    console.log('Received item data from scanner:', itemData);

    // Prepare the data for creation, preserving the addedDate from the form
    const newItemData = {
      name: itemData.name,
      category: itemData.category,
      expiryDate: itemData.expiryDate,
      addedDate: itemData.addedDate, // Use the date from the form, don't override
      barcode: itemData.barcode,
      quantity: itemData.quantity || 1,
      unit: itemData.unit || 'pcs',
      notes: itemData.notes,
      imageUrl: itemData.imageUrl
    };
    
    console.log('Processed item data for creation:', newItemData);
    
    try {
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
        console.error('Failed to create food item - no result returned');
        uiToast({
          title: "Add Error",
          description: "Failed to add the item. Please check your connection and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in handleScanComplete:', error);
      uiToast({
        title: "Add Error",
        description: error instanceof Error ? error.message : "Failed to add the item.",
        variant: "destructive"
      });
    }
  };

  const categories = ['all', ...new Set(foodItems.map(item => item.category))];

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your inventory.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your food items
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 flex items-center">
          <Filter className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
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
          <p className="text-gray-500 dark:text-gray-400">No items found matching your criteria</p>
        </div>
      )}
      
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
        onClick={handleAddNewItem}
        aria-label="Add new item by scanning barcode"
        title="Scan barcode to add new item"
      >
        <Barcode size={24} />
      </Button>

      <ScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Edit Dialog */}
      {editingItem && (
        <EditFoodItemDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingItem(null);
          }}
          item={editingItem}
          onSave={handleSaveEdit}
        />
      )}

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

export default Inventory;
