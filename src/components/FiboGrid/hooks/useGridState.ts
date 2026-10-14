import { useEffect, useRef } from 'react';
import { FiboGridProps, GridApi, RowNode } from '../types';
import {
  useGridEventSystem,
  useGridColumns,
  useGridSortFilter,
  useGridPaginationState,
  useGridPaginationInfo,
  useGridRows,
  useGridSelection,
  useGridEditing,
  useGridApi
} from './grid-state';
import { useGrouping } from './useGrouping';
import { flattenGroupedRows } from '../utils/grouping';
export function useGridState<T>(props: FiboGridProps<T>, containerWidth: number) {
  const events = useGridEventSystem(props.gridId);
  const apiRef = useRef<GridApi<T>>();
  const rowsRef = useRef<RowNode<T>[]>([]);
  const displayedRowsRef = useRef<RowNode<T>[]>([]);
  const columns = useGridColumns(props, containerWidth);
  const sortFilter = useGridSortFilter(props, events, apiRef);
  const { paginationState, setPaginationState } = useGridPaginationState(props);
  const selection = useGridSelection(props, rowsRef, displayedRowsRef, events, apiRef);
  const rows = useGridRows({
    props,
    columns: columns.processedColumns,
    sortModel: sortFilter.sortModel,
    filterModel: sortFilter.filterModel,
    quickFilter: sortFilter.quickFilter,
    paginationState,
    selection: selection.selection,
    rowsRef,
    displayedRowsRef
  });
  useEffect(() => {
    if (!props.infiniteScroll) return;
    setPaginationState((prev) => (prev.currentPage === 0 ? prev : { ...prev, currentPage: 0 }));
  }, [sortFilter.sortModel, sortFilter.filterModel, sortFilter.quickFilter, paginationState.pageSize, props.infiniteScroll, setPaginationState]);
  const isServerDataset = props.paginationMode === 'server' || props.serverSideDataSource != null;
  const grouping = useGrouping({
    rows: isServerDataset ? rows.displayedRows : rows.sortedRows,
    groupByFields: props.groupByFields,
    splitByField: props.splitByField,
    aggregations: props.groupAggregations,
    getRowId: props.getRowId,
    overrides: rows.overrides,
    getChildRows: props.getChildRows,
    skipFullFlatten: !isServerDataset && (props.groupByFields?.length ?? 0) > 0 && Boolean(props.pagination),
  });
  const isGrouped = (props.groupByFields?.length ?? 0) > 0 || !!props.splitByField || grouping.hasChildren;
  const clientGroups = !isServerDataset && grouping.groupByFields.length > 0;
  const finalDisplayedRows = !isGrouped
    ? rows.displayedRows
    : isServerDataset || !props.pagination
      ? grouping.displayRows
      : clientGroups
        ? flattenGroupedRows(
            sliceGroupedPage(grouping.groupedRows, paginationState.pageSize, paginationState.currentPage),
            grouping.expandedGroups,
          )
        : sliceGroupedPage(grouping.displayRows, paginationState.pageSize, paginationState.currentPage);
  displayedRowsRef.current = finalDisplayedRows;
  const finalDisplayedRowsRef = useRef<RowNode<T>[]>(finalDisplayedRows);
  finalDisplayedRowsRef.current = finalDisplayedRows;
  const pagination = useGridPaginationInfo(
    props,
    paginationState,
    setPaginationState,
    clientGroups
      ? grouping.groupedRows.length
      : isGrouped && !isServerDataset
        ? grouping.displayRows.length
        : rows.totalRows,
    events,
    apiRef
  );
  const editing = useGridEditing(finalDisplayedRowsRef, columns.processedColumns, rows.setOverrides, events, apiRef);
  const { api, internalApi } = useGridApi({
    props,
    events,
    sortFilter,
    pagination,
    columns,
    rows,
    selection,
    editing,
    apiRef,
    grouping
  });
  apiRef.current = internalApi;
  return {
    rows: rows.rows,
    allRows: rows.rows,
    displayedRows: rows.displayedRows,
    columns: columns.columns,
    sortModel: sortFilter.sortModel,
    setSortModel: sortFilter.setSortModel,
    filterModel: sortFilter.filterModel,
    setFilterModel: sortFilter.setFilterModel,
    selection: selection.selection,
    selectRow: selection.selectRow,
    selectAll: selection.selectAll,
    deselectAll: selection.deselectAll,
    paginationState: pagination.paginationState,
    setPaginationState: pagination.setPaginationState,
    editingCell: editing.editingCell,
    setEditingCell: editing.setEditingCell,
    api,
    internalApi,
    setColumnOrder: columns.setColumnOrder,
    setColumnWidths: columns.setColumnWidths,
    setColumnPinned: columns.setColumnPinned,
    serverSideLoading: rows.serverSideState.loading,
    hasCustomRowNumber: columns.hasCustomRowNumber,
    hasCustomCheckbox: columns.hasCustomCheckbox,
    quickFilter: sortFilter.quickFilter,
    setQuickFilter: sortFilter.setQuickFilter,
    fireEvent: events.fireEvent,
    grouping,
    finalDisplayedRows
  };
}
function sliceGroupedPage<T>(items: T[], pageSize: number, currentPage: number): T[] {
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const page = Math.min(currentPage, Math.max(totalPages - 1, 0));
  const start = page * pageSize;
  return items.slice(start, start + pageSize);
}