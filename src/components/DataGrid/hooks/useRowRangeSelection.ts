import { useState, useCallback, useRef, useEffect } from 'react';

interface RowRangeSelectionResult {
  isDraggingRows: boolean;
  handleRowMouseDown: (rowId: string, isSelected: boolean, onToggle: () => void) => void;
  handleRowMouseEnter: (rowId: string, isSelected: boolean, onToggle: () => void) => void;
  handleRowMouseUp: () => void;
}

export function useRowRangeSelection(): RowRangeSelectionResult {
  const [isDraggingRows, setIsDraggingRows] = useState(false);
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const initialRowIdRef = useRef<string | null>(null);
  const initialRowToggleRef = useRef<(() => void) | null>(null);
  const initialSelectionStateRef = useRef<boolean>(false);
  const processedRowsRef = useRef<Set<string>>(new Set());

  const handleRowMouseDown = useCallback(
    (rowId: string, isSelected: boolean, onToggle: () => void) => {
      // Store what the target state should be (opposite of current)
      // This is what we'll apply to other rows when dragging
      initialSelectionStateRef.current = !isSelected;
      processedRowsRef.current = new Set([rowId]);
      initialRowIdRef.current = rowId;
      initialRowToggleRef.current = onToggle;
      
      // DON'T toggle here - let the click handler do it for single clicks
      // But save the toggle function in case we start dragging
      
      // Mark that mouse is down to track potential drag
      isMouseDownRef.current = true;
    },
    []
  );

  const handleRowMouseEnter = useCallback(
    (rowId: string, isSelected: boolean, onToggle: () => void) => {
      // Only process if mouse is down
      if (!isMouseDownRef.current) return;
      
      // If entering a different row, activate dragging mode
      if (rowId !== initialRowIdRef.current && !isDraggingRef.current) {
        setIsDraggingRows(true);
        isDraggingRef.current = true;
        
        // Now that we're dragging, apply selection to the initial row
        if (initialRowToggleRef.current) {
          initialRowToggleRef.current();
          initialRowToggleRef.current = null; // Clear to avoid double-toggle
        }
      }
      
      // Only continue if we're in drag mode
      if (!isDraggingRef.current) return;
      
      // Avoid processing the same row multiple times
      if (processedRowsRef.current.has(rowId)) return;
      processedRowsRef.current.add(rowId);
      
      // Only toggle if current state doesn't match target state
      if (isSelected !== initialSelectionStateRef.current) {
        onToggle();
      }
    },
    []
  );

  const handleRowMouseUp = useCallback(() => {
    setIsDraggingRows(false);
    isDraggingRef.current = false;
    isMouseDownRef.current = false;
    initialRowIdRef.current = null;
    initialRowToggleRef.current = null;
    processedRowsRef.current.clear();
  }, []);

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleRowMouseUp();
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleRowMouseUp]);

  return {
    isDraggingRows,
    handleRowMouseDown,
    handleRowMouseEnter,
    handleRowMouseUp,
  };
}
