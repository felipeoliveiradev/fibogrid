import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function resetRowBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    rowId: string
): GridApiBuilder<T> {
    state.pendingResetRows.push(rowId);
    return builder;
}
