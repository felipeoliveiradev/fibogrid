import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function removeAllSortBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>
): GridApiBuilder<T> {
    state.sortUpdates.push(() => []);
    return builder;
}
