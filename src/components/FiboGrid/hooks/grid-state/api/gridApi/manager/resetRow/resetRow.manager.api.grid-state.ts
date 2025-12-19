import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function resetRowManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rowId: string
): GridManagerBuilder<T> {
    state.pendingResetRows.push(rowId);
    return managerBuilder;
}
