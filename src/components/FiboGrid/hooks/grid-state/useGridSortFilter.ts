import { useState, useEffect, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { FiboGridProps, SortModel, FilterModel, GridApi } from '../../types';
import { useGridEventSystem } from './useGridEventSystem';
export interface UseGridSortFilterResult {
    sortModel: SortModel[];
    setSortModel: Dispatch<SetStateAction<SortModel[]>>;
    filterModel: FilterModel[];
    setFilterModel: Dispatch<SetStateAction<FilterModel[]>>;
    quickFilter: string;
    setQuickFilter: Dispatch<SetStateAction<string>>;
}
export function useGridSortFilter<T>(
    props: FiboGridProps<T>,
    events: ReturnType<typeof useGridEventSystem>,
    apiRef: MutableRefObject<GridApi<T> | undefined>
): UseGridSortFilterResult {
    const {
        quickFilterText,
    } = props;
    const [sortModel, setSortModel] = useState<SortModel[]>([]);
    const [filterModel, setFilterModel] = useState<FilterModel[]>([]);
    const [internalQuickFilter, setInternalQuickFilter] = useState(quickFilterText || '');
    const prevQuickFilterTextRef = useRef(quickFilterText);
    if (quickFilterText !== undefined && quickFilterText !== prevQuickFilterTextRef.current) {
        prevQuickFilterTextRef.current = quickFilterText;
        setInternalQuickFilter(quickFilterText);
    }
    const prevSortModel = useRef(sortModel);
    useEffect(() => {
        if (prevSortModel.current !== sortModel && apiRef.current) {
            if (events.hasListeners('sortChanged')) {
                const oldSortModel = prevSortModel.current;
                prevSortModel.current = sortModel;
                events.fireEvent('sortChanged', { api: apiRef.current, sortModel, oldSortModel });
            } else {
                prevSortModel.current = sortModel;
            }
        }
    }, [sortModel, events, apiRef]);
    const prevFilterModel = useRef(filterModel);
    useEffect(() => {
        if (prevFilterModel.current !== filterModel && apiRef.current) {
            const oldFilterModel = prevFilterModel.current;
            const hasFilterChangedListeners = events.hasListeners('filterChanged');
            const hasFilterRemovedListeners = events.hasListeners('filterRemoved');
            if (hasFilterChangedListeners || hasFilterRemovedListeners) {
                if (hasFilterRemovedListeners) {
                    if (oldFilterModel.length > filterModel.length) {
                        oldFilterModel.forEach(oldF => {
                            const stillExists = filterModel.find(f => f.field === oldF.field);
                            if (!stillExists) {
                                events.fireEvent('filterRemoved', { api: apiRef.current, filterModel: oldF });
                            }
                        });
                    }
                }
                if (hasFilterChangedListeners) {
                    events.fireEvent('filterChanged', { api: apiRef.current, filterModel, oldFilterModel });
                }
            } else {
                prevFilterModel.current = filterModel;
                return;
            }
            prevFilterModel.current = filterModel;
        }
    }, [filterModel, events, apiRef]);
    const prevQuickFilterRef = useRef(internalQuickFilter);
    useEffect(() => {
        if (prevQuickFilterRef.current !== internalQuickFilter && apiRef.current) {
            if (events.hasListeners('quickFilterChanged')) {
                const oldQuickFilterValue = prevQuickFilterRef.current;
                events.fireEvent('quickFilterChanged', { api: apiRef.current, quickFilterValue: internalQuickFilter, oldQuickFilterValue });
            }
            prevQuickFilterRef.current = internalQuickFilter;
        }
    }, [internalQuickFilter, events, apiRef]);
    return {
        sortModel,
        setSortModel,
        filterModel,
        setFilterModel,
        quickFilter: internalQuickFilter,
        setQuickFilter: setInternalQuickFilter,
    };
}
