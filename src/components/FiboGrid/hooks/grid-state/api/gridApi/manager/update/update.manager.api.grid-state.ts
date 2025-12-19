import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function updateManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rows: T[],
    getRowId: (data: T) => string,
    idKey?: string
): GridManagerBuilder<T> {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        console.warn('Grid Manager: update() requires a non-empty array of rows.');
        return managerBuilder;
    }
    rows.forEach(row => {
        let id: string | undefined;
        if (idKey) {
            id = (row as any)[idKey];
        } else {
            id = getRowId ? getRowId(row) : (row as any).id;
        }

        if (id !== undefined && id !== null) state.pendingUpdates.set(String(id), row);
        else console.warn('Grid Manager: update() failed for row without ID:', row);
    });
    return managerBuilder;
}
