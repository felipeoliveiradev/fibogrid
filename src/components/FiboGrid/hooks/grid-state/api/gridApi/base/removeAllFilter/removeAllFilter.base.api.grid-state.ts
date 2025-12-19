import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function removeAllFilterBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>
): GridApiBuilder<T> {
    state.filterUpdates.push(() => []);
    return builder;
}
