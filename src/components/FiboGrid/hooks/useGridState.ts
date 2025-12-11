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
  FiboGridProps,
  GridApiBuilder,
  ServerSideDataSourceRequest,
} from '../types';
import { useServerSideData } from './useServerSideData';
import {
  createRowNode,
  processColumns,
  sortRows,
  filterRows,
  exportToCsv,
  copyToClipboard,
  getValueFromPath,
  setValueAtPath,
} from '../utils/helpers';
import {
  RowNumberRenderer,
  CheckboxCellRenderer,
  CheckboxHeaderRenderer
} from '../components/SpecialRenderers';

export function useGridState<T>(props: FiboGridProps<T>, containerWidth: number) {
  const {
    rowData,
    columnDefs,
    getRowId,
    defaultColDef,
    pagination = false,
    paginationPageSize = 100,
    rowSelection,
    quickFilterText,
    paginationMode = 'client',
    serverSideDataSource,
  } = props;

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
  const [overrides, setOverrides] = useState<Record<string, Record<string, any>>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columnDefs.map((c) => c.field)
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left' | 'right' | null>>({});
  const [internalQuickFilter, setInternalQuickFilter] = useState(quickFilterText || '');

  const rowsRef = useRef<RowNode<T>[]>([]);
  const displayedRowsRef = useRef<RowNode<T>[]>([]);

  const { processedColumns, hasCustomRowNumber, hasCustomCheckbox } = useMemo(() => {
    let hasRowNumber = false;
    let hasCheckbox = false;

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
        const isRowNumber = col.type === 'rowNumber' || col.field === 'number';
        const isCheckbox = col.type === 'checkbox' || col.field === 'checkbox';

        if (isRowNumber) hasRowNumber = true;
        if (isCheckbox) hasCheckbox = true;

        return {
          ...col,
          width: columnWidths[col.field] ?? col.width,
          hide: hiddenColumns.has(col.field) || col.hide,
          pinned: pinned || undefined,
          cellRenderer: isRowNumber ? RowNumberRenderer : (isCheckbox ? CheckboxCellRenderer : col.cellRenderer),
          headerRenderer: isCheckbox ? CheckboxHeaderRenderer : col.headerRenderer,
          suppressMenu: isRowNumber || isCheckbox ? true : col.suppressMenu,
          sortable: isRowNumber || isCheckbox ? false : col.sortable,
          filterType: isRowNumber || isCheckbox ? undefined : col.filterType,
          resizable: isRowNumber || isCheckbox ? false : col.resizable,
        };
      }),
      containerWidth,
      defaultColDef
    );

    return { processedColumns: processed, hasCustomRowNumber: hasRowNumber, hasCustomCheckbox: hasCheckbox };
  }, [columnDefs, columnOrder, columnWidths, hiddenColumns, pinnedColumns, containerWidth, defaultColDef]);

  const columns = useMemo(() => {
    const sortByPriority = (a: ProcessedColumn<T>, b: ProcessedColumn<T>) => {
      const pA = a.pinnedPriority ?? Number.MAX_SAFE_INTEGER;
      const pB = b.pinnedPriority ?? Number.MAX_SAFE_INTEGER;
      if (pA === pB) return 0;
      return pA - pB;
    };

    const leftPinned = processedColumns.filter((c) => c.pinned === 'left').sort(sortByPriority);
    const center = processedColumns.filter((c) => !c.pinned);
    const rightPinned = processedColumns.filter((c) => c.pinned === 'right').sort(sortByPriority);

    return [...leftPinned, ...center, ...rightPinned];
  }, [processedColumns]);

  useEffect(() => {
    setOverrides({});
  }, [rowData]);


  const { clientFilterModel, serverFilterModel } = useMemo(() => {
    const client: FilterModel[] = [];
    const server: FilterModel[] = [];

    filterModel.forEach((filter) => {
      const col = columnDefs.find((c) => c.field === filter.field);
      if (col?.useInternalFilter) {
        client.push(filter);
      } else {
        server.push(filter);
      }
    });

    return { clientFilterModel: client, serverFilterModel: server };
  }, [filterModel, columnDefs]);

  const serverSideRequest: ServerSideDataSourceRequest = useMemo(() => ({
    page: paginationState.currentPage,
    pageSize: paginationState.pageSize,
    sortModel,
    filterModel: serverFilterModel,
    quickFilterText: quickFilterText || internalQuickFilter,
  }), [paginationState.currentPage, paginationState.pageSize, sortModel, serverFilterModel, quickFilterText, internalQuickFilter]);

  const serverSideState = useServerSideData(
    paginationMode === 'server',
    serverSideDataSource,
    serverSideRequest
  );

  const rows = useMemo(() => {
    const sourceData = paginationMode === 'server' ? serverSideState.data : rowData;
    const len = sourceData.length;
    const result: RowNode<T>[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const raw = sourceData[i];
      const rowId = getRowId ? getRowId(raw) : `row-${i}`;

      let data = raw;
      if (overrides[rowId]) {
        // Apply overrides, handling nested paths correctly
        Object.entries(overrides[rowId]).forEach(([field, value]) => {
          data = setValueAtPath(data, field, value);
        });
      }

      result[i] = {
        id: rowId,
        data,
        rowIndex: i,
        selected: false,
        expanded: false,
        level: 0,
      };
    }
    return result;
  }, [rowData, serverSideState.data, paginationMode, getRowId, overrides]);

  rowsRef.current = rows;

  const filteredRows = useMemo(() => {

    if (paginationMode === 'server') {
      // Even in server mode, apply client-side filters if they exist (useInternalFilter: true)
      if (clientFilterModel.length > 0) {
        return filterRows(rows, clientFilterModel, columns, '');
      }
      return rows;
    }

    const quickFilter = quickFilterText || internalQuickFilter;

    if (filterModel.length === 0 && !quickFilter) {
      return rows;
    }

    return filterRows(rows, filterModel, columns, quickFilter);
  }, [rows, filterModel, columns, quickFilterText, internalQuickFilter, paginationMode]);

  const sortedRows = useMemo(() => {

    if (paginationMode === 'server') {
      return filteredRows;
    }

    if (sortModel.length === 0) {

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

    const sorted = sortRows(filteredRows, sortModel, columns);
    const len = sorted.length;
    const result: RowNode<T>[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const row = sorted[i];
      result[i] = row.rowIndex === i ? row : { ...row, rowIndex: i };
    }
    return result;
  }, [filteredRows, sortModel, columns, paginationMode]);

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

    if (paginationMode === 'server') {
      const pageSize = paginationState.pageSize;
      const totalPages = Math.ceil(serverSideState.totalRows / pageSize) || 1;
      const currentPage = Math.min(paginationState.currentPage, totalPages - 1);

      return {
        displayedRows: sortedRows,
        paginationInfo: {
          currentPage,
          pageSize,
          totalRows: serverSideState.totalRows,
          totalPages,
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
  }, [sortedRows, pagination, paginationMode, serverSideState.totalRows, paginationState.currentPage, paginationState.pageSize]);

  displayedRowsRef.current = displayedRows;

  const finalPaginationState: PaginationState = {
    enabled: pagination,
    pageSize: paginationState.pageSize,
    currentPage: paginationInfo.currentPage,
    totalRows: paginationInfo.totalRows,
    totalPages: paginationInfo.totalPages,
  };

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

  const api = useMemo((): GridApi<T> => ({
    getRowData: () => rowData,
    setRowData: () => { },
    updateRowData: () => { },
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
    autoSizeColumn: () => { },
    autoSizeAllColumns: () => { },

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
    setFilterModel: (model, options) => {
      if (options?.behavior === 'merge') {
        setFilterModel(prev => {
          const newModel = [...prev];
          model.forEach(newFilter => {
            const existingIndex = newModel.findIndex(f => f.field === newFilter.field);
            if (existingIndex >= 0) {
              newModel[existingIndex] = newFilter;
            } else {
              newModel.push(newFilter);
            }
          });
          return newModel;
        });
      } else {
        setFilterModel(model);
      }
    },
    getFilterModel: () => filterModel,
    setQuickFilter: (text) => setInternalQuickFilter(text),

    startEditingCell: (rowId, field) => {
      const row = displayedRowsRef.current.find((r) => r.id === rowId);
      if (row) {
        const value = getValueFromPath(row.data, field);
        setEditingCell({ rowId, field, value, originalValue: value });
      }
    },
    stopEditing: (cancel = false) => {
      setEditingCell((current) => {
        if (!cancel && current) {
          setOverrides((prev) => {
            const next = { ...prev };
            next[current.rowId] = { ...(next[current.rowId] || {}), [current.field]: current.value };
            return next;
          });
        }
        return null;
      });
    },

    ensureRowVisible: () => { },
    ensureColumnVisible: () => { },
    scrollTo: () => { },

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

    refreshCells: () => { },
    redrawRows: () => { },
    refresh: () => {
      if (paginationMode === 'server') {
        serverSideState.refresh();
      } else {
        setFilterModel([]);
        setSortModel([]);
        setInternalQuickFilter('');
        setPaginationState(prev => ({ ...prev, currentPage: 0 }));
        setSelection(prev => ({ ...prev, selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null }));
      }
    },

    params: () => {
      const filterUpdates: ((current: FilterModel[]) => FilterModel[])[] = [];
      let pendingQuickFilter: string | null = null;
      const sortUpdates: ((current: SortModel[]) => SortModel[])[] = [];

      let pendingPage: number | null = null;
      let pendingPageSize: number | null = null;
      let pendingSelection: { ids: string[]; selected: boolean; mode: 'single' | 'multiple' | 'all' | 'none' } | null = null;
      let pendingReset = false;

      const builder: GridApiBuilder<T> = {
        setFilterModel: (model, options) => {
          filterUpdates.push((prev) => {
            if (options?.behavior === 'merge') {
              const newModel = [...prev];
              model.forEach(newFilter => {
                const existingIndex = newModel.findIndex(f => f.field === newFilter.field);
                if (existingIndex >= 0) {
                  newModel[existingIndex] = newFilter;
                } else {
                  newModel.push(newFilter);
                }
              });
              return newModel;
            }
            return model;
          });
          return builder;
        },
        removeFilter: (field) => {
          filterUpdates.push((prev) => prev.filter(f => f.field !== field));
          return builder;
        },
        removeAllFilter: () => {
          filterUpdates.push(() => []);
          return builder;
        },
        setQuickFilter: (text) => {
          pendingQuickFilter = text;
          return builder;
        },
        removeQuickFilter: () => {
          pendingQuickFilter = '';
          return builder;
        },
        setSortModel: (model) => {
          sortUpdates.push(() => model);
          return builder;
        },
        removeSort: (field) => {
          sortUpdates.push((prev) => prev.filter(s => s.field !== field));
          return builder;
        },
        removeAllSort: () => {
          sortUpdates.push(() => []);
          return builder;
        },
        setPage: (page) => {
          pendingPage = page;
          return builder;
        },
        setPageSize: (size) => {
          pendingPageSize = size;
          return builder;
        },
        selectRow: (id, selected = true) => {
          pendingSelection = { ids: [id], selected, mode: 'single' };
          return builder;
        },
        selectRows: (ids, selected = true) => {
          pendingSelection = { ids, selected, mode: 'multiple' };
          return builder;
        },
        selectAll: () => {
          pendingSelection = { ids: [], selected: true, mode: 'all' };
          return builder;
        },
        deselectAll: () => {
          pendingSelection = { ids: [], selected: false, mode: 'none' };
          return builder;
        },
        updateRowData: (updates) => {
          console.warn('updateRowData in builder is not fully implemented yet');
          return builder;
        },
        resetState: () => {
          pendingReset = true;
          return builder;
        },
        execute: () => {
          if (pendingReset) {
            setFilterModel([]);
            setInternalQuickFilter('');
            setSortModel([]);
            setPaginationState(prev => ({ ...prev, currentPage: 0, pageSize: paginationPageSize }));
            setSelection({ selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null });
            return;
          }

          // Apply Batch Updates
          if (filterUpdates.length > 0) {
            setFilterModel(prev => {
              let current = prev;
              for (const update of filterUpdates) {
                current = update(current);
              }
              return current;
            });
          }

          if (pendingQuickFilter !== null) {
            setInternalQuickFilter(pendingQuickFilter);
          }

          if (sortUpdates.length > 0) {
            setSortModel(prev => {
              let current = prev;
              for (const update of sortUpdates) {
                current = update(current);
              }
              return current;
            });
          }

          if (pendingPageSize !== null) {
            setPaginationState(prev => ({ ...prev, pageSize: pendingPageSize!, currentPage: 0 }));
          } else if (pendingPage !== null) {
            setPaginationState(prev => ({
              ...prev,
              currentPage: Math.max(0, Math.min(pendingPage!, prev.totalPages - 1))
            }));
          }

          if (pendingSelection) {
            const { ids, selected, mode } = pendingSelection;
            if (mode === 'all') selectAll();
            else if (mode === 'none') deselectAll();
            else if (mode === 'single') selectRow(ids[0], selected);
            else if (mode === 'multiple') {
              setSelection((prev) => {
                const newSelected = new Set(prev.selectedRows);
                ids.forEach((id) => {
                  if (selected) newSelected.add(id);
                  else newSelected.delete(id);
                });
                return { ...prev, selectedRows: newSelected };
              });
            }
          }
        }
      };
      return builder;
    },
  }), [rowData, columnDefs, columns, sortModel, filterModel, selection, selectAll, deselectAll, selectRow, paginationPageSize, setSelection]);

  const setColumnPinned = useCallback((field: string, pinned: 'left' | 'right' | null) => {
    setPinnedColumns((prev) => ({ ...prev, [field]: pinned }));
  }, []);

  return {
    rows,
    allRows: rows,
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
    paginationState: finalPaginationState,
    setPaginationState,
    editingCell,
    setEditingCell,
    api,
    setColumnOrder,
    setColumnWidths,
    setColumnPinned,
    serverSideLoading: serverSideState.loading,
    hasCustomRowNumber,
    hasCustomCheckbox,
  };
}