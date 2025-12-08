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
      orderedDefs.map((col) => {
        // Get pinned state - check if it's explicitly set in state, otherwise use default
        const pinnedState = pinnedColumns[col.field];
        const pinned = pinnedState !== undefined ? pinnedState : col.pinned;
        
        return {
          ...col,
          width: columnWidths[col.field] ?? col.width,
          hide: hiddenColumns.has(col.field) || col.hide,
          pinned: pinned || undefined, // Convert null to undefined
        };
      }),
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

  // Update refs
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // Filter rows
  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Apply column filters
    if (filterModel.length > 0) {
      result = filterRows(result, filterModel, columns);
    }

    // Apply quick filter
    const quickFilter = quickFilterText || internalQuickFilter;
    if (quickFilter) {
      const searchLower = quickFilter.toLowerCase();
      result = result.filter((row) => {
        return columns.some((col) => {
          const value = (row.data as any)[col.field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    return result;
  }, [rows, filterModel, columns, quickFilterText, internalQuickFilter]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (sortModel.length === 0) return filteredRows;
    return sortRows(filteredRows, sortModel, columns);
  }, [filteredRows, sortModel, columns]);

  // Paginate rows
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

  // Update pagination state when data changes
  useEffect(() => {
    setPaginationState((prev) => ({
      ...prev,
      totalRows: paginationInfo.totalRows,
      totalPages: paginationInfo.totalPages,
      currentPage: Math.min(prev.currentPage, Math.max(0, paginationInfo.totalPages - 1)),
    }));
  }, [paginationInfo.totalRows, paginationInfo.totalPages]);

  // Update displayed rows ref
  useEffect(() => {
    displayedRowsRef.current = displayedRows;
  }, [displayedRows]);

  // Selection handlers
  const selectRow = useCallback(
    (rowId: string, selected: boolean, shift = false, ctrl = false) => {
      if (!rowSelection) return;

      setSelection((prev) => {
        const newSelected = new Set(prev.selectedRows);
        const rowIndex = displayedRows.findIndex((r) => r.id === rowId);

        if (rowSelection === 'single') {
          newSelected.clear();
          if (selected) {
            newSelected.add(rowId);
          }
        } else {
          // Multiple selection
          if (shift && prev.anchorIndex !== null) {
            // Range selection - add all rows in range
            const start = Math.min(prev.anchorIndex, rowIndex);
            const end = Math.max(prev.anchorIndex, rowIndex);
            for (let i = start; i <= end; i++) {
              if (displayedRows[i]) {
                newSelected.add(displayedRows[i].id);
              }
            }
          } else {
            // Toggle the clicked row (like checkboxes)
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
    [rowSelection, displayedRows]
  );

  const selectAll = useCallback(() => {
    if (rowSelection !== 'multiple') return;
    setSelection((prev) => ({
      ...prev,
      selectedRows: new Set(displayedRows.map((r) => r.id)),
    }));
  }, [rowSelection, displayedRows]);

  const deselectAll = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      selectedRows: new Set(),
    }));
  }, []);

  // API object
  const api = useMemo((): GridApi<T> => ({
    // Data
    getRowData: () => localRowData,
    setRowData: (data) => setLocalRowData(data),
    updateRowData: ({ add, remove, update }) => {
      setLocalRowData((prev) => {
        let newData = [...prev];

        if (remove) {
          const removeIds = new Set(
            remove.map((d, i) => getRowId?.(d) ?? `row-${i}`)
          );
          newData = newData.filter(
            (d, i) => !removeIds.has(getRowId?.(d) ?? `row-${i}`)
          );
        }

        if (update) {
          update.forEach((updateData) => {
            const updateId = getRowId?.(updateData);
            const index = newData.findIndex(
              (d, i) => (getRowId?.(d) ?? `row-${i}`) === updateId
            );
            if (index >= 0) {
              newData[index] = { ...newData[index], ...updateData };
            }
          });
        }

        if (add) {
          newData = [...newData, ...add];
        }

        return newData;
      });
    },
    getRowNode: (id) => rowsRef.current.find((r) => r.id === id) || null,
    forEachNode: (callback) => rowsRef.current.forEach(callback),
    getDisplayedRowCount: () => displayedRowsRef.current.length,
    getDisplayedRowAtIndex: (index) => displayedRowsRef.current[index] || null,
    getDisplayedRows: () => displayedRowsRef.current,

    // Selection
    getSelectedRows: () => displayedRowsRef.current.filter((r) => selection.selectedRows.has(r.id)),
    getSelectedNodes: () => displayedRowsRef.current.filter((r) => selection.selectedRows.has(r.id)),
    selectAll: () => selectAll(),
    deselectAll: () => deselectAll(),
    selectRow: (id, selected = true) => selectRow(id, selected),
    selectRows: (rowIds, selected = true) => {
      setSelection((prev) => {
        const newSelected = new Set(prev.selectedRows);
        rowIds.forEach((id) => {
          if (selected) {
            newSelected.add(id);
          } else {
            newSelected.delete(id);
          }
        });
        return { ...prev, selectedRows: newSelected };
      });
    },

    // Columns
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
    autoSizeColumn: () => {},
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

    // Sort & Filter
    setSortModel: (model) => setSortModel(model),
    getSortModel: () => sortModel,
    setFilterModel: (model) => setFilterModel(model),
    getFilterModel: () => filterModel,
    setQuickFilter: (text) => setInternalQuickFilter(text),

    // Editing
    startEditingCell: (rowId, field) => {
      const row = displayedRowsRef.current.find((r) => r.id === rowId);
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
