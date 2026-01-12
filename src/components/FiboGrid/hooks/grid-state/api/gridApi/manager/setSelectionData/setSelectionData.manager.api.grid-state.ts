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
        const node = rows.rowsRef.current.find(r => r.id === id);
        if (node) {
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
