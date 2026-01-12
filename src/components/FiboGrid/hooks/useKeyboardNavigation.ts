import { useCallback, useState, useMemo } from 'react';
import { RowNode, ProcessedColumn, GridApi, ShortcutDef } from '../types';
import { defaultShortcuts, isShortcutMatch } from '../utils/shortcuts';
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
  shortcuts?: boolean | ShortcutDef<T>[];
}
export function useKeyboardNavigation<T>({
  containerRef,
  displayedRows,
  columns,
  api,
  onStartEdit,
  onStopEdit,
  isEditing,
  shortcuts = true,
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
  const focusCell = useCallback((rowId: string, field: string) => {
    setFocusedCell({ rowId, field });
    if (containerRef.current) {
      containerRef.current.focus({ preventScroll: true });
    }
  }, [containerRef]);
  const activeShortcuts = useMemo(() => {
    if (shortcuts === false) return [];
    if (shortcuts === true) return defaultShortcuts;
    if (Array.isArray(shortcuts)) return shortcuts;
    return defaultShortcuts;
  }, [shortcuts]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (isEditing) {
        return;
      }
      const currentState = {
        rowIndex: focusedCell ? getRowIndex(focusedCell.rowId) : -1,
        colIndex: focusedCell ? getColIndex(focusedCell.field) : -1,
        focusedCell
      };
      const match = activeShortcuts.find(s => isShortcutMatch(e, s));
      if (match) {
        if (match.preventDefault) e.preventDefault();
        match.action({
          event: e,
          api,
          focusRow: (idx) => {
            const row = displayedRows[idx];
            if (row && visibleColumns.length > 0) {
              focusCell(row.id, visibleColumns[0].field);
            }
          },
          focusCell: (rIndex, cIndex) => navigateToCell(rIndex, cIndex),
          currentState
        });
      }
    },
    [
      focusedCell,
      getRowIndex,
      getColIndex,
      isEditing,
      activeShortcuts,
      api,
      navigateToCell,
      displayedRows,
      visibleColumns,
      focusCell
    ]
  );
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
    handleKeyDown
  };
}
