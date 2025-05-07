
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Camera, ScanBarcode } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";
import CameraScanner from "./CameraScanner";
import ManualEntryForm from "./ManualEntryForm";

interface ScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (data: any) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ open, onClose, onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<string>("barcode");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const { toast: uiToast } = useToast();

  const handleScan = (data: string) => {
    setScannedData(data);
    setIsScanning(false);
    toast.success("Barcode scanned successfully", {
      description: `Barcode: ${data}`
    });

    // In a real app, we would fetch product details using the barcode
    // For now, we'll simulate this with a delay
    setTimeout(() => {
      // If barcode lookup fails, prompt for manual entry
      const productFound = Math.random() > 0.3; // 70% chance to "find" product
      
      if (productFound) {
        onScanComplete({
          barcode: data,
          name: `Product ${data.substring(0, 4)}`,
          category: "Scanned Item",
          quantity: 1,
          unit: "pcs",
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else {
        uiToast({
          title: "Product not found",
          description: "Please enter the details manually",
        });
        setActiveTab("manual");
      }
    }, 1500);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="barcode" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="barcode">Barcode</TabsTrigger>
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="barcode" className="py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center mb-4">
                <ScanBarcode size={48} className="text-primary" />
              </div>
              {!isScanning ? (
                <Button onClick={handleStartScanning}>
                  Start Barcode Scanner
                </Button>
              ) : (
                <div className="w-full">
                  <BarcodeScanner onScan={handleScan} onError={(error) => {
                    uiToast({
                      title: "Scanner Error",
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
              
              <p className="text-center text-sm text-muted-foreground mt-2">
                Position the barcode in front of the scanner
              </p>
              
              <div className="flex justify-center mt-4">
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab("camera")}
                  className="text-sm"
                >
                  No barcode scanner? Use camera instead
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="camera" className="py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center mb-4">
                <Camera size={48} className="text-primary" />
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
              
              <p className="text-center text-sm text-muted-foreground mt-2">
                Position the barcode in the camera view
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="py-4">
            <ManualEntryForm 
              initialData={{barcode: scannedData || undefined}} 
              onSubmit={handleManualSubmit} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ScannerModal;
