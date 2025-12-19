import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function deselectAllBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>
): GridApiBuilder<T> {
    state.pendingSelection = { ids: [], selected: false, mode: 'none' };
    return builder;
}
