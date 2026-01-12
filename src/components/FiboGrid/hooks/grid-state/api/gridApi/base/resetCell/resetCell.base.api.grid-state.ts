import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function resetCellBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    rowId: string,
    field: string
): GridApiBuilder<T> {
    state.pendingResetCells.push({ rowId, field });
    return builder;
}
