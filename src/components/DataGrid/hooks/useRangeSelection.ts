import { useState, useCallback, useRef, useEffect } from 'react';

interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

interface RangeSelectionResult {
  isSelecting: boolean;
  selectionStart: CellPosition | null;
  selectionEnd: CellPosition | null;
  selectedCells: Set<string>;
  handleCellMouseDown: (rowIndex: number, colIndex: number, e: React.MouseEvent) => void;
  handleCellMouseEnter: (rowIndex: number, colIndex: number) => void;
  handleMouseUp: () => void;
  clearSelection: () => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
}

export function useRangeSelection(): RangeSelectionResult {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<CellPosition | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const isSelectingRef = useRef(false);

  // Calculate selected cells based on start and end positions
  const calculateSelectedCells = useCallback(
    (start: CellPosition | null, end: CellPosition | null): Set<string> => {
      if (!start || !end) return new Set();
      
      const cells = new Set<string>();
      const minRow = Math.min(start.rowIndex, end.rowIndex);
      const maxRow = Math.max(start.rowIndex, end.rowIndex);
      const minCol = Math.min(start.colIndex, end.colIndex);
      const maxCol = Math.max(start.colIndex, end.colIndex);
      
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          cells.add(`${row}-${col}`);
        }
      }
      
      return cells;
    },
    []
  );

  const handleCellMouseDown = useCallback(
    (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
      // Only handle left click
      if (e.button !== 0) return;
      
      e.preventDefault();
      
      const position = { rowIndex, colIndex };
      setSelectionStart(position);
      setSelectionEnd(position);
      setSelectedCells(new Set([`${rowIndex}-${colIndex}`]));
      setIsSelecting(true);
      isSelectingRef.current = true;
    },
    []
  );

  const handleCellMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!isSelectingRef.current || !selectionStart) return;
      
      const position = { rowIndex, colIndex };
      setSelectionEnd(position);
      setSelectedCells(calculateSelectedCells(selectionStart, position));
    },
    [selectionStart, calculateSelectedCells]
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    isSelectingRef.current = false;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setSelectedCells(new Set());
    setIsSelecting(false);
    isSelectingRef.current = false;
  }, []);

  const isCellSelected = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      return selectedCells.has(`${rowIndex}-${colIndex}`);
    },
    [selectedCells]
  );

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelectingRef.current) {
        handleMouseUp();
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleMouseUp]);

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    selectedCells,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
    clearSelection,
    isCellSelected,
  };
}
