import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
import { mergeUnique } from '../../../../../../utils/helpers';
export function replaceAllManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rows: T[],
    currentRows: T[],
    compareKey?: string
): GridManagerBuilder<T> {
    if (!rows || !Array.isArray(rows)) {
        console.warn('Grid Manager: replaceAll() requires an array of rows.');
        return managerBuilder;
    }
    let rowsToSet = [...rows];
    if (compareKey && currentRows && currentRows.length > 0) {
        rowsToSet = mergeUnique(currentRows, rows, compareKey as keyof T);
    }
    state.pendingReset = true;
    state.pendingUpdates.clear();
    state.pendingRemoves.clear();
    state.pendingUpAdds = [];
    state.pendingAdds = rowsToSet;
    return managerBuilder;
}
