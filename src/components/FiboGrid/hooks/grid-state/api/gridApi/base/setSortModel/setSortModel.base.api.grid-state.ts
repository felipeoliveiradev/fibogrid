import { GridApiBuilder, SortModel } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function setSortModelBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    model: SortModel[]
): GridApiBuilder<T> {
    state.sortUpdates.push(() => model);
    return builder;
}
