import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function resetCellManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rowId: string,
    field: string
): GridManagerBuilder<T> {
    state.pendingResetCells.push({ rowId, field });
    return managerBuilder;
}
