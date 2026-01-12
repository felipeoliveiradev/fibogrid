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
    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const selectRow = useCallback(
        (rowId: string, selected: boolean, shift = false, ctrl = false) => {
            if (!rowSelection) return;
            const prev = selectionRef.current;
            const newSelected = new Set(prev.selectedRows);
            const rowIndex = displayedRowsRef.current.findIndex((r) => r.id === rowId);
            if (rowSelection === 'single') {
                if (selected) {
                    if (prev.selectedRows.has(rowId) && prev.selectedRows.size === 1) return;
                    newSelected.clear();
                    newSelected.add(rowId);
                } else {
                    if (!prev.selectedRows.has(rowId)) return;
                    newSelected.clear();
                }
            } else {
                if (shift && prev.anchorIndex !== null) {
                    const start = Math.min(prev.anchorIndex, rowIndex);
                    const end = Math.max(prev.anchorIndex, rowIndex);
                    for (let i = start; i <= end; i++) {
                        if (displayedRowsRef.current[i]) {
                            newSelected.add(displayedRowsRef.current[i].id);
                        }
                    }
                } else {
                    if (selected) {
                        if (newSelected.has(rowId)) return;
                        newSelected.add(rowId);
                    } else {
                        if (!newSelected.has(rowId)) return;
                        newSelected.delete(rowId);
                    }
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
            const nextSelection = {
                selectedRows: newSelected,
                lastSelectedIndex: rowIndex,
                anchorIndex: shift ? prev.anchorIndex : rowIndex,
            };
            selectionRef.current = nextSelection;
            setSelection(nextSelection);
            if (apiRef.current) {
                events.fireEvent('selectionChanged', {
                    api: apiRef.current,
                    selectedRows: Array.from(newSelected).map(id => rowsRef.current.find(r => r.id === id)!)
                });
            }
        },
        [rowSelection, events, apiRef, rowsRef, displayedRowsRef]
    );
    const selectAll = useCallback(() => {
        if (rowSelection !== 'multiple') return;
        const allIds = displayedRowsRef.current.map((r) => r.id);
        const prev = selectionRef.current;
        if (prev.selectedRows.size === allIds.length) {
            let allMatch = true;
            for (const id of allIds) {
                if (!prev.selectedRows.has(id)) {
                    allMatch = false;
                    break;
                }
            }
            if (allMatch) return;
        }
        const nextSelection = {
            ...selectionRef.current,
            selectedRows: new Set(allIds),
        };
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
        if (apiRef.current) {
            events.fireEvent('selectionChanged', { api: apiRef.current, selectedRows: displayedRowsRef.current });
        }
    }, [rowSelection, events, apiRef, displayedRowsRef]);
    const deselectAll = useCallback(() => {
        const prev = selectionRef.current;
        if (prev.selectedRows.size === 0) return;
        const nextSelection = {
            ...selectionRef.current,
            selectedRows: new Set<string>(),
        };
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
        if (apiRef.current) {
            events.fireEvent('selectionChanged', { api: apiRef.current, selectedRows: [] });
        }
    }, [setSelection, events, apiRef]);
    const selectRows = useCallback((rowIds: string[], selected: boolean) => {
        const prev = selectionRef.current;
        const newSelected = new Set(prev.selectedRows);
        rowIds.forEach((id) => {
            if (selected) newSelected.add(id);
            else newSelected.delete(id);
        });
        const nextSelection = { ...prev, selectedRows: newSelected };
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
        if (apiRef.current) {
            events.fireEvent('selectionChanged', {
                api: apiRef.current,
                selectedRows: Array.from(newSelected).map(id => rowsRef.current.find(r => r.id === id)!)
            });
        }
    }, [events, apiRef, rowsRef]);
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
