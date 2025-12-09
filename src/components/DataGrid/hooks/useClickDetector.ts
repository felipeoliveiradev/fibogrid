import { useRef, useCallback } from 'react';

interface ClickDetectorOptions {
  doubleClickDelay?: number; // ms to wait to determine if it's a multi-click
}

export function useClickDetector(options: ClickDetectorOptions = {}) {
  const { doubleClickDelay = 300 } = options;
  
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const detectClick = useCallback(
    (callback: (clickType: 'single' | 'double' | 'triple' | number) => void) => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;
      
      // If time between clicks is greater than delay, reset counter
      if (timeSinceLastClick > doubleClickDelay) {
        clickCountRef.current = 0;
      }
      
      clickCountRef.current++;
      lastClickTimeRef.current = now;
      
      // Clear existing timer
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      
      // Wait to see if more clicks are coming
      clickTimerRef.current = setTimeout(() => {
        const count = clickCountRef.current;
        
        // Determine click type
        let clickType: 'single' | 'double' | 'triple' | number;
        if (count === 1) {
          clickType = 'single';
        } else if (count === 2) {
          clickType = 'double';
        } else if (count === 3) {
          clickType = 'triple';
        } else {
          clickType = count;
        }
        
        // Execute callback
        callback(clickType);
        
        // Reset counter after processing
        clickCountRef.current = 0;
      }, doubleClickDelay);
    },
    [doubleClickDelay]
  );

  return { detectClick };
}
