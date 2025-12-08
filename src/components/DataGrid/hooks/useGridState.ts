import { useState, useCallback, useMemo, useRef } from 'react';
import {
  RowNode,
  ColumnDef,
  ProcessedColumn,
  SortModel,
  FilterModel,
  SelectionState,
  PaginationState,
  EditingCell,
  GridApi,
  DataGridProps,
} from '../types';
import {
  createRowNode,
  processColumns,
  sortRows,
  filterRows,
  exportToCsv,
  copyToClipboard,
  setValueAtPath,
} from '../utils/helpers';

export function useGridState<T>(props: DataGridProps<T>, containerWidth: number) {
  const {
    rowData,
    columnDefs,
    getRowId,
    defaultColDef,
    pagination = false,
    paginationPageSize = 100,
    rowSelection,
    quickFilterText,
  } = props;

  // State - consolidated to reduce re-renders
  const [sortModel, setSortModel] = useState<SortModel[]>([]);
  const [filterModel, setFilterModel] = useState<FilterModel[]>([]);
  const [selection, setSelection] = useState<SelectionState>({
    selectedRows: new Set(),
    lastSelectedIndex: null,
    anchorIndex: null,
  });
  const [paginationState, setPaginationState] = useState<PaginationState>({
    enabled: pagination,
    pageSize: paginationPageSize,
    currentPage: 0,
    totalRows: 0,
    totalPages: 0,
  });
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columnDefs.map((c) => c.field)
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left' | 'right' | null>>({});
  const [internalQuickFilter, setInternalQuickFilter] = useState(quickFilterText || '');

  // Refs for stable callbacks
  const rowsRef = useRef<RowNode<T>[]>([]);
  const displayedRowsRef = useRef<RowNode<T>[]>([]);

  // Process columns - memoized
  const columns = useMemo(() => {
    const orderedDefs = columnOrder
      .map((field) => columnDefs.find((c) => c.field === field))
      .filter(Boolean) as ColumnDef<T>[];

    columnDefs.forEach((col) => {
      if (!columnOrder.includes(col.field)) {
        orderedDefs.push(col);
      }
    });

    const processed = processColumns(
      orderedDefs.map((col) => {
        const pinnedState = pinnedColumns[col.field];
        const pinned = pinnedState !== undefined ? pinnedState : col.pinned;
        
        return {
          ...col,
          width: columnWidths[col.field] ?? col.width,
          hide: hiddenColumns.has(col.field) || col.hide,
          pinned: pinned || undefined,
        };
      }),
      containerWidth,
      defaultColDef
    );

    const leftPinned = processed.filter((c) => c.pinned === 'left');
    const center = processed.filter((c) => !c.pinned);
    const rightPinned = processed.filter((c) => c.pinned === 'right');

    return [...leftPinned, ...center, ...rightPinned];
  }, [columnDefs, columnOrder, columnWidths, hiddenColumns, pinnedColumns, containerWidth, defaultColDef]);

  // Create row nodes - ultra-optimized with pre-allocation
  const rows = useMemo(() => {
    const len = rowData.length;
    const result: RowNode<T>[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const data = rowData[i];
      result[i] = {
        id: getRowId ? getRowId(data) : `row-${i}`,
        data,
        rowIndex: i,
        selected: false,
        expanded: false,
        level: 0,
      };
    }
    return result;
  }, [rowData, getRowId]);

  // Update refs synchronously
  rowsRef.current = rows;

  // Filter rows - ultra-optimized
  const filteredRows = useMemo(() => {
    const quickFilter = quickFilterText || internalQuickFilter;
    
    // Fast path - no filters
    if (filterModel.length === 0 && !quickFilter) {
      return rows;
    }

    // Use optimized filter function
    return filterRows(rows, filterModel, columns, quickFilter);
  }, [rows, filterModel, columns, quickFilterText, internalQuickFilter]);

  // Sort rows - avoid rowIndex reassignment when possible
  const sortedRows = useMemo(() => {
    if (sortModel.length === 0) {
      // No sort - just ensure rowIndex is correct
      let needsUpdate = false;
      for (let i = 0; i < filteredRows.length; i++) {
        if (filteredRows[i].rowIndex !== i) {
          needsUpdate = true;
          break;
        }
      }
      if (!needsUpdate) return filteredRows;
      
      const len = filteredRows.length;
      const result: RowNode<T>[] = new Array(len);
      for (let i = 0; i < len; i++) {
        const row = filteredRows[i];
        result[i] = { ...row, rowIndex: i };
      }
      return result;
    }
    
    // Sort required
    const sorted = sortRows(filteredRows, sortModel, columns);
    const len = sorted.length;
    const result: RowNode<T>[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const row = sorted[i];
      result[i] = row.rowIndex === i ? row : { ...row, rowIndex: i };
    }
    return result;
  }, [filteredRows, sortModel, columns]);

  // Paginate rows - optimized
  const { displayedRows, paginationInfo } = useMemo(() => {
    if (!pagination) {
      return {
        displayedRows: sortedRows,
        paginationInfo: {
          currentPage: 0,
          pageSize: sortedRows.length,
          totalRows: sortedRows.length,
          totalPages: 1,
        },
      };
    }

    const totalRows = sortedRows.length;
    const pageSize = paginationState.pageSize;
    const totalPages = Math.ceil(totalRows / pageSize) || 1;
    const currentPage = Math.min(paginationState.currentPage, totalPages - 1);
    const start = currentPage * pageSize;
    const paginatedRows = sortedRows.slice(start, start + pageSize);

    return {
      displayedRows: paginatedRows,
      paginationInfo: {
        currentPage,
        pageSize,
        totalRows,
        totalPages,
      },
    };
  }, [sortedRows, pagination, paginationState.currentPage, paginationState.pageSize]);

  // Update displayed rows ref synchronously
  displayedRowsRef.current = displayedRows;

  // Selection handlers - stable callbacks
  const selectRow = useCallback(
    (rowId: string, selected: boolean, shift = false, ctrl = false) => {
      if (!rowSelection) return;

      setSelection((prev) => {
        const newSelected = new Set(prev.selectedRows);
        const rowIndex = displayedRowsRef.current.findIndex((r) => r.id === rowId);

        if (rowSelection === 'single') {
          newSelected.clear();
          if (selected) newSelected.add(rowId);
        } else {
          if (shift && prev.anchorIndex !== null) {
            const start = Math.min(prev.anchorIndex, rowIndex);
            const end = Math.max(prev.anchorIndex, rowIndex);
            for (let i = start; i <= end; i++) {
              if (displayedRowsRef.current[i]) {
                newSelected.add(displayedRowsRef.current[i].id);
              }
            }
          } else {
            if (newSelected.has(rowId)) {
              newSelected.delete(rowId);
            } else {
              newSelected.add(rowId);
            }
          }
        }

        return {
          selectedRows: newSelected,
          lastSelectedIndex: rowIndex,
          anchorIndex: shift ? prev.anchorIndex : rowIndex,
        };
      });
    },
    [rowSelection]
  );

  const selectAll = useCallback(() => {
    if (rowSelection !== 'multiple') return;
    setSelection((prev) => ({
      ...prev,
      selectedRows: new Set(displayedRowsRef.current.map((r) => r.id)),
    }));
  }, [rowSelection]);

  const deselectAll = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      selectedRows: new Set(),
    }));
  }, []);

  // API object - memoized with stable references
  const api = useMemo((): GridApi<T> => ({
    getRowData: () => rowData,
    setRowData: () => {}, // Read-only in this implementation
    updateRowData: () => {},
    getRowNode: (id) => rowsRef.current.find((r) => r.id === id) || null,
    forEachNode: (callback) => rowsRef.current.forEach(callback),
    getDisplayedRowCount: () => displayedRowsRef.current.length,
    getDisplayedRowAtIndex: (index) => displayedRowsRef.current[index] || null,
    getDisplayedRows: () => displayedRowsRef.current,

    getSelectedRows: () => displayedRowsRef.current.filter((r) => selection.selectedRows.has(r.id)),
    getSelectedNodes: () => displayedRowsRef.current.filter((r) => selection.selectedRows.has(r.id)),
    selectAll,
    deselectAll,
    selectRow: (id, selected = true) => selectRow(id, selected),
    selectRows: (rowIds, selected = true) => {
      setSelection((prev) => {
        const newSelected = new Set(prev.selectedRows);
        rowIds.forEach((id) => {
          if (selected) newSelected.add(id);
          else newSelected.delete(id);
        });
        return { ...prev, selectedRows: newSelected };
      });
    },

    getColumnDefs: () => columnDefs,
    setColumnVisible: (field, visible) => {
      setHiddenColumns((prev) => {
        const next = new Set(prev);
        if (visible) next.delete(field);
        else next.add(field);
        return next;
      });
    },
    setColumnPinned: (field, pinned) => {
      setPinnedColumns((prev) => ({ ...prev, [field]: pinned }));
    },
    moveColumn: (fromIndex, toIndex) => {
      setColumnOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    resizeColumn: (field, width) => {
      setColumnWidths((prev) => ({ ...prev, [field]: width }));
    },
    autoSizeColumn: () => {},
    autoSizeAllColumns: () => {},

    setPage: (page) => {
      setPaginationState((prev) => ({
        ...prev,
        currentPage: Math.max(0, Math.min(page, prev.totalPages - 1)),
      }));
    },
    setPageSize: (size) => {
      setPaginationState((prev) => ({
        ...prev,
        pageSize: size,
        currentPage: 0,
      }));
    },
    nextPage: () => {
      setPaginationState((prev) => ({
        ...prev,
        currentPage: Math.min(prev.currentPage + 1, prev.totalPages - 1),
      }));
    },
    previousPage: () => {
      setPaginationState((prev) => ({
        ...prev,
        currentPage: Math.max(prev.currentPage - 1, 0),
      }));
    },

    setSortModel: (model) => setSortModel(model),
    getSortModel: () => sortModel,
    setFilterModel: (model) => setFilterModel(model),
    getFilterModel: () => filterModel,
    setQuickFilter: (text) => setInternalQuickFilter(text),

    startEditingCell: (rowId, field) => {
      const row = displayedRowsRef.current.find((r) => r.id === rowId);
      if (row) {
        const value = (row.data as any)[field];
        setEditingCell({ rowId, field, value, originalValue: value });
      }
    },
    stopEditing: (cancel = false) => {
      setEditingCell(null);
    },

    ensureRowVisible: () => {},
    ensureColumnVisible: () => {},
    scrollTo: () => {},

    exportToCsv: (params) => {
      const rowsToExport = params?.onlySelected
        ? displayedRowsRef.current.filter((r) => selection.selectedRows.has(r.id))
        : displayedRowsRef.current;
      exportToCsv(rowsToExport, columns, {
        fileName: params?.fileName,
        skipHeader: params?.skipHeader,
      });
    },
    copyToClipboard: async (includeHeaders = true) => {
      const selectedRows = displayedRowsRef.current.filter((r) =>
        selection.selectedRows.has(r.id)
      );
      const rowsToCopy = selectedRows.length > 0 ? selectedRows : displayedRowsRef.current;
      await copyToClipboard(rowsToCopy, columns, includeHeaders);
    },

    refreshCells: () => {},
    redrawRows: () => {},
  }), [rowData, columnDefs, columns, sortModel, filterModel, selection, selectAll, deselectAll, selectRow]);

  const setColumnPinned = useCallback((field: string, pinned: 'left' | 'right' | null) => {
    setPinnedColumns((prev) => ({ ...prev, [field]: pinned }));
  }, []);

  return {
    rows,
    displayedRows,
    columns,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    selection,
    selectRow,
    selectAll,
    deselectAll,
    paginationState,
    setPaginationState,
    editingCell,
    setEditingCell,
    api,
    setColumnOrder,
    setColumnWidths,
    setColumnPinned,
  };
}