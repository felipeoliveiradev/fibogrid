import { useState, useCallback, useRef } from 'react';
interface CellPosition {
  rowId: string;
  field: string;
}
interface FillRange {
  start: CellPosition;
  end: CellPosition;
}
interface UseFillHandleOptions<T> {
  rows: { id: string; data: T }[];
  columns: { field: string }[];
  onFill: (changes: { rowId: string; field: string; value: any }[]) => void;
}
interface UseFillHandleResult {
  fillRange: FillRange | null;
  isFilling: boolean;
  handleFillStart: (rowId: string, field: string, e: React.MouseEvent) => void;
  handleFillMove: (rowId: string, field: string) => void;
  handleFillEnd: () => void;
  getFillHandlePosition: (selectedRange: FillRange | null) => CellPosition | null;
}
export function useFillHandle<T>({
  rows,
  columns,
  onFill,
}: UseFillHandleOptions<T>): UseFillHandleResult {
  const [fillRange, setFillRange] = useState<FillRange | null>(null);
  const [isFilling, setIsFilling] = useState(false);
  const sourceValueRef = useRef<any>(null);
  const sourcePositionRef = useRef<CellPosition | null>(null);
  const getRowIndex = useCallback((rowId: string) => {
    return rows.findIndex(r => r.id === rowId);
  }, [rows]);
  const getColumnIndex = useCallback((field: string) => {
    return columns.findIndex(c => c.field === field);
  }, [columns]);
  const handleFillStart = useCallback((
    rowId: string,
    field: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const row = rows.find(r => r.id === rowId);
    if (row) {
      sourceValueRef.current = (row.data as any)[field];
      sourcePositionRef.current = { rowId, field };
      setFillRange({ start: { rowId, field }, end: { rowId, field } });
      setIsFilling(true);
    }
  }, [rows]);
  const handleFillMove = useCallback((rowId: string, field: string) => {
    if (!isFilling || !sourcePositionRef.current) return;
    setFillRange(prev => prev ? {
      ...prev,
      end: { rowId, field },
    } : null);
  }, [isFilling]);
  const handleFillEnd = useCallback(() => {
    if (!fillRange || !sourcePositionRef.current) {
      setIsFilling(false);
      setFillRange(null);
      return;
    }
    const startRowIndex = getRowIndex(fillRange.start.rowId);
    const endRowIndex = getRowIndex(fillRange.end.rowId);
    const startColIndex = getColumnIndex(fillRange.start.field);
    const endColIndex = getColumnIndex(fillRange.end.field);
    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);
    const changes: { rowId: string; field: string; value: any }[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const row = rows[r];
        const col = columns[c];
        if (row && col) {
          if (row.id === sourcePositionRef.current.rowId && 
              col.field === sourcePositionRef.current.field) {
            continue;
          }
          changes.push({
            rowId: row.id,
            field: col.field,
            value: sourceValueRef.current,
          });
        }
      }
    }
    if (changes.length > 0) {
      onFill(changes);
    }
    setIsFilling(false);
    setFillRange(null);
    sourceValueRef.current = null;
    sourcePositionRef.current = null;
  }, [fillRange, rows, columns, getRowIndex, getColumnIndex, onFill]);
  const getFillHandlePosition = useCallback((selectedRange: FillRange | null): CellPosition | null => {
    if (!selectedRange) return null;
    return selectedRange.end;
  }, []);
  return {
    fillRange,
    isFilling,
    handleFillStart,
    handleFillMove,
    handleFillEnd,
    getFillHandlePosition,
  };
}
