
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CameraScanner from "./CameraScanner";
import ManualEntryForm from "./ManualEntryForm";

interface ScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (data: any) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ open, onClose, onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const { toast: uiToast } = useToast();

  const handleScan = async (data: string) => {
    setScannedData(data);
    setIsScanning(false);
    
    console.log('Barcode scanned:', data);
    toast.success("Barcode scanned successfully", {
      description: `Barcode: ${data}`
    });

    try {
      const productInfo = await lookupProductByBarcode(data);
      
      if (productInfo) {
        console.log('Product found:', productInfo);
        // Calculate expiry date based on product type
        const expiryDate = calculateExpiryDate(productInfo.category, productInfo.shelfLifeDays);
        
        onScanComplete({
          barcode: data,
          name: productInfo.name,
          category: productInfo.category || "Other",
          quantity: 1,
          unit: productInfo.unit || "pcs",
          expiryDate: expiryDate,
          addedDate: new Date().toISOString().split('T')[0],
          notes: `Scanned barcode: ${data}`,
          imageUrl: productInfo.imageUrl
        });
      } else {
        // Product not found, switch to manual entry with barcode pre-filled
        console.log('Product not found for barcode:', data);
        uiToast({
          title: "Product not found",
          description: "Please enter the product details manually. The barcode has been saved.",
        });
        setActiveTab("manual");
      }
    } catch (error) {
      console.error('Error looking up product:', error);
      uiToast({
        title: "Lookup failed",
        description: "Please enter the product details manually. The barcode has been saved.",
      });
      setActiveTab("manual");
    }
  };

  // Calculate realistic expiry date based on product category and shelf life
  const calculateExpiryDate = (category: string, shelfLifeDays?: number): string => {
    const today = new Date();
    let daysToAdd = shelfLifeDays || getDefaultShelfLife(category);
    
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + daysToAdd);
    
    return expiryDate.toISOString().split('T')[0];
  };

  // Get default shelf life based on category
  const getDefaultShelfLife = (category: string): number => {
    const shelfLifeMap: { [key: string]: number } = {
      'Dairy': 7,        // 1 week
      'Meat': 3,         // 3 days
      'Seafood': 2,      // 2 days
      'Fruits': 5,       // 5 days
      'Vegetables': 7,   // 1 week
      'Bakery': 3,       // 3 days
      'Beverages': 365,  // 1 year
      'Snacks': 90,      // 3 months
      'Pantry': 365,     // 1 year
      'Frozen': 90,      // 3 months
      'Canned': 730,     // 2 years
      'Other': 30        // 1 month default
    };
    
    return shelfLifeMap[category] || 30;
  };

  // Map Open Food Facts categories to our categories
  const mapOpenFoodFactsCategory = (categories: string): string => {
    const categoryString = categories.toLowerCase();
    
    if (categoryString.includes('dairy') || categoryString.includes('milk') || categoryString.includes('cheese') || categoryString.includes('yogurt')) {
      return 'Dairy';
    }
    if (categoryString.includes('meat') || categoryString.includes('beef') || categoryString.includes('pork') || categoryString.includes('chicken')) {
      return 'Meat';
    }
    if (categoryString.includes('fish') || categoryString.includes('seafood') || categoryString.includes('salmon')) {
      return 'Seafood';
    }
    if (categoryString.includes('fruit') || categoryString.includes('apple') || categoryString.includes('banana') || categoryString.includes('orange')) {
      return 'Fruits';
    }
    if (categoryString.includes('vegetable') || categoryString.includes('tomato') || categoryString.includes('potato') || categoryString.includes('carrot')) {
      return 'Vegetables';
    }
    if (categoryString.includes('bread') || categoryString.includes('bakery') || categoryString.includes('pastry')) {
      return 'Bakery';
    }
    if (categoryString.includes('beverage') || categoryString.includes('drink') || categoryString.includes('juice') || categoryString.includes('soda')) {
      return 'Beverages';
    }
    if (categoryString.includes('snack') || categoryString.includes('chip') || categoryString.includes('cookie') || categoryString.includes('candy')) {
      return 'Snacks';
    }
    if (categoryString.includes('frozen')) {
      return 'Frozen';
    }
    if (categoryString.includes('canned') || categoryString.includes('preserves')) {
      return 'Canned';
    }
    
    return 'Other';
  };

  // Fetch product data from Open Food Facts API
  const lookupProductByBarcode = async (barcode: string): Promise<any | null> => {
    try {
      console.log('Fetching product data from Open Food Facts for barcode:', barcode);
      
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      
      if (!response.ok) {
        console.log('API request failed with status:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('Open Food Facts API response:', data);
      
      if (data.status === 0 || !data.product) {
        console.log('Product not found in Open Food Facts database');
        return null;
      }
      
      const product = data.product;
      
      // Extract product information
      const productName = product.product_name || product.product_name_en || 'Unknown Product';
      const brandName = product.brands ? product.brands.split(',')[0].trim() : '';
      const fullName = brandName ? `${brandName} ${productName}` : productName;
      
      // Get product image (prioritize front image)
      let imageUrl = null;
      if (product.image_front_url) {
        imageUrl = product.image_front_url;
      } else if (product.image_url) {
        imageUrl = product.image_url;
      }
      
      // Map categories
      const categories = product.categories || '';
      const mappedCategory = mapOpenFoodFactsCategory(categories);
      
      // Determine unit based on product info
      let unit = 'pcs';
      if (product.quantity) {
        const quantityString = product.quantity.toLowerCase();
        if (quantityString.includes('ml') || quantityString.includes('l')) {
          unit = 'ml';
        } else if (quantityString.includes('g') || quantityString.includes('kg')) {
          unit = 'g';
        }
      }
      
      console.log('Processed product data:', {
        name: fullName,
        category: mappedCategory,
        imageUrl,
        unit
      });
      
      return {
        name: fullName,
        category: mappedCategory,
        imageUrl: imageUrl,
        unit: unit,
        shelfLifeDays: getDefaultShelfLife(mappedCategory)
      };
      
    } catch (error) {
      console.error('Error fetching from Open Food Facts API:', error);
      throw new Error('Failed to fetch product information');
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  const handleManualSubmit = (formData: any) => {
    console.log('Manual form data submitted:', formData);
    const completeFormData = {
      ...formData,
      addedDate: formData.addedDate || new Date().toISOString().split('T')[0]
    };
    console.log('Complete form data being sent:', completeFormData);
    onScanComplete(completeFormData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="camera" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center mb-4">
                <Camera size={48} className="text-primary" />
              </div>
              
              <div className="text-center mb-4">
                <h3 className="font-medium mb-2">Scan Product Barcode</h3>
                <p className="text-sm text-muted-foreground">
                  Point your camera at a product barcode to automatically fetch product details from the Open Food Facts database
                </p>
              </div>
              
              {!isScanning ? (
                <Button onClick={handleStartScanning}>
                  Start Camera Scanner
                </Button>
              ) : (
                <div className="w-full">
                  <CameraScanner onScan={handleScan} onError={(error) => {
                    uiToast({
                      title: "Camera Error",
                      description: error,
                      variant: "destructive"
                    });
                    setIsScanning(false);
                  }} />
                  <Button 
                    variant="outline" 
                    onClick={() => setIsScanning(false)}
                    className="mt-4 w-full"
                  >
                    Cancel Scanning
                  </Button>
                </div>
              )}
              
              <div className="text-center text-xs text-muted-foreground mt-4 space-y-1">
                <p>• Make sure the barcode is well-lit and clearly visible</p>
                <p>• Hold your phone steady about 6-8 inches away</p>
                <p>• Try different angles if scanning fails</p>
                <p>• The system will fetch real product data including images and names</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="py-2">
            <ScrollArea className="h-[60vh]">
              <ManualEntryForm 
                initialData={{barcode: scannedData || undefined}} 
                onSubmit={handleManualSubmit} 
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ScannerModal;
