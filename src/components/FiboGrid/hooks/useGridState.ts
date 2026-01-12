import { useRef } from 'react';
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
  const pagination = useGridPaginationInfo(
    props,
    paginationState,
    setPaginationState,
    rows.totalRows,
    events,
    apiRef
  );
  const grouping = useGrouping({
    rows: rows.displayedRows,
    groupByFields: props.groupByFields,
    splitByField: props.splitByField,
    aggregations: props.groupAggregations,
    getRowId: props.getRowId,
    overrides: rows.overrides
  });
  const isGrouped = props.groupByFields?.length > 0 || !!props.splitByField || grouping.hasChildren;
  const finalDisplayedRows = isGrouped ? grouping.displayRows : rows.displayedRows;
  const finalDisplayedRowsRef = useRef<RowNode<T>[]>(finalDisplayedRows);
  finalDisplayedRowsRef.current = finalDisplayedRows;
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