import { useState, useCallback, useRef } from 'react';

interface CellPosition {
  rowId: string;
  field: string;
}

interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

interface UseCellSelectionResult {
  selectedRange: CellRange | null;
  isSelecting: boolean;
  isCellSelected: (rowId: string, field: string) => boolean;
  handleCellMouseDown: (rowId: string, field: string, e: React.MouseEvent) => void;
  handleCellMouseEnter: (rowId: string, field: string) => void;
  handleCellMouseUp: () => void;
  clearSelection: () => void;
  getSelectedCells: () => CellPosition[];
  // Fill handle
  fillHandlePosition: CellPosition | null;
  isFillHandleDragging: boolean;
  handleFillHandleMouseDown: (e: React.MouseEvent) => void;
  fillRange: CellRange | null;
}

export function useCellSelection(
  rows: { id: string }[],
  columns: { field: string }[]
): UseCellSelectionResult {
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFillHandleDragging, setIsFillHandleDragging] = useState(false);
  const [fillRange, setFillRange] = useState<CellRange | null>(null);
  
  const startCellRef = useRef<CellPosition | null>(null);

  const getRowIndex = useCallback((rowId: string) => {
    return rows.findIndex(r => r.id === rowId);
  }, [rows]);

  const getColumnIndex = useCallback((field: string) => {
    return columns.findIndex(c => c.field === field);
  }, [columns]);

  const isCellInRange = useCallback((
    rowId: string,
    field: string,
    range: CellRange | null
  ): boolean => {
    if (!range) return false;

    const rowIndex = getRowIndex(rowId);
    const colIndex = getColumnIndex(field);
    const startRowIndex = getRowIndex(range.start.rowId);
    const endRowIndex = getRowIndex(range.end.rowId);
    const startColIndex = getColumnIndex(range.start.field);
    const endColIndex = getColumnIndex(range.end.field);

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    return rowIndex >= minRow && rowIndex <= maxRow && 
           colIndex >= minCol && colIndex <= maxCol;
  }, [getRowIndex, getColumnIndex]);

  const isCellSelected = useCallback((rowId: string, field: string): boolean => {
    return isCellInRange(rowId, field, selectedRange) || 
           isCellInRange(rowId, field, fillRange);
  }, [selectedRange, fillRange, isCellInRange]);

  const handleCellMouseDown = useCallback((
    rowId: string,
    field: string,
    e: React.MouseEvent
  ) => {
    if (e.button !== 0) return; // Only left click
    
    const position: CellPosition = { rowId, field };
    startCellRef.current = position;
    setSelectedRange({ start: position, end: position });
    setIsSelecting(true);
    setFillRange(null);
  }, []);

  const handleCellMouseEnter = useCallback((rowId: string, field: string) => {
    if (!isSelecting || !startCellRef.current) return;
    
    if (isFillHandleDragging) {
      setFillRange({
        start: selectedRange?.end || startCellRef.current,
        end: { rowId, field },
      });
    } else {
      setSelectedRange(prev => prev ? {
        ...prev,
        end: { rowId, field },
      } : null);
    }
  }, [isSelecting, isFillHandleDragging, selectedRange]);

  const handleCellMouseUp = useCallback(() => {
    setIsSelecting(false);
    setIsFillHandleDragging(false);
  }, []);

  const handleFillHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFillHandleDragging(true);
    setIsSelecting(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRange(null);
    setFillRange(null);
    startCellRef.current = null;
  }, []);

  const getSelectedCells = useCallback((): CellPosition[] => {
    if (!selectedRange) return [];

    const cells: CellPosition[] = [];
    const startRowIndex = getRowIndex(selectedRange.start.rowId);
    const endRowIndex = getRowIndex(selectedRange.end.rowId);
    const startColIndex = getColumnIndex(selectedRange.start.field);
    const endColIndex = getColumnIndex(selectedRange.end.field);

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (rows[r] && columns[c]) {
          cells.push({ rowId: rows[r].id, field: columns[c].field });
        }
      }
    }

    return cells;
  }, [selectedRange, rows, columns, getRowIndex, getColumnIndex]);

  // Fill handle position is at the bottom-right of the selection
  const fillHandlePosition = selectedRange?.end || null;

  return {
    selectedRange,
    isSelecting,
    isCellSelected,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    clearSelection,
    getSelectedCells,
    fillHandlePosition,
    isFillHandleDragging,
    handleFillHandleMouseDown,
    fillRange,
  };
}
