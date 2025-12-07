import { useState, useCallback, useRef, useEffect } from 'react';
import { ProcessedColumn } from '../types';

interface ColumnResizeResult {
  isResizing: boolean;
  resizingColumn: string | null;
  handleResizeStart: (e: React.MouseEvent, column: ProcessedColumn) => void;
  handleResizeDoubleClick: (column: ProcessedColumn, measureContent: () => number) => void;
}

export function useColumnResize(
  onResize: (field: string, width: number) => void
): ColumnResizeResult {
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  
  const startX = useRef(0);
  const startWidth = useRef(0);
  const columnField = useRef<string>('');
  const minWidth = useRef(50);
  const maxWidth = useRef(Infinity);
  const onResizeRef = useRef(onResize);
  
  // Keep onResize ref updated
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      let newWidth = startWidth.current + diff;
      
      // Apply constraints
      newWidth = Math.max(minWidth.current, newWidth);
      newWidth = Math.min(maxWidth.current, newWidth);
      
      onResizeRef.current(columnField.current, newWidth);
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, column: ProcessedColumn) => {
      e.preventDefault();
      e.stopPropagation();
      
      startX.current = e.clientX;
      startWidth.current = column.computedWidth;
      columnField.current = column.field;
      minWidth.current = column.minWidth || 50;
      maxWidth.current = column.maxWidth || Infinity;
      
      setIsResizing(true);
      setResizingColumn(column.field);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [handleMouseMove, handleMouseUp]
  );

  // Double-click to auto-fit column width to content
  const handleResizeDoubleClick = useCallback(
    (column: ProcessedColumn, measureContent: () => number) => {
      const contentWidth = measureContent();
      const headerWidth = column.headerName.length * 10 + 60; // Approximate header width
      const newWidth = Math.max(
        column.minWidth || 50,
        Math.min(column.maxWidth || Infinity, Math.max(contentWidth, headerWidth))
      );
      onResizeRef.current(column.field, newWidth);
    },
    []
  );

  return {
    isResizing,
    resizingColumn,
    handleResizeStart,
    handleResizeDoubleClick,
  };
}
