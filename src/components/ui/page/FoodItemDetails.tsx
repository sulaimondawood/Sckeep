
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FoodItem } from '@/types/food';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getExpiryStatus, getStatusColor } from '@/utils/expiryUtils';
import { mockFoodItems } from '@/data/mockData';
import EditFoodItemDialog from '@/components/food/EditFoodItemDialog';

const FoodItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<FoodItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we're using the mock data
    const savedItems = localStorage.getItem('foodItems');
    const items: FoodItem[] = savedItems ? JSON.parse(savedItems) : mockFoodItems;
    const foundItem = items.find(item => item.id === id);
    
    if (foundItem) {
      setItem(foundItem);
    } else {
      toast({
        title: "Item not found",
        description: "The requested food item could not be found.",
        variant: "destructive",
      });
      navigate('/inventory');
    }
  }, [id, navigate, toast]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    if (item) {
      // In a real app, this would be an API call
      const savedItems = localStorage.getItem('foodItems');
      const items: FoodItem[] = savedItems ? JSON.parse(savedItems) : mockFoodItems;
      const updatedItems = items.filter(i => i.id !== item.id);
      
      // Add to deleted items
      const savedDeletedItems = localStorage.getItem('deletedItems');
      const deletedItems: FoodItem[] = savedDeletedItems ? JSON.parse(savedDeletedItems) : [];
      deletedItems.push(item);
      
      localStorage.setItem('foodItems', JSON.stringify(updatedItems));
      localStorage.setItem('deletedItems', JSON.stringify(deletedItems));
      
      toast({
        title: "Item Removed",
        description: "Food item has been moved to recently deleted items.",
      });
      
      navigate('/inventory');
    }
  };

  const handleSaveEdit = (updatedItem: FoodItem) => {
    // In a real app, this would be an API call
    const savedItems = localStorage.getItem('foodItems');
    const items: FoodItem[] = savedItems ? JSON.parse(savedItems) : mockFoodItems;
    
    const updatedItems = items.map(i => 
      i.id === updatedItem.id ? updatedItem : i
    );
    
    localStorage.setItem('foodItems', JSON.stringify(updatedItems));
    
    // Update current item state
    setItem(updatedItem);
    
    // Close dialog
    setIsEditDialogOpen(false);
    
    toast({
      title: "Item Updated",
      description: "Food item has been successfully updated.",
    });
  };

  if (!item) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const status = getExpiryStatus(item.expiryDate);
  const statusColor = getStatusColor(status);

  // Generate a placeholder image URL if no real image
  const placeholderImage = "https://images.unsplash.com/photo-1616403682245-714c950a5a28?q=80&w=500&auto=format&fit=crop";

  return (
    <div>
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash size={16} />
            Delete
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Card className="overflow-hidden">
        <div className={`h-2 ${statusColor}`} />
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{item.name}</CardTitle>
              <p className="text-muted-foreground">{item.category}</p>
            </div>
            <Badge variant={status === 'expired' ? 'outline' : 'default'} className={statusColor}>
              {status === 'expired' ? 'Expired' : 
               status === 'danger' ? 'Critical' : 
               status === 'warning' ? 'Soon' : 'Safe'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Image */}
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={item.imageUrl || placeholderImage} 
                alt={item.name}
                className="w-full h-64 object-cover"
              />
            </div>
            
            {/* Right column - Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Product ID</h3>
                    <p className="font-mono text-sm">{item.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                    <p>{item.quantity} {item.unit}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                    <p className="font-mono text-sm">{item.barcode || "None"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date Added</h3>
                    <p>{formatDate(item.addedDate)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
                    <p className={status === 'expired' ? 'text-red-500' : ''}>
                      {formatDate(item.expiryDate)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
                  </div>
                </div>
              </div>
              
              {item.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {item.notes}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Storage Recommendations</h3>
                <p className="mt-1 text-sm">
                  {item.category === 'Dairy' && "Store refrigerated between 1-4°C."}
                  {item.category === 'Fruits' && "Store at room temperature until ripe, then refrigerate."}
                  {item.category === 'Meat' && "Keep refrigerated below 4°C or freeze."}
                  {item.category === 'Vegetables' && "Store in the crisper drawer of your refrigerator."}
                  {item.category === 'Bakery' && "Store in a cool, dry place or freeze to extend shelf life."}
                  {!['Dairy', 'Fruits', 'Meat', 'Vegetables', 'Bakery'].includes(item.category) && 
                    "Store according to package instructions."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <EditFoodItemDialog 
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          item={item}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default FoodItemDetails;
