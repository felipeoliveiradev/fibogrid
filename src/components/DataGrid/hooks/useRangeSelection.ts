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
  const startPosRef = useRef<CellPosition | null>(null);

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

      if (e.button !== 0) return;

      e.preventDefault();

      const position = { rowIndex, colIndex };

      if (e.shiftKey && startPosRef.current) {
        setSelectionEnd(position);
        setSelectedCells(calculateSelectedCells(startPosRef.current, position));
      } else {

        setSelectionStart(position);
        setSelectionEnd(position);
        setSelectedCells(new Set([`${rowIndex}-${colIndex}`]));
        startPosRef.current = position;
      }

      setIsSelecting(true);
      isSelectingRef.current = true;
    },
    [calculateSelectedCells]
  );

  const handleCellMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!isSelectingRef.current || !startPosRef.current) return;

      const position = { rowIndex, colIndex };
      setSelectionEnd(position);
      setSelectedCells(calculateSelectedCells(startPosRef.current, position));
    },
    [calculateSelectedCells]
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
    startPosRef.current = null;
  }, []);

  const isCellSelected = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      return selectedCells.has(`${rowIndex}-${colIndex}`);
    },
    [selectedCells]
  );

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
