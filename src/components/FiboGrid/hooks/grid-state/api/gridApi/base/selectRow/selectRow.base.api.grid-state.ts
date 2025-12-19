import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function selectRowBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    id: string,
    selected: boolean = true
): GridApiBuilder<T> {
    state.pendingSelection = { ids: [id], selected, mode: 'single' };
    return builder;
}
