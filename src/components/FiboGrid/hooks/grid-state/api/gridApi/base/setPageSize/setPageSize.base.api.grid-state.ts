import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function setPageSizeBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    size: number
): GridApiBuilder<T> {
    state.pendingPageSize = size;
    return builder;
}
