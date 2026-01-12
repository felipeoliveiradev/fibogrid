import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function removeFilterBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    field: string
): GridApiBuilder<T> {
    state.filterUpdates.push((prev) => prev.filter(f => f.field !== field));
    return builder;
}
