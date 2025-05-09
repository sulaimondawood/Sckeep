
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FoodItem } from '@/types/food';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditFoodItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodItem | null;
  onSave: (updatedItem: FoodItem) => void;
}

const CATEGORIES = [
  'Dairy', 'Fruits', 'Vegetables', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Other'
];

const UNITS = ['pieces', 'grams', 'kg', 'ml', 'liters', 'bottle', 'carton', 'box', 'loaf', 'head', 'pack'];

const EditFoodItemDialog: React.FC<EditFoodItemDialogProps> = ({ isOpen, onClose, item, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FoodItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Initialize form data when dialog opens with item data or when the item changes
  useEffect(() => {
    if (item && isOpen) {
      setFormData({ ...item });
      setImagePreview(item.imageUrl || null);
    }
  }, [item, isOpen]);

  // Reset form when dialog closes
  const handleClose = () => {
    setFormData(null);
    setImagePreview(null);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setFormData(prev => {
        if (!prev) return null;
        return { ...prev, [name]: numValue };
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setImagePreview(imageUrl);
      setFormData(prev => {
        if (!prev) return null;
        return { ...prev, imageUrl };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
  };

  if (!formData) return null;

  const dialogContent = (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Image upload */}
      <div className="space-y-2">
        <Label htmlFor="image">Product Image (optional)</Label>
        <div className="space-y-2">
          {imagePreview ? (
            <div className="relative w-full h-40 mb-2 border rounded-md overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Product preview" 
                className="w-full h-full object-contain"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute top-1 right-1 h-8 w-8 p-0"
                onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => {
                    if (!prev) return null;
                    const updated = { ...prev };
                    delete updated.imageUrl;
                    return updated;
                  });
                }}
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700">
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload image</p>
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input 
            id="quantity" 
            name="quantity" 
            type="number" 
            min="0" 
            value={formData.quantity} 
            onChange={handleNumberChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <select 
            id="unit" 
            name="unit" 
            value={formData.unit} 
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input 
            id="expiryDate" 
            name="expiryDate" 
            type="date" 
            value={formData.expiryDate} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode (optional)</Label>
          <Input 
            id="barcode" 
            name="barcode" 
            value={formData.barcode || ''} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          value={formData.notes || ''} 
          onChange={handleChange} 
          className="min-h-[80px]"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={isMobile ? "sm:max-w-md max-h-[90vh] p-4 overflow-hidden" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>Edit Food Item</DialogTitle>
        </DialogHeader>
        {isMobile ? (
          <ScrollArea className="max-h-[70vh] pr-3">
            {dialogContent}
          </ScrollArea>
        ) : (
          dialogContent
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditFoodItemDialog;
