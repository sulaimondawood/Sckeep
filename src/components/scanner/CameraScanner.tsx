
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface CameraScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Initialize the barcode reader
        codeReaderRef.current = new BrowserMultiFormatReader();
        
        // Request access to the user's camera with back camera preference
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use the back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScanning(true);
          
          // Start scanning for barcodes
          try {
            const result = await codeReaderRef.current.decodeFromVideoDevice(
              undefined, // Use default device
              videoRef.current,
              (result, error) => {
                if (result) {
                  // Successfully scanned a barcode
                  console.log('Barcode detected:', result.getText());
                  onScan(result.getText());
                  setIsScanning(false);
                  
                  // Stop scanning after successful scan
                  if (codeReaderRef.current) {
                    codeReaderRef.current.reset();
                  }
                }
                
                if (error && !(error instanceof NotFoundException)) {
                  console.error('Barcode scanning error:', error);
                }
              }
            );
          } catch (scanError) {
            console.error('Error starting barcode scanner:', scanError);
            onError("Failed to start barcode scanner. Please try again.");
          }
        }
        
      } catch (err) {
        console.error('Camera access error:', err);
        setHasCamera(false);
        onError("Could not access camera. Please check permissions and ensure you're using HTTPS.");
      }
    };
    
    startCamera();
    
    // Clean up function to stop the camera when component unmounts
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, onError]);
  
  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-md overflow-hidden mb-4">
      {hasCamera ? (
        <>
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
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
              {isScanning ? "Scanning for barcodes..." : "Ready to scan"}
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-sm mb-2">Camera access denied or unavailable</p>
            <p className="text-xs text-gray-300">
              Please check your permissions and ensure you're using HTTPS
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraScanner;
