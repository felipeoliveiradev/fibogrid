import { useState, useMemo, useRef, useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { FiboGridProps, PaginationState, GridApi } from '../../types';
import { useGridEventSystem } from './useGridEventSystem';

export function useGridPaginationState<T>(props: FiboGridProps<T>) {
    const {
        pagination = false,
        paginationPageSize = 100,
    } = props;

    const [paginationState, setPaginationState] = useState<PaginationState>({
        enabled: pagination,
        pageSize: paginationPageSize,
        currentPage: 0,
        totalRows: 0,
        totalPages: 0,
    });

    return {
        paginationState,
        setPaginationState
    };
}

export interface UseGridPaginationInfoResult {
    paginationState: PaginationState;
    setPaginationState: Dispatch<SetStateAction<PaginationState>>;
    paginationInfo: {
        currentPage: number;
        pageSize: number;
        totalRows: number;
        totalPages: number;
    };
}

export function useGridPaginationInfo<T>(
    props: FiboGridProps<T>,
    paginationState: PaginationState,
    setPaginationState: Dispatch<SetStateAction<PaginationState>>,
    totalRows: number,
    events: ReturnType<typeof useGridEventSystem>,
    apiRef: MutableRefObject<GridApi<T> | undefined>
): UseGridPaginationInfoResult {
    const {
        pagination = false,
    } = props;

    // Calculate generic pagination info based on state and generic totalRows
    const paginationInfo = useMemo(() => {
        if (!pagination) {
            return {
                currentPage: 0,
                pageSize: totalRows,
                totalRows: totalRows,
                totalPages: 1,
            };
        }

        const pageSize = paginationState.pageSize;
        const totalPages = Math.ceil(totalRows / pageSize) || 1;
        const currentPage = Math.min(paginationState.currentPage, totalPages - 1);

        return {
            currentPage,
            pageSize,
            totalRows,
            totalPages,
        };
    }, [pagination, paginationState, totalRows]);

    const finalPaginationState: PaginationState = {
        enabled: pagination,
        pageSize: paginationState.pageSize,
        currentPage: paginationInfo.currentPage,
        totalRows: paginationInfo.totalRows,
        totalPages: paginationInfo.totalPages,
    };

    // Fire Pagination Changed Event
    const prevPaginationState = useRef(finalPaginationState);
    useEffect(() => {
        if (Object.keys(finalPaginationState).length > 0 && apiRef.current) {
            const prev = prevPaginationState.current;
            const curr = finalPaginationState;

            const hasChanged =
                prev.currentPage !== curr.currentPage ||
                prev.pageSize !== curr.pageSize ||
                prev.totalPages !== curr.totalPages ||
                prev.totalRows !== curr.totalRows;

            if (hasChanged) {
                if (events.hasListeners('paginationChanged')) {
                    const isFirstPage = curr.currentPage === 0;
                    const isLastPage = curr.currentPage >= (curr.totalPages - 1);
                    const nextPage = !isLastPage ? curr.currentPage + 1 : null;
                    const prevPage = !isFirstPage ? curr.currentPage - 1 : null;

                    const prevIsFirstPage = prev.currentPage === 0;
                    const prevIsLastPage = prev.currentPage >= (prev.totalPages - 1);
                    const oldNextPage = !prevIsLastPage ? prev.currentPage + 1 : null;
                    const oldPrevPage = !prevIsFirstPage ? prev.currentPage - 1 : null;

                    const fromPageSizeChange = prev.pageSize !== curr.pageSize;

                    events.fireEvent('paginationChanged', {
                        api: apiRef.current,
                        currentPage: curr.currentPage,
                        oldCurrentPage: prev.currentPage,
                        pageSize: curr.pageSize,
                        oldPageSize: prev.pageSize,
                        totalPages: curr.totalPages,
                        totalRows: curr.totalRows,
                        isFirstPage,
                        isLastPage,
                        nextPage,
                        oldNextPage,
                        prevPage,
                        oldPrevPage,
                        fromPageSizeChange
                    });
                }
                prevPaginationState.current = finalPaginationState;
            }
        }
    }, [finalPaginationState, events, apiRef]);

    return {
        paginationState: finalPaginationState,
        setPaginationState,
        paginationInfo
    };
}
