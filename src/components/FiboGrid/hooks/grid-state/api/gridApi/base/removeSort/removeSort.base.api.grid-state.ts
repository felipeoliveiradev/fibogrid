import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function removeSortBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    field: string
): GridApiBuilder<T> {
    state.sortUpdates.push((prev) => prev.filter(s => s.field !== field));
    return builder;
}
