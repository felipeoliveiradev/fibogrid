import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function selectRowsBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    ids: string[],
    selected: boolean = true
): GridApiBuilder<T> {
    state.pendingSelection = { ids, selected, mode: 'multiple' };
    return builder;
}
