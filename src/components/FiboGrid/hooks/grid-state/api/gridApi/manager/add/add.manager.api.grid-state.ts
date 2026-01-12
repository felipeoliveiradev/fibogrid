import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function addManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    builder: any,
    rows: T[]
): GridManagerBuilder<T> {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        console.warn('Grid Manager: add() requires a non-empty array of rows.');
        return managerBuilder;
    }
    state.pendingAdds.push(...rows);
    return managerBuilder;
}
