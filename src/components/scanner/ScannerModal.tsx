
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

    // Expanded mock product database with more common barcodes
    try {
      const productInfo = await lookupProductByBarcode(data);
      
      if (productInfo) {
        console.log('Product found:', productInfo);
        // If product found, use the retrieved information
        onScanComplete({
          barcode: data,
          name: productInfo.name,
          category: productInfo.category || "Scanned Item",
          quantity: 1,
          unit: productInfo.unit || "pcs",
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 2 weeks
          addedDate: new Date().toISOString().split('T')[0],
          notes: `Scanned barcode: ${data}`
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

  // Enhanced mock product lookup function with more products
  const lookupProductByBarcode = async (barcode: string): Promise<any | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Expanded mock database of common products
    const mockProducts: { [key: string]: any } = {
      // Common test barcodes
      "123456789012": { name: "Test Product", category: "Pantry", unit: "pcs" },
      "072250007164": { name: "Coca-Cola", category: "Beverages", unit: "bottles" },
      "038000356308": { name: "Kellogg's Corn Flakes", category: "Pantry", unit: "boxes" },
      "041220576302": { name: "Pepsi Cola", category: "Beverages", unit: "cans" },
      "028400064057": { name: "Lay's Classic Chips", category: "Snacks", unit: "bags" },
      "021000613922": { name: "Wonder Bread", category: "Bakery", unit: "loaves" },
      "011110871718": { name: "Milk Gallon", category: "Dairy & Eggs", unit: "gallons" },
      "072036720467": { name: "Banana Bunch", category: "Fruits & Vegetables", unit: "bunches" },
      "688267141676": { name: "Oreo Cookies", category: "Snacks", unit: "packages" },
      "030000056704": { name: "Cheerios Cereal", category: "Pantry", unit: "boxes" },
      // Generic patterns for common barcode formats
      "4901234567890": { name: "Generic Japanese Product", category: "Other", unit: "pcs" },
      "1234567890123": { name: "Generic UPC Product", category: "Other", unit: "pcs" },
      "9780123456789": { name: "Generic ISBN Product", category: "Other", unit: "pcs" },
    };
    
    // Check for exact match first
    if (mockProducts[barcode]) {
      return mockProducts[barcode];
    }
    
    // For demonstration, let's also accept any 12-13 digit barcode as a generic product
    if (/^\d{12,13}$/.test(barcode)) {
      return {
        name: "Unknown Product",
        category: "Other",
        unit: "pcs"
      };
    }
    
    return null;
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  const handleManualSubmit = (formData: any) => {
    console.log('Manual form data submitted:', formData);
    // Ensure addedDate is preserved from the form
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
                  Point your camera at a product barcode to scan it automatically
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
                <p>• Ensure the entire barcode fits within the red frame</p>
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
