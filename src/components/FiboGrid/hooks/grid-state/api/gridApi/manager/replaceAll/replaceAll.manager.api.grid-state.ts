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
        // Use helper for merge logic
        rowsToSet = mergeUnique(currentRows, rows, compareKey as keyof T);
    }

    state.pendingReset = true;
    // Clear other pending states to ensure replaceAll is the definitive source of truth up to this point
    state.pendingUpdates.clear();
    state.pendingRemoves.clear();
    state.pendingUpAdds = [];
    // Reset pendingAdds to ensure previous adds are discarded in favor of replaceAll
    state.pendingAdds = rowsToSet;

    return managerBuilder;
}
