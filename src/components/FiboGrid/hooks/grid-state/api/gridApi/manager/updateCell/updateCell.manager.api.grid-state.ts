import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function updateCellManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rowId: string,
    field: string,
    value: any
): GridManagerBuilder<T> {
    if (!rowId) {
        console.warn('Grid Manager: updateCell() requires a valid rowId.');
        return managerBuilder;
    }
    const sId = String(rowId);
    const existingUpdate = state.pendingUpdates.get(sId) || {};
    state.pendingUpdates.set(sId, {
        ...existingUpdate,
        [field]: value
    });
    return managerBuilder;
}
