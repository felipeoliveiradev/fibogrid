import { GridApiBuilder, PaginationState } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function setPaginationBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    paginationState: Partial<PaginationState> // Using s as Partial<PaginationState> based on usage
): GridApiBuilder<T> {
    if (paginationState.currentPage !== undefined) state.pendingPage = paginationState.currentPage;
    if (paginationState.pageSize !== undefined) state.pendingPageSize = paginationState.pageSize;
    return builder;
}
