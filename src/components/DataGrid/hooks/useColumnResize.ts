import { useState, useCallback, useRef } from 'react';
import { ProcessedColumn } from '../types';

interface ColumnResizeResult {
  isResizing: boolean;
  resizingColumn: string | null;
  handleResizeStart: (e: React.MouseEvent, column: ProcessedColumn) => void;
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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      
      const diff = e.clientX - startX.current;
      let newWidth = startWidth.current + diff;
      
      // Apply constraints
      newWidth = Math.max(minWidth.current, newWidth);
      newWidth = Math.min(maxWidth.current, newWidth);
      
      onResize(columnField.current, newWidth);
    },
    [isResizing, onResize]
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

  return {
    isResizing,
    resizingColumn,
    handleResizeStart,
  };
}
