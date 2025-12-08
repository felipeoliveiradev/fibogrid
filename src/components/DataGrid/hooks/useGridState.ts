import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  paginateRows,
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

  // State
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
  const [localRowData, setLocalRowData] = useState<T[]>(rowData);

  // Refs for API callbacks
  const rowsRef = useRef<RowNode<T>[]>([]);
  const displayedRowsRef = useRef<RowNode<T>[]>([]);

  // Update local data when props change
  useEffect(() => {
    setLocalRowData(rowData);
  }, [rowData]);

  // Process columns
  const columns = useMemo(() => {
    const orderedDefs = columnOrder
      .map((field) => columnDefs.find((c) => c.field === field))
      .filter(Boolean) as ColumnDef<T>[];

    // Add any new columns not in order
    columnDefs.forEach((col) => {
      if (!columnOrder.includes(col.field)) {
        orderedDefs.push(col);
      }
    });

    const processed = processColumns(
      orderedDefs.map((col) => ({
        ...col,
        width: columnWidths[col.field] ?? col.width,
        hide: hiddenColumns.has(col.field) || col.hide,
        pinned: pinnedColumns[col.field] ?? col.pinned,
      })),
      containerWidth,
      defaultColDef
    );

    // Sort by pinned status
    const leftPinned = processed.filter((c) => c.pinned === 'left');
    const center = processed.filter((c) => !c.pinned);
    const rightPinned = processed.filter((c) => c.pinned === 'right');

    return [...leftPinned, ...center, ...rightPinned];
  }, [columnDefs, columnOrder, columnWidths, hiddenColumns, pinnedColumns, containerWidth, defaultColDef]);

  // Create row nodes
  const rows = useMemo(() => {
    return localRowData.map((data, index) => createRowNode(data, index, getRowId));
  }, [localRowData, getRowId]);

  // Apply sorting and filtering
  const processedRows = useMemo(() => {
    let result = rows;
    result = filterRows(result, filterModel, columns, internalQuickFilter || quickFilterText);
    result = sortRows(result, sortModel, columns);
    return result;
  }, [rows, filterModel, sortModel, columns, internalQuickFilter, quickFilterText]);

  // Apply pagination
  const displayedRows = useMemo(() => {
    if (!pagination) {
      return processedRows;
    }
    return paginateRows(processedRows, paginationState.currentPage, paginationState.pageSize);
  }, [processedRows, pagination, paginationState.currentPage, paginationState.pageSize]);

  // Update pagination state
  useEffect(() => {
    const totalRows = processedRows.length;
    const totalPages = Math.ceil(totalRows / paginationState.pageSize);
    setPaginationState((prev) => ({
      ...prev,
      totalRows,
      totalPages,
      currentPage: Math.min(prev.currentPage, Math.max(0, totalPages - 1)),
    }));
  }, [processedRows.length, paginationState.pageSize]);

  // Update refs
  useEffect(() => {
    rowsRef.current = rows;
    displayedRowsRef.current = displayedRows;
  }, [rows, displayedRows]);

  // Selection handlers
  const selectRow = useCallback(
    (id: string, selected = true, shiftKey = false, ctrlKey = false) => {
      setSelection((prev) => {
        const newSelected = new Set(prev.selectedRows);
        const rowIndex = displayedRows.findIndex((r) => r.id === id);

        if (rowSelection === 'single') {
          newSelected.clear();
          if (selected) {
            newSelected.add(id);
          }
          return {
            selectedRows: newSelected,
            lastSelectedIndex: rowIndex,
            anchorIndex: rowIndex,
          };
        }

        if (shiftKey && prev.anchorIndex !== null && rowSelection === 'multiple') {
          // Range selection
          const start = Math.min(prev.anchorIndex, rowIndex);
          const end = Math.max(prev.anchorIndex, rowIndex);
          for (let i = start; i <= end; i++) {
            newSelected.add(displayedRows[i].id);
          }
        } else if (ctrlKey && rowSelection === 'multiple') {
          // Toggle selection
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
        } else {
          // Single click
          if (!ctrlKey) {
            newSelected.clear();
          }
          if (selected) {
            newSelected.add(id);
          }
        }

        return {
          selectedRows: newSelected,
          lastSelectedIndex: rowIndex,
          anchorIndex: shiftKey ? prev.anchorIndex : rowIndex,
        };
      });
    },
    [displayedRows, rowSelection]
  );

  const selectAll = useCallback(() => {
    if (rowSelection !== 'multiple') return;
    setSelection({
      selectedRows: new Set(displayedRows.map((r) => r.id)),
      lastSelectedIndex: displayedRows.length - 1,
      anchorIndex: 0,
    });
  }, [displayedRows, rowSelection]);

  const deselectAll = useCallback(() => {
    setSelection({
      selectedRows: new Set(),
      lastSelectedIndex: null,
      anchorIndex: null,
    });
  }, []);

  // API implementation
  const api = useMemo<GridApi<T>>(() => ({
    // Data
    setRowData: (data) => setLocalRowData(data),
    getRowData: () => localRowData,
    getDisplayedRows: () => displayedRowsRef.current,
    getRowNode: (id) => rowsRef.current.find((r) => r.id === id),
    updateRowData: ({ add, update, remove }) => {
      setLocalRowData((prev) => {
        let newData = [...prev];
        
        if (remove) {
          const removeIds = new Set(remove.map((d, i) => getRowId?.(d) ?? `row-${i}`));
          newData = newData.filter((d, i) => !removeIds.has(getRowId?.(d) ?? `row-${i}`));
        }
        
        if (update) {
          const updateMap = new Map(update.map((d, i) => [getRowId?.(d) ?? `row-${i}`, d]));
          newData = newData.map((d, i) => {
            const id = getRowId?.(d) ?? `row-${i}`;
            return updateMap.get(id) ?? d;
          });
        }
        
        if (add) {
          newData = [...newData, ...add];
        }
        
        return newData;
      });
    },

    // Selection
    selectAll,
    deselectAll,
    selectRow: (id, selected = true) => selectRow(id, selected),
    selectRows: (ids, selected = true) => {
      setSelection((prev) => {
        const newSelected = new Set(prev.selectedRows);
        ids.forEach((id) => {
          if (selected) {
            newSelected.add(id);
          } else {
            newSelected.delete(id);
          }
        });
        return { ...prev, selectedRows: newSelected };
      });
    },
    getSelectedRows: () => displayedRowsRef.current.filter((r) => selection.selectedRows.has(r.id)),
    getSelectedRowIds: () => Array.from(selection.selectedRows),

    // Sorting
    setSortModel: (model) => setSortModel(model),
    getSortModel: () => sortModel,

    // Filtering
    setFilterModel: (model) => setFilterModel(model),
    getFilterModel: () => filterModel,
    setQuickFilter: (text) => setInternalQuickFilter(text),

    // Columns
    setColumnDefs: () => {}, // Controlled by props
    getColumnDefs: () => columnDefs,
    setColumnVisible: (field, visible) => {
      setHiddenColumns((prev) => {
        const next = new Set(prev);
        if (visible) {
          next.delete(field);
        } else {
          next.add(field);
        }
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
    autoSizeColumn: () => {}, // Would need DOM measurement
    autoSizeAllColumns: () => {},

    // Pagination
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
    firstPage: () => {
      setPaginationState((prev) => ({ ...prev, currentPage: 0 }));
    },
    lastPage: () => {
      setPaginationState((prev) => ({
        ...prev,
        currentPage: prev.totalPages - 1,
      }));
    },

    // Editing
    startEditingCell: (rowId, field) => {
      const row = rowsRef.current.find((r) => r.id === rowId);
      if (row) {
        const value = (row.data as any)[field];
        setEditingCell({
          rowId,
          field,
          value,
          originalValue: value,
        });
      }
    },
    stopEditing: (cancel = false) => {
      if (editingCell && !cancel) {
        setLocalRowData((prev) => {
          return prev.map((data, index) => {
            const id = getRowId?.(data) ?? `row-${index}`;
            if (id === editingCell.rowId) {
              return setValueAtPath(data, editingCell.field, editingCell.value);
            }
            return data;
          });
        });
      }
      setEditingCell(null);
    },

    // Scroll
    ensureRowVisible: () => {},
    ensureColumnVisible: () => {},
    scrollTo: () => {},

    // Export
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

    // Refresh
    refreshCells: () => {},
    redrawRows: () => {},
  }), [
    localRowData,
    columnDefs,
    columns,
    sortModel,
    filterModel,
    selection,
    editingCell,
    selectAll,
    deselectAll,
    selectRow,
    getRowId,
  ]);

  // Column pin handler
  const setColumnPinned = useCallback((field: string, pinned: 'left' | 'right' | null) => {
    setPinnedColumns((prev) => ({
      ...prev,
      [field]: pinned,
    }));
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
