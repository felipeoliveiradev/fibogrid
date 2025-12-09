import { useCallback, useEffect, useState } from 'react';
import { RowNode, ProcessedColumn, GridApi } from '../types';

interface CellPosition {
  rowId: string;
  field: string;
}

interface UseKeyboardNavigationProps<T> {
  containerRef: React.RefObject<HTMLDivElement>;
  displayedRows: RowNode<T>[];
  columns: ProcessedColumn<T>[];
  api: GridApi<T>;
  onStartEdit?: (rowId: string, field: string) => void;
  onStopEdit?: (cancel: boolean) => void;
  isEditing: boolean;
}

export function useKeyboardNavigation<T>({
  containerRef,
  displayedRows,
  columns,
  api,
  onStartEdit,
  onStopEdit,
  isEditing,
}: UseKeyboardNavigationProps<T>) {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);

  const visibleColumns = columns.filter((col) => !col.hide);

  const getRowIndex = useCallback(
    (rowId: string) => displayedRows.findIndex((r) => r.id === rowId),
    [displayedRows]
  );

  const getColIndex = useCallback(
    (field: string) => visibleColumns.findIndex((c) => c.field === field),
    [visibleColumns]
  );

  const navigateToCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const row = displayedRows[rowIndex];
      const col = visibleColumns[colIndex];
      if (row && col) {
        setFocusedCell({ rowId: row.id, field: col.field });
      }
    },
    [displayedRows, visibleColumns]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focusedCell) return;

      const rowIndex = getRowIndex(focusedCell.rowId);
      const colIndex = getColIndex(focusedCell.field);

      if (rowIndex === -1 || colIndex === -1) return;



      if (isEditing) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (rowIndex > 0) {
            navigateToCell(rowIndex - 1, colIndex);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (rowIndex < displayedRows.length - 1) {
            navigateToCell(rowIndex + 1, colIndex);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (colIndex > 0) {
            navigateToCell(rowIndex, colIndex - 1);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (colIndex < visibleColumns.length - 1) {
            navigateToCell(rowIndex, colIndex + 1);
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (colIndex > 0) {
              navigateToCell(rowIndex, colIndex - 1);
            } else if (rowIndex > 0) {
              navigateToCell(rowIndex - 1, visibleColumns.length - 1);
            }
          } else {
            if (colIndex < visibleColumns.length - 1) {
              navigateToCell(rowIndex, colIndex + 1);
            } else if (rowIndex < displayedRows.length - 1) {
              navigateToCell(rowIndex + 1, 0);
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          if (e.ctrlKey) {
            navigateToCell(0, 0);
          } else {
            navigateToCell(rowIndex, 0);
          }
          break;

        case 'End':
          e.preventDefault();
          if (e.ctrlKey) {
            navigateToCell(displayedRows.length - 1, visibleColumns.length - 1);
          } else {
            navigateToCell(rowIndex, visibleColumns.length - 1);
          }
          break;

        case 'PageUp':
          e.preventDefault();
          navigateToCell(Math.max(0, rowIndex - 10), colIndex);
          break;

        case 'PageDown':
          e.preventDefault();
          navigateToCell(
            Math.min(displayedRows.length - 1, rowIndex + 10),
            colIndex
          );
          break;

        case 'Enter':
        case 'F2':
          e.preventDefault();
          const col = visibleColumns[colIndex];
          if (col.editable) {
            onStartEdit?.(focusedCell.rowId, focusedCell.field);
          }
          break;

        case ' ':
          e.preventDefault();

          api.selectRow(focusedCell.rowId);
          break;

        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            api.selectAll();
          }
          break;

        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            api.copyToClipboard(false);
          }
          break;
      }
    },
    [
      focusedCell,
      getRowIndex,
      getColIndex,
      isEditing,
      displayedRows,
      visibleColumns,
      navigateToCell,
      onStartEdit,
      onStopEdit,
      api,
    ]
  );


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);

  const focusCell = useCallback((rowId: string, field: string) => {
    setFocusedCell({ rowId, field });
    containerRef.current?.focus();
  }, [containerRef]);

  const isCellFocused = useCallback(
    (rowId: string, field: string) =>
      focusedCell?.rowId === rowId && focusedCell?.field === field,
    [focusedCell]
  );

  return {
    focusedCell,
    focusCell,
    isCellFocused,
    setFocusedCell,
  };
}
