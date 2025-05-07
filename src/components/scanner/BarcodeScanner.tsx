
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real application, this would use a library like quagga.js or zxing
    // For this demo, we'll simulate a barcode scan after a short delay
    
    const timer = setTimeout(() => {
      // Generate a random EAN-13 like barcode
      const randomBarcode = Array.from({ length: 13 }, () => 
        Math.floor(Math.random() * 10)
      ).join('');
      
      onScan(randomBarcode);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onScan]);
  
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);
  
  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-md overflow-hidden mb-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4/5 h-1/3 border-2 border-red-500 opacity-70 relative">
          <div className="absolute left-0 top-0 w-3 h-3 border-l-2 border-t-2 border-red-500"></div>
          <div className="absolute right-0 top-0 w-3 h-3 border-r-2 border-t-2 border-red-500"></div>
          <div className="absolute left-0 bottom-0 w-3 h-3 border-l-2 border-b-2 border-red-500"></div>
          <div className="absolute right-0 bottom-0 w-3 h-3 border-r-2 border-b-2 border-red-500"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-0.5 w-full bg-red-500 animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="px-3 py-1 bg-black/50 rounded-full text-white text-xs">
          Scanning...
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
