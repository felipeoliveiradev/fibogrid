import { useState, useCallback, useRef } from 'react';
import { RowNode } from '../types';
interface RowDragResult<T> {
  isDragging: boolean;
  draggedRow: string | null;
  dropTargetRow: string | null;
  dropPosition: 'before' | 'after' | null;
  handleRowDragStart: (e: React.DragEvent, row: RowNode<T>) => void;
  handleRowDragOver: (e: React.DragEvent, row: RowNode<T>) => void;
  handleRowDragEnd: () => void;
  handleRowDrop: (e: React.DragEvent, row: RowNode<T>) => void;
}
export function useRowDrag<T>(
  onRowMove: (fromId: string, toId: string, position: 'before' | 'after') => void,
  onDragStart?: (row: RowNode<T>) => void,
  onDragEnd?: (row: RowNode<T>, targetRow?: RowNode<T>) => void,
  onDragMove?: (row: RowNode<T>, targetRow?: RowNode<T>) => void
): RowDragResult<T> {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedRow, setDraggedRow] = useState<string | null>(null);
  const [dropTargetRow, setDropTargetRow] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const draggedRowData = useRef<RowNode<T> | null>(null);
  const handleRowDragStart = useCallback(
    (e: React.DragEvent, row: RowNode<T>) => {
      setIsDragging(true);
      setDraggedRow(row.id);
      draggedRowData.current = row;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.id);
        const dragImage = document.createElement('div');
        dragImage.className = 'bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg';
        dragImage.textContent = `Moving row ${row.rowIndex + 1}`;
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      }
      onDragStart?.(row);
    },
    [onDragStart]
  );
  const handleRowDragOver = useCallback(
    (e: React.DragEvent, row: RowNode<T>) => {
      e.preventDefault();
      if (row.id === draggedRow) {
        setDropTargetRow(null);
        setDropPosition(null);
        return;
      }
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position = e.clientY < midY ? 'before' : 'after';
      setDropTargetRow(row.id);
      setDropPosition(position);
      if (draggedRowData.current) {
        onDragMove?.(draggedRowData.current, row);
      }
    },
    [draggedRow, onDragMove]
  );
  const handleRowDragEnd = useCallback(() => {
    if (draggedRowData.current) {
      onDragEnd?.(draggedRowData.current);
    }
    setIsDragging(false);
    setDraggedRow(null);
    setDropTargetRow(null);
    setDropPosition(null);
    draggedRowData.current = null;
  }, [onDragEnd]);
  const handleRowDrop = useCallback(
    (e: React.DragEvent, row: RowNode<T>) => {
      e.preventDefault();
      if (draggedRow && dropPosition && row.id !== draggedRow) {
        onRowMove(draggedRow, row.id, dropPosition);
      }
      handleRowDragEnd();
    },
    [draggedRow, dropPosition, onRowMove, handleRowDragEnd]
  );
  return {
    isDragging,
    draggedRow,
    dropTargetRow,
    dropPosition,
    handleRowDragStart,
    handleRowDragOver,
    handleRowDragEnd,
    handleRowDrop,
  };
}
