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
import { Search, Filter, Barcode, RefreshCw } from 'lucide-react';
import FoodItemCard from '@/components/food/FoodItemCard';
import { useToast } from '@/hooks/use-toast';
import { mockFoodItems } from '@/data/mockData';
import { FoodItem } from '@/types/food';
import { Package } from 'lucide-react';

const Inventory: React.FC = () => {
  const [foodItems, setFoodItems] = useState(mockFoodItems);
  const [deletedItems, setDeletedItems] = useState<FoodItem[]>(() => {
    // Try to load deleted items from localStorage
    const saved = localStorage.getItem('deletedItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();

  // Save deleted items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deletedItems', JSON.stringify(deletedItems));
  }, [deletedItems]);

  const handleEditItem = (id: string) => {
    toast({
      title: "Edit Item",
      description: `Editing item with ID: ${id}`,
    });
  };

  const handleDeleteItem = (id: string) => {
    // Find the item to delete
    const itemToDelete = foodItems.find(item => item.id === id);
    if (itemToDelete) {
      // Add to deleted items
      setDeletedItems(prev => [...prev, itemToDelete]);
      // Remove from food items
      setFoodItems(foodItems.filter(item => item.id !== id));
      
      toast({
        title: "Item Removed",
        description: "Food item has been moved to recently deleted items.",
      });
    }
  };

  const handleAddNewItem = () => {
    toast({
      title: "Add New Item",
      description: "Opening barcode scanner...",
    });
  };

  const handleRestoreItem = (id: string) => {
    // Find the item to restore
    const itemToRestore = deletedItems.find(item => item.id === id);
    if (itemToRestore) {
      // Add back to food items
      setFoodItems(prev => [...prev, itemToRestore]);
      // Remove from deleted items
      setDeletedItems(deletedItems.filter(item => item.id !== id));
      
      toast({
        title: "Item Restored",
        description: "Food item has been restored to your inventory.",
      });
    }
  };

  const handlePermanentDelete = (id: string) => {
    setDeletedItems(deletedItems.filter(item => item.id !== id));
    
    toast({
      title: "Item Permanently Deleted",
      description: "Food item has been permanently removed.",
    });
  };

  const toggleDeletedItems = () => {
    setShowDeleted(!showDeleted);
  };

  // Get unique categories
  const categories = ['all', ...new Set(foodItems.map(item => item.category))];

  // Filter items
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{showDeleted ? "Recently Deleted" : "Inventory"}</h1>
          <p className="text-gray-500 dark:text-gray-400">{showDeleted ? "Restore your deleted food items" : "Manage your food items"}</p>
        </div>
        <Button
          variant="outline"
          onClick={toggleDeletedItems}
          className="flex items-center gap-2"
        >
          {showDeleted ? (
            <>
              <Package size={16} />
              View Inventory
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Recently Deleted
            </>
          )}
        </Button>
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
        // Regular inventory view
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
        // Recently deleted items view
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
      
      {/* Floating action button - only show in inventory view */}
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
    </div>
  );
};

export default Inventory;
