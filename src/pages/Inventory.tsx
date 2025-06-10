
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
import { Search, Filter, Barcode, RefreshCw, Package } from 'lucide-react';
import FoodItemCard from '@/components/food/FoodItemCard';
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";
import { FoodItem } from '@/types/food';
import ScannerModal from '@/components/scanner/ScannerModal';
import EditFoodItemDialog from '@/components/food/EditFoodItemDialog';
import { v4 as uuidv4 } from 'uuid';
import { 
  getAllFoodItems, 
  createFoodItem, 
  updateFoodItem, 
  deleteFoodItem,
  migrateLocalStorageToSupabase 
} from '@/services/foodItemService';
import { checkExpiringItems } from '@/services/notificationService';

interface InventoryProps {
  showDeleted?: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ showDeleted = false }) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [deletedItems, setDeletedItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('deletedItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast: uiToast } = useToast();

  // Load food items from Supabase
  useEffect(() => {
    const loadFoodItems = async () => {
      try {
        setLoading(true);
        
        // Try to migrate localStorage data first
        await migrateLocalStorageToSupabase();
        
        // Load items from Supabase
        const items = await getAllFoodItems();
        setFoodItems(items);
        
        // Check for expiring items and create notifications
        await checkExpiringItems();
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
  }, [uiToast]);

  // Save deleted items to localStorage
  useEffect(() => {
    localStorage.setItem('deletedItems', JSON.stringify(deletedItems));
  }, [deletedItems]);

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
    const result = await updateFoodItem(updatedItem);
    if (result) {
      setFoodItems(prev => 
        prev.map(item => item.id === updatedItem.id ? result : item)
      );
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      // Check for expiring items after update
      await checkExpiringItems();
      
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
    const itemToDelete = foodItems.find(item => item.id === id);
    if (itemToDelete) {
      const success = await deleteFoodItem(id);
      if (success) {
        setDeletedItems(prev => [...prev, itemToDelete]);
        setFoodItems(foodItems.filter(item => item.id !== id));
        
        // Check for expiring items after deletion
        await checkExpiringItems();
        
        uiToast({
          title: "Item Removed",
          description: "Food item has been moved to recently deleted items.",
        });
      } else {
        uiToast({
          title: "Delete Error",
          description: "Failed to delete the item.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddNewItem = () => {
    setScannerOpen(true);
  };

  const handleScanComplete = async (itemData: any) => {
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
    
    const result = await createFoodItem(newItemData);
    if (result) {
      setFoodItems(prev => [result, ...prev]);
      setScannerOpen(false);
      
      // Check for expiring items after adding new item
      await checkExpiringItems();
      
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

  const handleRestoreItem = async (id: string) => {
    const itemToRestore = deletedItems.find(item => item.id === id);
    if (itemToRestore) {
      const result = await createFoodItem({
        name: itemToRestore.name,
        category: itemToRestore.category,
        expiryDate: itemToRestore.expiryDate,
        addedDate: itemToRestore.addedDate,
        barcode: itemToRestore.barcode,
        quantity: itemToRestore.quantity,
        unit: itemToRestore.unit,
        notes: itemToRestore.notes,
        imageUrl: itemToRestore.imageUrl
      });
      
      if (result) {
        setFoodItems(prev => [...prev, result]);
        setDeletedItems(deletedItems.filter(item => item.id !== id));
        
        // Check for expiring items after restoration
        await checkExpiringItems();
        
        uiToast({
          title: "Item Restored",
          description: "Food item has been restored to your inventory.",
        });
      } else {
        uiToast({
          title: "Restore Error",
          description: "Failed to restore the item.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePermanentDelete = (id: string) => {
    setDeletedItems(deletedItems.filter(item => item.id !== id));
    
    uiToast({
      title: "Item Permanently Deleted",
      description: "Food item has been permanently removed.",
    });
  };

  const categories = ['all', ...new Set(foodItems.map(item => item.category))];

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-2xl font-bold">{showDeleted ? "Recently Deleted" : "Inventory"}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {showDeleted ? "Restore your deleted food items" : "Manage your food items"}
          </p>
        </div>
        {!showDeleted && (
          <Button
            variant="outline"
            onClick={() => window.location.href = '/deleted-items'}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Recently Deleted
          </Button>
        )}
        {showDeleted && (
          <Button
            variant="outline"
            onClick={() => window.location.href = '/inventory'}
            className="flex items-center gap-2"
          >
            <Package size={16} />
            View Inventory
          </Button>
        )}
      </div>

      {!showDeleted && (
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
      )}

      {!showDeleted ? (
        filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">No items found matching your criteria</p>
          </div>
        )
      ) : (
        deletedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deletedItems.map((item) => (
              <div 
                key={item.id} 
                className="relative p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-2 py-1 rounded-full">
                    Deleted
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category: {item.category}</p>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRestoreItem(item.id)}
                    className="flex-1"
                  >
                    Restore
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handlePermanentDelete(item.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">No recently deleted items</p>
          </div>
        )
      )}
      
      {!showDeleted && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
          onClick={handleAddNewItem}
          aria-label="Add new item by scanning barcode"
          title="Scan barcode to add new item"
        >
          <Barcode size={24} />
        </Button>
      )}

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
    </div>
  );
};

export default Inventory;
