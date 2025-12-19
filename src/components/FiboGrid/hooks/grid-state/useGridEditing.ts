import { useState, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { GridApi, EditingCell, RowNode, ProcessedColumn } from '../../types';
import { getValueFromPath } from '../../utils/helpers';
import { useGridEventSystem } from './useGridEventSystem';

export interface UseGridEditingResult {
    editingCell: EditingCell | null;
    setEditingCell: Dispatch<SetStateAction<EditingCell | null>>;
    startEditingCell: (rowId: string, field: string) => void;
    stopEditing: (cancel?: boolean) => void;
}

export function useGridEditing<T>(
    displayedRowsRef: MutableRefObject<RowNode<T>[]>,
    columns: ProcessedColumn<T>[],
    setOverrides: Dispatch<SetStateAction<Record<string, Record<string, any>>>>,
    events: ReturnType<typeof useGridEventSystem>,
    apiRef: MutableRefObject<GridApi<T> | undefined>
): UseGridEditingResult {
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

    const startEditingCell = (rowId: string, field: string) => {
        const row = displayedRowsRef.current.find((r) => r.id === rowId);
        const column = columns.find((c) => c.field === field);

        if (row && column) {
            let isEditable = column.editable;
            if (typeof isEditable === 'function') {
                isEditable = isEditable({
                    value: getValueFromPath(row.data, field),
                    data: row.data,
                    rowIndex: row.rowIndex,
                    colDef: column,
                    column,
                    api: apiRef.current!,
                    rowNode: row
                });
            }

            if (isEditable) {
                if (column.editAction) {
                    const update = (newValue: any) => {
                        const oldValue = getValueFromPath(row.data, field);
                        setOverrides((prev) => {
                            const next = { ...prev };
                            next[rowId] = { ...(next[rowId] || {}), [field]: newValue };
                            return next;
                        });

                        if (apiRef.current) {
                            events.fireEvent('cellValueChanged', {
                                rowNode: row,
                                column,
                                field,
                                oldValue,
                                newValue,
                                api: apiRef.current
                            });
                        }
                    };

                    const stopEditing = () => {
                        // No-op for action mode as we don't hold state
                    };

                    column.editAction({
                        value: getValueFromPath(row.data, field),
                        data: row.data,
                        rowIndex: row.rowIndex,
                        colDef: column,
                        column,
                        api: apiRef.current!,
                        rowNode: row,
                        update,
                        stopEditing
                    });
                    // For 'action' type, we just return to intercept standard editing.
                    // If no editAction is defined but cellEditor is 'action', it effectively disables inline edit.
                    return;
                }

                const value = getValueFromPath(row.data, field);
                setEditingCell({ rowId, field, value, originalValue: value });
            }
        }
    };

    const stopEditing = (cancel = false) => {
        setEditingCell((current) => {
            if (!cancel && current) {
                setOverrides((prev) => {
                    const next = { ...prev };
                    next[current.rowId] = { ...(next[current.rowId] || {}), [current.field]: current.value };
                    return next;
                });

                // Fire cellValueChanged for UI edits
                const rowNode = displayedRowsRef.current.find(r => r.id === current.rowId);
                const column = columns.find(c => c.field === current.field);

                if (rowNode && column && apiRef.current) {
                    events.fireEvent('cellValueChanged', {
                        rowNode,
                        column,
                        field: current.field,
                        oldValue: current.originalValue,
                        newValue: current.value,
                        api: apiRef.current
                    });
                }
            }
            return null;
        });
    };

    return {
        editingCell,
        setEditingCell,
        startEditingCell,
        stopEditing,
    };
}
