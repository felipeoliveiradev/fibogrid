import { useState, useCallback, useRef } from 'react';
import { ProcessedColumn } from '../types';

interface ColumnDragResult {
  isDragging: boolean;
  draggedColumn: string | null;
  dragOverColumn: string | null;
  handleDragStart: (e: React.DragEvent, column: ProcessedColumn) => void;
  handleDragOver: (e: React.DragEvent, column: ProcessedColumn) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, column: ProcessedColumn) => void;
}

export function useColumnDrag(
  onColumnMove: (fromIndex: number, toIndex: number) => void
): ColumnDragResult {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  const draggedIndex = useRef<number>(-1);

  const handleDragStart = useCallback(
    (e: React.DragEvent, column: ProcessedColumn) => {
      if (!column.draggable) {
        e.preventDefault();
        return;
      }
      
      setIsDragging(true);
      setDraggedColumn(column.field);
      draggedIndex.current = column.index;
      
      // Set drag image
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', column.field);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, column: ProcessedColumn) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      setDragOverColumn(column.field);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, column: ProcessedColumn) => {
      e.preventDefault();
      
      if (draggedIndex.current !== -1 && draggedIndex.current !== column.index) {
        onColumnMove(draggedIndex.current, column.index);
      }
      
      handleDragEnd();
    },
    [onColumnMove, handleDragEnd]
  );

  return {
    isDragging,
    draggedColumn,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  };
}
