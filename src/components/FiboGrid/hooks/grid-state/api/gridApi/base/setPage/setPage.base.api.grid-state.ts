import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function setPageBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    page: number
): GridApiBuilder<T> {
    state.pendingPage = page;
    return builder;
}
