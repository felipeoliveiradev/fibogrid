import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function selectAllBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>
): GridApiBuilder<T> {
    state.pendingSelection = { ids: [], selected: true, mode: 'all' };
    return builder;
}
