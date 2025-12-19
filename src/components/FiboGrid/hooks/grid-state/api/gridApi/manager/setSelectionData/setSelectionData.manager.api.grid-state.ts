import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
import { UseGridSelectionResult } from '../../../../useGridSelection';
import { UseGridRowsResult } from '../../../../useGridRows';

export function setSelectionDataManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    data: Partial<T>,
    selection: UseGridSelectionResult,
    rows: UseGridRowsResult<T>,
    getRowId: (data: T) => string
): GridManagerBuilder<T> {
    const selectedIds = selection.selection.selectedRows;
    if (selectedIds.size === 0) return managerBuilder;

    selectedIds.forEach(id => {
        // Find current data in rowsRef (source of truth for nodes)
        const node = rows.rowsRef.current.find(r => r.id === id);
        if (node) {
            // Check if we already have a pending update for this row, if so use it as base
            const pending = state.pendingUpdates.get(id);
            const current = pending || node.data;

            const merged = { ...current, ...data };
            state.pendingUpdates.set(id, merged);
        } else {
            console.warn('[Grid Manager] setSelectionData: Row not found for ID:', id);
        }
    });

    return managerBuilder;
}
