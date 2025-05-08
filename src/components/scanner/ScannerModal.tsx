
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Camera, ScanBarcode, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import BarcodeScanner from "./BarcodeScanner";
import CameraScanner from "./CameraScanner";
import ManualEntryForm from "./ManualEntryForm";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";

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
  const { isConnected: scannerConnected, lastDetectionMethod, bluetoothAvailable } = useBarcodeScanner();

  useEffect(() => {
    // If scanner is not detected, recommend switching to camera or manual entry
    if (open && activeTab === "barcode" && !scannerConnected && !isScanning) {
      const timer = setTimeout(() => {
        uiToast({
          title: "Barcode Scanner",
          description: "No scanner detected. Consider using the camera or manual entry.",
          variant: "default"
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [open, activeTab, scannerConnected, isScanning, uiToast]);

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

  const renderScannerStatus = () => {
    if (scannerConnected) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Wifi size={16} />
          <span>Scanner connected</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <WifiOff size={16} />
        <span>No scanner detected</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="barcode" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="barcode">Barcode</TabsTrigger>
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="barcode" className="py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center mb-4">
                <ScanBarcode size={48} className="text-primary" />
              </div>
              
              {renderScannerStatus()}
              
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
          
          <TabsContent value="manual" className="py-2">
            <ScrollArea className="h-[60vh]">
              <ManualEntryForm 
                initialData={{barcode: scannedData || undefined}} 
                onSubmit={handleManualSubmit} 
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {!bluetoothAvailable && activeTab === "barcode" && (
          <div className="text-sm flex items-center gap-2 mt-4 text-yellow-600 bg-yellow-50 p-2 rounded-md">
            <AlertTriangle size={16} />
            <span>Bluetooth API not available in this browser. Scanner detection may be limited.</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScannerModal;
