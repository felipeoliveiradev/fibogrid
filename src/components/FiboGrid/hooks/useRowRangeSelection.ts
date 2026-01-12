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
      initialSelectionStateRef.current = !isSelected;
      processedRowsRef.current = new Set([rowId]);
      initialRowIdRef.current = rowId;
      initialRowToggleRef.current = onToggle;
      isMouseDownRef.current = true;
    },
    []
  );
  const handleRowMouseEnter = useCallback(
    (rowId: string, isSelected: boolean, onToggle: () => void) => {
      if (!isMouseDownRef.current) return;
      if (rowId !== initialRowIdRef.current && !isDraggingRef.current) {
        setIsDraggingRows(true);
        isDraggingRef.current = true;
        if (initialRowToggleRef.current) {
          initialRowToggleRef.current();
          initialRowToggleRef.current = null;
        }
      }
      if (!isDraggingRef.current) return;
      if (processedRowsRef.current.has(rowId)) return;
      processedRowsRef.current.add(rowId);
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
