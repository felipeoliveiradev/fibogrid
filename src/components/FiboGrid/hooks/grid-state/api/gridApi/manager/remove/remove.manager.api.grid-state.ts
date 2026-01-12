import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function removeManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    idsOrValues: string[],
    currentRows: T[],
    matchKey?: string
): GridManagerBuilder<T> {
    if (!idsOrValues || !Array.isArray(idsOrValues) || idsOrValues.length === 0) {
        console.warn('Grid Manager: remove() requires a non-empty array of IDs or values.');
        return managerBuilder;
    }
    if (matchKey) {
        const valuesSet = new Set(idsOrValues.map(String));
        const rowsToRemove = currentRows.filter(row => {
            const val = (row as any)[matchKey];
            return valuesSet.has(String(val));
        });
        rowsToRemove.forEach(row => {
            const id = (row as any).id;
            if (id) state.pendingRemoves.add(String(id));
        });
    } else {
        idsOrValues.forEach(id => state.pendingRemoves.add(String(id)));
    }
    return managerBuilder;
}
