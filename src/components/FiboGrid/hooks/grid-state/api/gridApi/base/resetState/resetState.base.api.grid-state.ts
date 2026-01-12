import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function resetStateBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>
): GridApiBuilder<T> {
    state.pendingReset = true;
    return builder;
}
