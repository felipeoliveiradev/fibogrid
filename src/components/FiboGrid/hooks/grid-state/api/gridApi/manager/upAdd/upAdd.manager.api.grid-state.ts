import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function upAddManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rows: T[]
): GridManagerBuilder<T> {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        console.warn('Grid Manager: upAdd() requires a non-empty array of rows.');
        return managerBuilder;
    }
    state.pendingUpAdds.push(...rows);
    return managerBuilder;
}
