
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
  const [fetchedProductData, setFetchedProductData] = useState<any>(null);
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
        
        // Store the fetched product data and switch to manual entry for expiry date
        setFetchedProductData({
          barcode: data,
          name: productInfo.name,
          category: productInfo.category || "Other",
          quantity: 1,
          unit: productInfo.unit || "pcs",
          notes: `Scanned barcode: ${data}`,
          imageUrl: productInfo.imageUrl
        });
        
        uiToast({
          title: "Product found!",
          description: "Please enter the expiry date for this product.",
        });
        
        setActiveTab("manual");
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

  // Helper function to validate and process image URL
  const processImageUrl = (imageUrl: string | null | undefined): string | null => {
    if (!imageUrl) return null;
    
    // Convert HTTP to HTTPS for better compatibility
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }
    
    console.log('Processing image URL:', imageUrl);
    return imageUrl;
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
      
      // Get product image with better URL handling
      let rawImageUrl = null;
      if (product.image_front_url) {
        rawImageUrl = product.image_front_url;
      } else if (product.image_url) {
        rawImageUrl = product.image_url;
      }
      
      const processedImageUrl = processImageUrl(rawImageUrl);
      console.log('Raw image URL:', rawImageUrl);
      console.log('Processed image URL:', processedImageUrl);
      
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
      
      const productData = {
        name: fullName,
        category: mappedCategory,
        imageUrl: processedImageUrl,
        unit: unit
      };
      
      console.log('Final processed product data:', productData);
      
      return productData;
      
    } catch (error) {
      console.error('Error fetching from Open Food Facts API:', error);
      throw new Error('Failed to fetch product information');
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScannedData(null);
    setFetchedProductData(null);
  };

  const handleManualSubmit = (formData: any) => {
    console.log('Manual form data submitted:', formData);
    const completeFormData = {
      ...formData,
      addedDate: formData.addedDate || new Date().toISOString().split('T')[0]
    };
    console.log('Complete form data being sent (including imageUrl):', completeFormData);
    onScanComplete(completeFormData);
  };

  // Determine initial data for manual form
  const getInitialFormData = () => {
    if (fetchedProductData) {
      console.log('Using fetched product data with imageUrl:', fetchedProductData.imageUrl);
      return fetchedProductData;
    }
    return { barcode: scannedData || undefined };
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
                <p>• You'll be prompted to enter the expiry date manually</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="py-2">
            <ScrollArea className="h-[60vh]">
              {fetchedProductData && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {fetchedProductData.imageUrl && (
                      <img 
                        src={fetchedProductData.imageUrl} 
                        alt={fetchedProductData.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          console.error('Image failed to load:', fetchedProductData.imageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', fetchedProductData.imageUrl);
                        }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Product found: {fetchedProductData.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Please enter the expiry date below
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <ManualEntryForm 
                initialData={getInitialFormData()} 
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
