import { useCallback, useState, useMemo } from 'react';
import { RowNode, ProcessedColumn, GridApi, ShortcutDef } from '../types';
import { defaultShortcuts, isShortcutMatch } from '../utils/shortcuts';
const INITIAL_FOCUS_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'Enter',
  'F2',
]);
const isInitialFocusKey = (event: React.KeyboardEvent | KeyboardEvent): boolean => {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  return INITIAL_FOCUS_KEYS.has(event.key);
};
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
  onActiveCellChange?: (rowIndex: number, colIndex: number) => void;
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
  onActiveCellChange,
}: UseKeyboardNavigationProps<T>) {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const visibleColumns = columns.filter((col) => !col.hide);
  const { rowIndexById, totalRows } = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < displayedRows.length; i++) {
      map.set(displayedRows[i].id, i);
    }
    return { rowIndexById: map, totalRows: displayedRows.length };
  }, [displayedRows]);
  const getRowIndex = useCallback(
    (rowId: string) => rowIndexById.get(rowId) ?? -1,
    [rowIndexById]
  );
  const getColIndex = useCallback(
    (field: string) => visibleColumns.findIndex((c) => c.field === field),
    [visibleColumns]
  );
  const navigateToCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const row = displayedRows[rowIndex];
      const col = visibleColumns[colIndex];
      if (!row || !col || col.hide) return;
      if (focusedCell?.rowId === row.id && focusedCell.field === col.field) return;
      setFocusedCell({ rowId: row.id, field: col.field });
      onActiveCellChange?.(rowIndex, colIndex);
    },
    [displayedRows, visibleColumns, focusedCell, onActiveCellChange]
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
      if (!focusedCell && isInitialFocusKey(e)) {
        const firstColIndex = visibleColumns.findIndex((col) => !col.hide);
        if (totalRows > 0 && firstColIndex >= 0) {
          e.preventDefault();
          navigateToCell(0, firstColIndex);
          return;
        }
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
            const firstColIndex = visibleColumns.findIndex((col) => !col.hide);
            if (firstColIndex >= 0) {
              navigateToCell(idx, firstColIndex);
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
      totalRows,
      visibleColumns
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
