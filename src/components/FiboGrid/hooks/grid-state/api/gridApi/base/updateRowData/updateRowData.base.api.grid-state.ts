import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function updateRowDataBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    updates: { add?: T[]; update?: T[]; remove?: T[] },
    getRowId: (data: T) => string
): GridApiBuilder<T> {
    if (updates.add) {
        state.pendingAdds.push(...updates.add);
    }
    if (updates.update) {
        updates.update.forEach(row => {
            const id = getRowId ? getRowId(row) : (row as any).id;
            if (id !== undefined && id !== null) {
                state.pendingUpdates.set(String(id), row);
            } else {
                console.warn('Grid API: updateRowData update failed for row without ID:', row);
            }
        });
    }
    if (updates.remove) {
        updates.remove.forEach(row => {
            const id = getRowId ? getRowId(row) : (row as any).id;
            if (id !== undefined && id !== null) {
                state.pendingRemoves.add(String(id));
            } else {
                console.warn('Grid API: updateRowData remove failed for row without ID:', row);
            }
        });
    }
    return builder;
}
