import { MutableRefObject } from 'react';
import { GridApi, FiboGridProps } from '../../../types';
import { useGridEventSystem } from '../useGridEventSystem';
import { UseGridSortFilterResult } from '../useGridSortFilter';
import { UseGridPaginationInfoResult } from '../useGridPagination';
import { UseGridColumnsResult } from '../useGridColumns';
import { UseGridRowsResult } from '../useGridRows';
import { UseGridSelectionResult } from '../useGridSelection';
import { UseGridEditingResult } from '../useGridEditing';

export interface UseGridApiContext<T> {
    props: FiboGridProps<T>;
    events: ReturnType<typeof useGridEventSystem>;
    sortFilter: UseGridSortFilterResult;
    pagination: UseGridPaginationInfoResult;
    columns: UseGridColumnsResult<T>;
    rows: UseGridRowsResult<T>;
    selection: UseGridSelectionResult;
    editing: UseGridEditingResult;
    apiRef: MutableRefObject<GridApi<T> | undefined>;
    grouping: import('../../useGrouping').UseGroupingResult<T>;
}
