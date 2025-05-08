import { useState, useEffect } from 'react';

interface UseBarcodeScannerOptions {
  // Typical time between keystrokes for a barcode scanner (in milliseconds)
  scannerSpeed?: number;
  // Minimum sequence length to be considered a barcode scan
  minSequenceLength?: number;
}

/**
 * Hook to detect if a barcode scanner is connected and active.
 * Uses two detection methods:
 * 1. Keyboard pattern detection (fast consecutive keypresses)
 * 2. Web Bluetooth API availability check
 */
export const useBarcodeScanner = (options?: UseBarcodeScannerOptions) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastDetectionMethod, setLastDetectionMethod] = useState<string | null>(null);
  const [bluetoothAvailable, setBluetoothAvailable] = useState<boolean>(false);
  
  // Default options
  const scannerSpeed = options?.scannerSpeed || 50; // ms between characters
  const minSequenceLength = options?.minSequenceLength || 5;

  useEffect(() => {
    // Check if Web Bluetooth API is available
    if ('bluetooth' in navigator) {
      setBluetoothAvailable(true);
    }

    // Variables for keyboard detection
    let keypressTimestamps: number[] = [];
    let keySequence: string = '';
    let keyPressTimer: ReturnType<typeof setTimeout> | null = null;

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = new Date().getTime();
      
      // Add to timestamps
      keypressTimestamps.push(currentTime);
      keySequence += event.key;
      
      // Only keep recent timestamps (last 20 keypresses)
      if (keypressTimestamps.length > 20) {
        keypressTimestamps.shift();
      }
      
      // If we have enough keypresses to analyze
      if (keypressTimestamps.length > 3) {
        const intervals = [];
        for (let i = 1; i < keypressTimestamps.length; i++) {
          intervals.push(keypressTimestamps[i] - keypressTimestamps[i-1]);
        }
        
        // Calculate average interval
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        
        // If average interval is low and we have enough characters, likely a barcode scanner
        if (avgInterval < scannerSpeed && keySequence.length >= minSequenceLength) {
          setIsConnected(true);
          setLastDetectionMethod('keyboard');
          
          // Reset detection after 5 seconds of inactivity
          if (keyPressTimer) {
            clearTimeout(keyPressTimer);
          }
          
          keyPressTimer = setTimeout(() => {
            setIsConnected(false);
            keypressTimestamps = [];
            keySequence = '';
          }, 5000);
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (keyPressTimer) {
        clearTimeout(keyPressTimer);
      }
    };
  }, [scannerSpeed, minSequenceLength]);

  return {
    isConnected,
    lastDetectionMethod,
    bluetoothAvailable
  };
};
