
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  const [error, setError] = useState<string | null>(null);
  const [keyBuffer, setKeyBuffer] = useState<string>('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);
  const { isConnected: scannerConnected } = useBarcodeScanner();
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // If more than 100ms has passed since last key, reset buffer
      if (currentTime - lastKeyTime > 100) {
        setKeyBuffer('');
      }
      
      setLastKeyTime(currentTime);
      
      if (event.key === 'Enter') {
        // Barcode scan complete
        if (keyBuffer.length >= 8) { // Minimum barcode length
          onScan(keyBuffer);
          setKeyBuffer('');
        }
      } else if (event.key.length === 1) {
        // Regular character
        setKeyBuffer(prev => prev + event.key);
      }
    };
    
    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyPress);
    
    // If no scanner is detected after 5 seconds, suggest camera scanning
    const timer = setTimeout(() => {
      if (!scannerConnected) {
        onError("No barcode scanner detected. Please try the camera scanner instead.");
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(timer);
    };
  }, [onScan, onError, scannerConnected, keyBuffer, lastKeyTime]);
  
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
          {scannerConnected ? "Scanner detected - Ready to scan" : "Waiting for barcode scanner..."}
        </div>
      </div>
      
      {keyBuffer && (
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="px-3 py-1 bg-blue-500/80 rounded-full text-white text-xs">
            Reading: {keyBuffer}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
