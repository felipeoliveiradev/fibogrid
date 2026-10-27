import { useState, useCallback, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { FiboGridProps, SelectionState, RowNode, GridApi } from '../../types';
import { useGridEventSystem } from './useGridEventSystem';
export interface UseGridSelectionResult {
    selection: SelectionState;
    setSelection: Dispatch<SetStateAction<SelectionState>>;
    selectionRef: MutableRefObject<SelectionState>;
    selectRow: (rowId: string, selected: boolean, shift?: boolean, ctrl?: boolean) => void;
    selectRows: (rowIds: string[], selected: boolean) => void;
    selectAll: () => void;
    deselectAll: () => void;
}
export function useGridSelection<T>(
    props: FiboGridProps<T>,
    rowsRef: MutableRefObject<RowNode<T>[]>,
    displayedRowsRef: MutableRefObject<RowNode<T>[]>,
    events: ReturnType<typeof useGridEventSystem>,
    apiRef: MutableRefObject<GridApi<T> | undefined>
): UseGridSelectionResult {
    const { rowSelection } = props;
    const [selection, setSelection] = useState<SelectionState>({
        selectedRows: new Set(),
        lastSelectedIndex: null,
        anchorIndex: null,
    });
    const rowsIndexRef = useRef<{ rows: readonly RowNode<T>[]; map: Map<string, RowNode<T>> } | null>(null);
    const displayIndexRef = useRef<{ rows: readonly RowNode<T>[]; map: Map<string, number> } | null>(null);
    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const getDisplayIndex = useCallback((rowId: string): number => {
        const rows = displayedRowsRef.current;
        if (displayIndexRef.current?.rows !== rows) {
            const map = new Map<string, number>();
            for (let i = 0; i < rows.length; i++) map.set(rows[i].id, i);
            displayIndexRef.current = { rows, map };
        }
        return displayIndexRef.current.map.get(rowId) ?? -1;
    }, [displayedRowsRef]);
    const selectedNodes = useCallback((ids: Iterable<string>) => {
    const rows = rowsRef.current;
    if (rowsIndexRef.current?.rows !== rows) {
      const map = new Map<string, RowNode<T>>();
      for (let i = 0; i < rows.length; i++) map.set(rows[i].id, rows[i]);
      rowsIndexRef.current = { rows, map };
    }
    const map = rowsIndexRef.current.map;
    const found: RowNode<T>[] = [];
    for (const id of ids) {
      const row = map.get(id);
      if (row) found.push(row);
    }
    return found;
  }, [rowsRef]);
    const fireSelectionChanged = useCallback((getSelectedRows: () => RowNode<T>[]) => {
        if (!apiRef.current || !events.hasListeners('selectionChanged')) return;
        events.fireEvent('selectionChanged', {
            api: apiRef.current,
            selectedRows: getSelectedRows(),
        });
    }, [events, apiRef]);
    const selectRow = useCallback(
        (rowId: string, selected: boolean, shift = false, ctrl = false) => {
            if (!rowSelection) return;
            const prev = selectionRef.current;
            const rowIndex = getDisplayIndex(rowId);
            let newSelected: Set<string>;
            if (rowSelection === 'single') {
                if (selected) {
                    if (prev.selectedRows.has(rowId) && prev.selectedRows.size === 1) return;
                    newSelected = new Set([rowId]);
                } else {
                    if (!prev.selectedRows.has(rowId)) return;
                    newSelected = new Set();
                }
            } else if (shift && prev.anchorIndex !== null && rowIndex >= 0) {
                newSelected = new Set(prev.selectedRows);
                const start = Math.min(prev.anchorIndex, rowIndex);
                const end = Math.max(prev.anchorIndex, rowIndex);
                const displayed = displayedRowsRef.current;
                for (let i = start; i <= end; i++) {
                    if (displayed[i]) {
                        newSelected.add(displayed[i].id);
                    }
                }
                if (newSelected.size === prev.selectedRows.size) {
                    let hasDiff = false;
                    for (const id of newSelected) {
                        if (!prev.selectedRows.has(id)) {
                            hasDiff = true;
                            break;
                        }
                    }
                    if (!hasDiff) return;
                }
            } else {
                if (selected) {
                    if (prev.selectedRows.has(rowId)) return;
                    newSelected = new Set(prev.selectedRows);
                    newSelected.add(rowId);
                } else {
                    if (!prev.selectedRows.has(rowId)) return;
                    newSelected = new Set(prev.selectedRows);
                    newSelected.delete(rowId);
                }
            }
            const nextSelection = {
                selectedRows: newSelected,
                lastSelectedIndex: rowIndex,
                anchorIndex: shift ? prev.anchorIndex : rowIndex,
            };
            selectionRef.current = nextSelection;
            setSelection(nextSelection);
            fireSelectionChanged(() => selectedNodes(newSelected));
        },
        [rowSelection, fireSelectionChanged, displayedRowsRef, selectedNodes, getDisplayIndex]
    );
    const selectAll = useCallback(() => {
        if (rowSelection !== 'multiple') return;
        const clientRows = rowsRef.current;
        const source = clientRows.length > 0 ? clientRows : displayedRowsRef.current;
        const prev = selectionRef.current;
        if (prev.selectedRows.size === source.length) {
            let allMatch = true;
            for (let i = 0; i < source.length; i++) {
                if (!prev.selectedRows.has(source[i].id)) {
                    allMatch = false;
                    break;
                }
            }
            if (allMatch) return;
        }
        const selectedRows = new Set<string>();
        for (let i = 0; i < source.length; i++) {
            selectedRows.add(source[i].id);
        }
        const nextSelection = {
            ...selectionRef.current,
            selectedRows,
        };
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
        fireSelectionChanged(() => source);
    }, [rowSelection, fireSelectionChanged, displayedRowsRef, rowsRef]);
    const deselectAll = useCallback(() => {
        const prev = selectionRef.current;
        if (prev.selectedRows.size === 0) return;
        const nextSelection = {
            ...selectionRef.current,
            selectedRows: new Set<string>(),
        };
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
        fireSelectionChanged(() => []);
    }, [setSelection, fireSelectionChanged]);
    const selectRows = useCallback((rowIds: string[], selected: boolean) => {
        const prev = selectionRef.current;
        let needsCopy = false;
        for (let i = 0; i < rowIds.length; i++) {
            const has = prev.selectedRows.has(rowIds[i]);
            if (selected ? !has : has) {
                needsCopy = true;
                break;
            }
        }
        if (!needsCopy) return;
        const newSelected = new Set(prev.selectedRows);
        for (let i = 0; i < rowIds.length; i++) {
            if (selected) newSelected.add(rowIds[i]);
            else newSelected.delete(rowIds[i]);
        }
        const nextSelection = { ...prev, selectedRows: newSelected };
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
        fireSelectionChanged(() => selectedNodes(newSelected));
    }, [fireSelectionChanged, selectedNodes]);
    return {
        selection,
        setSelection,
        selectionRef,
        selectRow,
        selectRows,
        selectAll,
        deselectAll,
    };
}
