
import React, { useEffect, useRef, useState } from 'react';

interface CameraScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Request access to the user's camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use the back camera if available
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // In a real app, we'd now process frames to detect barcodes
        // For this demo, we'll simulate a barcode detection after a short delay
        setTimeout(() => {
          const randomBarcode = Array.from({ length: 13 }, () => 
            Math.floor(Math.random() * 10)
          ).join('');
          
          onScan(randomBarcode);
        }, 4000);
        
      } catch (err) {
        setHasCamera(false);
        onError("Could not access camera. Please check permissions.");
      }
    };
    
    startCamera();
    
    // Clean up function to stop the camera when component unmounts
    return () => {
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
              Scanning...
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Camera access denied. Please check your permissions.
        </div>
      )}
    </div>
  );
};

export default CameraScanner;
