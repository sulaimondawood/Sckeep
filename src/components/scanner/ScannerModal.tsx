
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

    // In a real application, you would call a product lookup API here
    // For now, we'll prompt the user to enter details manually with the barcode pre-filled
    try {
      // Attempt to lookup product information using the barcode
      const productInfo = await lookupProductByBarcode(data);
      
      if (productInfo) {
        // If product found, use the retrieved information
        onScanComplete({
          barcode: data,
          name: productInfo.name,
          category: productInfo.category || "Scanned Item",
          quantity: 1,
          unit: productInfo.unit || "pcs",
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 2 weeks
          notes: `Scanned barcode: ${data}`
        });
      } else {
        // Product not found, switch to manual entry with barcode pre-filled
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

  // Mock product lookup function - replace with real API call
  const lookupProductByBarcode = async (barcode: string): Promise<any | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock database of some common products (in a real app, this would be an API call)
    const mockProducts: { [key: string]: any } = {
      // Common test barcodes
      "123456789012": { name: "Test Product", category: "Food", unit: "pcs" },
      "072250007164": { name: "Coca-Cola", category: "Beverages", unit: "bottles" },
      "038000356308": { name: "Kellogg's Corn Flakes", category: "Breakfast", unit: "boxes" },
      "041220576302": { name: "Pepsi Cola", category: "Beverages", unit: "cans" },
      // Add more real barcodes as needed
    };
    
    // In a real application, you might use services like:
    // - OpenFoodFacts API
    // - UPC Database API
    // - Barcode Lookup API
    // For example: https://world.openfoodfacts.org/api/v0/product/${barcode}.json
    
    return mockProducts[barcode] || null;
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  const handleManualSubmit = (formData: any) => {
    onScanComplete(formData);
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
