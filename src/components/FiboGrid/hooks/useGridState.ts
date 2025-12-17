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
  GridManagerBuilder,
  ServerSideDataSourceRequest,
  DispatchAction,
} from '../types';
import { useServerSideData } from './useServerSideData';
import { GridRefreshBuilderImpl } from '../utils/GridRefreshBuilder';
import {
  createRowNode,
  processColumns,
  sortRows,
  filterRows,
  exportToCsv,
  copyToClipboard,
  getValueFromPath,
  setValueAtPath,
  deepMerge,
} from '../utils/helpers';
import {
  RowNumberRenderer,
  CheckboxCellRenderer,
  CheckboxHeaderRenderer
} from '../components/SpecialRenderers';
import { EventBuilder } from '../utils/EventBuilder';
import { useGridRegistry } from '../context/GridRegistryContext';

const globalEventListeners = new Map<string, Map<string, Set<(event: any) => void>>>();

export function useGridState<T>(props: FiboGridProps<T>, containerWidth: number) {
  const {
    gridId = 'default-grid',
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

  const registry = useGridRegistry<T>();

  const [internalRowData, setInternalRowData] = useState<T[]>(rowData || []);

  const prevRowDataRef = useRef(rowData);
  if (rowData !== prevRowDataRef.current) {
    prevRowDataRef.current = rowData;
    setInternalRowData(rowData || []);
  }

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
    (columnDefs || []).map((c) => c.field)
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left' | 'right' | null>>({});
  const [internalQuickFilter, setInternalQuickFilter] = useState(quickFilterText || '');
  const prevQuickFilterTextRef = useRef(quickFilterText);

  if (quickFilterText !== undefined && quickFilterText !== prevQuickFilterTextRef.current) {
    prevQuickFilterTextRef.current = quickFilterText;
    setInternalQuickFilter(quickFilterText);
  }

  const rowsRef = useRef<RowNode<T>[]>([]);
  const displayedRowsRef = useRef<RowNode<T>[]>([]);
  const historyRef = useRef<T[][]>([]);

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



  const gridIdForEvents = props.gridId || 'default';

  if (!globalEventListeners.has(gridIdForEvents)) {
    globalEventListeners.set(gridIdForEvents, new Map());
  }
  const eventListenersMap = globalEventListeners.get(gridIdForEvents)!;

  const addEventListener = useCallback((eventType: string, listener: (event: any) => void) => {
    if (!eventListenersMap.has(eventType)) {
      eventListenersMap.set(eventType, new Set());
    }
    eventListenersMap.get(eventType)?.add(listener);
  }, [eventListenersMap]);

  const removeEventListener = useCallback((eventType: string, listener: (event: any) => void) => {
    eventListenersMap.get(eventType)?.delete(listener);
  }, [eventListenersMap]);

  const fireEvent = useCallback((eventType: string, eventData: any) => {
    const listeners = eventListenersMap.get(eventType);
    if (listeners && listeners.size > 0) {
      listeners.forEach(listener => listener(eventData));
    }
  }, [eventListenersMap]);

  const hasListeners = useCallback((eventType: string) => {
    const listeners = eventListenersMap.get(eventType);
    return listeners !== undefined && listeners.size > 0;
  }, [eventListenersMap]);






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
    const sourceData = paginationMode === 'server' ? serverSideState.data : internalRowData;
    const len = sourceData.length;
    const result: RowNode<T>[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const raw = sourceData[i];
      const rowId = getRowId ? getRowId(raw) : `row-${i}`;

      let data = raw;
      if (overrides[rowId]) {
        Object.entries(overrides[rowId]).forEach(([field, value]) => {
          data = setValueAtPath(data, field, value);
        });
      }

      result[i] = {
        id: rowId,
        data,
        rowIndex: i,
        selected: selection.selectedRows.has(rowId),
        expanded: false,
        level: 0,
      };
    }
    return result;
  }, [internalRowData, serverSideState.data, paginationMode, getRowId, overrides, selection.selectedRows]);

  rowsRef.current = rows;

  const filteredRows = useMemo(() => {

    if (paginationMode === 'server') {
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



  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const selectRow = useCallback(
    (rowId: string, selected: boolean, shift = false, ctrl = false) => {
      if (!rowSelection) return;

      const prev = selectionRef.current;
      const newSelected = new Set(prev.selectedRows);
      const rowIndex = displayedRowsRef.current.findIndex((r) => r.id === rowId);

      if (rowSelection === 'single') {
        if (selected) {
          if (prev.selectedRows.has(rowId) && prev.selectedRows.size === 1) return;
          newSelected.clear();
          newSelected.add(rowId);
        } else {
          if (!prev.selectedRows.has(rowId)) return;
          newSelected.clear();
        }
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
          if (selected) {
            if (newSelected.has(rowId)) return;
            newSelected.add(rowId);
          } else {
            if (!newSelected.has(rowId)) return;
            newSelected.delete(rowId);
          }
        }
      }

      if (newSelected.size === prev.selectedRows.size) {
        let hasDiff = false;
        for (const id of newSelected) {
          if (!prev.selectedRows.has(id)) {
            hasDiff = true;
            break;
          }
        }
        if (!hasDiff) return;
      }

      const nextSelection = {
        selectedRows: newSelected,
        lastSelectedIndex: rowIndex,
        anchorIndex: shift ? prev.anchorIndex : rowIndex,
      };

      selectionRef.current = nextSelection;
      setSelection(nextSelection);

      fireEvent('selectionChanged', { api: api!, selectedRows: Array.from(newSelected).map(id => rowsRef.current.find(r => r.id === id)!) });
    },
    [rowSelection, fireEvent]
  );

  const selectAll = useCallback(() => {
    if (rowSelection !== 'multiple') return;

    const allIds = displayedRowsRef.current.map((r) => r.id);
    const prev = selectionRef.current;

    if (prev.selectedRows.size === allIds.length) {
      let allMatch = true;
      for (const id of allIds) {
        if (!prev.selectedRows.has(id)) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return;
    }

    const nextSelection = {
      ...selectionRef.current,
      selectedRows: new Set(allIds),
    };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);

    // Fire selectionChanged event
    fireEvent('selectionChanged', { api: api!, selectedRows: displayedRowsRef.current });
  }, [rowSelection, fireEvent]);

  const deselectAll = useCallback(() => {
    const prev = selectionRef.current;
    if (prev.selectedRows.size === 0) return; // Already empty

    const nextSelection = {
      ...selectionRef.current,
      selectedRows: new Set<string>(),
    };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);

    // Fire selectionChanged event
    fireEvent('selectionChanged', { api: api!, selectedRows: [] });
  }, [setSelection, fireEvent]);

  // Synchronize refs for stable API access
  const sortModelRef = useRef(sortModel);
  sortModelRef.current = sortModel;

  const filterModelRef = useRef(filterModel);
  filterModelRef.current = filterModel;

  const paginationStateRef = useRef(paginationState);
  paginationStateRef.current = paginationState;

  const quickFilterRef = useRef(internalQuickFilter);
  quickFilterRef.current = internalQuickFilter;

  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;




  const api = useMemo((): GridApi<T> => ({
    addEventListener,
    removeEventListener,
    events: () => new EventBuilder<T>(addEventListener, removeEventListener),
    getRowData: () => paginationMode === 'server' ? serverSideState.data : internalRowData,
    setRowData: () => { },
    updateRowData: () => { },
    getRowNode: (id) => rowsRef.current.find((r) => r.id === id) || null,
    forEachNode: (callback) => rowsRef.current.forEach(callback),
    getDisplayedRowCount: () => displayedRowsRef.current.length,
    getDisplayedRowAtIndex: (index) => displayedRowsRef.current[index] || null,
    getDisplayedRows: () => displayedRowsRef.current,

    getSelectedRows: () => displayedRowsRef.current.filter((r) => selectionRef.current.selectedRows.has(r.id)),
    getSelectedNodes: () => displayedRowsRef.current.filter((r) => selectionRef.current.selectedRows.has(r.id)),
    selectAll,
    deselectAll,
    selectRow: (id, selected = true) => selectRow(id, selected),
    selectRows: (rowIds, selected = true) => {
      const prev = selectionRef.current;
      const newSelected = new Set(prev.selectedRows);
      rowIds.forEach((id) => {
        if (selected) newSelected.add(id);
        else newSelected.delete(id);
      });
      const nextSelection = { ...prev, selectedRows: newSelected };
      selectionRef.current = nextSelection;
      setSelection(nextSelection);
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
    getSortModel: () => sortModelRef.current,
    setFilterModel: (model, options) => {
      if (options?.behavior === 'merge') {
        const currentModel = filterModelRef.current;
        const newModel = [...currentModel];
        model.forEach(newFilter => {
          const existingIndex = newModel.findIndex(f => f.field === newFilter.field);
          if (existingIndex >= 0) {
            newModel[existingIndex] = newFilter;
          } else {
            newModel.push(newFilter);
          }
        });
        setFilterModel(newModel);
      } else {
        setFilterModel(model);
      }
    },
    getFilterModel: () => filterModelRef.current,
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

          // Fire cellValueChanged for UI edits
          const rowNode = displayedRowsRef.current.find(r => r.id === current.rowId);
          const column = columns.find(c => c.field === current.field);
          if (rowNode && column) {
            fireEvent('cellValueChanged', {
              rowNode,
              column,
              field: current.field,
              oldValue: current.originalValue,
              newValue: current.value,
              api
            });
          }
        }
        return null;
      });
    },

    ensureRowVisible: () => { },
    ensureColumnVisible: () => { },
    scrollTo: () => { },

    exportToCsv: (params) => {
      const rowsToExport = params?.onlySelected
        ? displayedRowsRef.current.filter((r) => selectionRef.current.selectedRows.has(r.id))
        : displayedRowsRef.current;
      exportToCsv(rowsToExport, columns, {
        fileName: params?.fileName,
        skipHeader: params?.skipHeader,
      });
    },
    copyToClipboard: async (includeHeaders = true) => {
      const selectedRows = displayedRowsRef.current.filter((r) =>
        selectionRef.current.selectedRows.has(r.id)
      );
      const rowsToCopy = selectedRows.length > 0 ? selectedRows : displayedRowsRef.current;
      await copyToClipboard(rowsToCopy, columns, includeHeaders); // columns depends on columns state
    },

    refreshCells: () => { },
    redrawRows: () => { },
    refresh: () => {
      const refreshFn = () => {
        if (paginationMode === 'server') {
          serverSideState.refresh();
        } else {
          setFilterModel([]);
          setSortModel([]);
          setInternalQuickFilter('');
          setPaginationState(prev => ({ ...prev, currentPage: 0 }));
          setSelection(prev => ({ ...prev, selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null }));
        }
      };

      return new GridRefreshBuilderImpl<T>(
        gridId,
        api!,
        (action, data) => {
          const dispatchAction: DispatchAction = typeof action === 'string'
            ? { type: action, source: gridId, timestamp: Date.now(), data }
            : action;
          registry?.dispatchAction(gridId, dispatchAction);
        },
        refreshFn,
        () => api!.manager(),
        () => api!.params()
      );
    },

    dispatch: (action, data) => {
      const dispatchAction: DispatchAction = typeof action === 'string'
        ? { type: action, source: gridId, timestamp: Date.now(), data }
        : action;
      registry?.dispatchAction(gridId, dispatchAction);
    },

    getDependents: () => {
      return registry?.getDependents(gridId) || [];
    },

    getParents: () => {
      return registry?.getParents(gridId) || [];
    },

    params: () => {
      const filterUpdates: ((current: FilterModel[]) => FilterModel[])[] = [];
      let pendingQuickFilter: string | null = null;
      const sortUpdates: ((current: SortModel[]) => SortModel[])[] = [];

      let pendingPage: number | null = null;
      let pendingPageSize: number | null = null;
      let pendingSelection: { ids: string[]; selected: boolean; mode: 'single' | 'multiple' | 'all' | 'none' } | null = null;
      let pendingReset = false;
      let pendingResetEdits = false;
      let pendingResetCells: { rowId: string, field: string }[] = [];
      let pendingResetRows: string[] = [];
      let pendingUpAdds: any[] = [];
      let pendingReplaceAll: any[] = [];
      const pendingUpdates = new Map<string, any>();
      const pendingRemoves = new Set<string>();
      let pendingAdds: any[] = [];

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
        setPagination: (state) => {
          if (state.currentPage !== undefined) pendingPage = state.currentPage;
          if (state.pageSize !== undefined) pendingPageSize = state.pageSize;
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
        selectRows: (ids, selected = true) => {
          pendingSelection = { ids, selected, mode: 'multiple' };
          return builder;
        },
        selectRow: (id, selected = true) => {
          pendingSelection = { ids: [id], selected, mode: 'single' };
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
        resetEdits: () => {
          pendingResetEdits = true;
          return builder;
        },
        resetCell: (rowId, field) => {
          pendingResetCells.push({ rowId, field });
          return builder;
        },
        resetRow: (rowId) => {
          pendingResetRows.push(rowId);
          return builder;
        },
        gridManager: (callback) => {
          const managerBuilder: GridManagerBuilder<T> = {
            add: (rows) => {
              pendingAdds.push(...rows);
              return managerBuilder;
            },
            remove: (rowIds) => {
              rowIds.forEach(id => pendingRemoves.add(String(id)));
              return managerBuilder;
            },
            update: (rows) => {
              rows.forEach(row => {
                const id = getRowId ? getRowId(row) : (row as any).id;
                if (id !== undefined && id !== null) {
                  pendingUpdates.set(String(id), row);
                }
              });
              return managerBuilder;
            },
            upAdd: (rows) => {
              pendingUpAdds.push(...rows);
              return managerBuilder;
            },
            replaceAll: (rows) => {
              pendingReplaceAll = rows;
              return managerBuilder;
            },
            updateCell: (rowId, field, value) => {
              // For now, rudimentary support by assuming row exists in data
              const existing = pendingUpdates.get(rowId) || {};
              pendingUpdates.set(rowId, { ...existing, [field]: value });
              return managerBuilder;
            },
            resetCell: (rowId, field) => {
              pendingResetCells.push({ rowId, field });
              return managerBuilder;
            },
            resetRow: (rowId) => {
              pendingResetRows.push(rowId);
              return managerBuilder;
            },
            reset: () => {
              pendingReset = true;
              return managerBuilder;
            },
            resetEdits: () => {
              pendingResetEdits = true;
              return managerBuilder;
            },
            execute: () => {
              builder.execute();
            }
          };
          callback(managerBuilder);
          return builder;
        },

        execute: () => {
          if (pendingReset) {
            setFilterModel([]);
            setSortModel([]);
            setInternalQuickFilter('');
            setPaginationState(prev => ({ ...prev, currentPage: 0, pageSize: paginationStateRef.current.pageSize })); // Use ref for pageSize
            setSelection(prev => ({ ...prev, selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null }));
            setOverrides({}); // Reset edits too
            return;
          }

          if (pendingResetEdits) {
            setOverrides({});
          }

          if (pendingResetCells.length > 0) {
            setOverrides(prev => {
              const next = { ...prev };
              pendingResetCells.forEach(({ rowId, field }) => {
                if (next[rowId]) {
                  delete next[rowId][field];
                  if (Object.keys(next[rowId]).length === 0) {
                    delete next[rowId];
                  }
                }
              });
              return next;
            });
          }

          if (pendingResetRows.length > 0) {
            setOverrides(prev => {
              const next = { ...prev };
              pendingResetRows.forEach(rowId => {
                delete next[rowId];
              });
              return next;
            });
          }

          if (filterUpdates.length > 0) {
            setFilterModel(prev => {
              let next = prev;
              filterUpdates.forEach(update => {
                next = update(next);
              });
              return next;
            });
          }

          if (pendingQuickFilter !== null) {
            setInternalQuickFilter(pendingQuickFilter);
          }

          if (sortUpdates.length > 0) {
            setSortModel(prev => {
              let next = prev;
              sortUpdates.forEach(update => {
                next = update(next);
              });
              return next;
            });
          }

          if (pendingPage !== null || pendingPageSize !== null) {
            setPaginationState(prev => ({
              ...prev,
              currentPage: pendingPage ?? prev.currentPage,
              pageSize: pendingPageSize ?? prev.pageSize
            }));
          }

          if (pendingSelection) {
            const { mode, ids, selected } = pendingSelection;
            if (mode === 'all') {
              selectAll();
            } else if (mode === 'none') {
              deselectAll();
            } else {
              if (mode === 'single') {
                // Force single selection logic manually if needed or just use selectRow
                // But selectRow expects ID. pendingSelection provided [id].
                selectRow(ids[0], selected);
              } else {
                // selectRows implementation
                // api.selectRows(ids, selected); // Can't access API here easily without recursion?
                // Use SetSelection direct
                const prev = selectionRef.current;
                const newSelected = new Set(prev.selectedRows);
                ids.forEach((id) => {
                  if (selected) newSelected.add(id);
                  else newSelected.delete(id);
                });
                const nextSelection = { ...prev, selectedRows: newSelected };
                selectionRef.current = nextSelection;
                setSelection(nextSelection);
              }
            }
          }

          // Manager updates
          if (pendingReplaceAll.length > 0) {
            setInternalRowData(pendingReplaceAll);
            // Clear pending updates/adds/removes as replaceAll overrides them?
            // Or apply them after? Usually replaceAll is exclusive.
            setOverrides({}); // Reset edits on replace all? Usually yes.
            return;
          }

          setInternalRowData(prev => {
            if (pendingUpdates.size === 0 && pendingRemoves.size === 0 && pendingAdds.length === 0 && pendingUpAdds.length === 0) {
              return prev;
            }

            let next = [...prev];

            if (pendingUpAdds.length > 0) {
              pendingUpAdds.forEach(upRow => {
                const id = getRowId ? getRowId(upRow) : (upRow as any).id;
                if (id !== undefined && id !== null) {
                  const exists = next.some(r => {
                    const rId = getRowId ? getRowId(r) : (r as any).id;
                    return String(rId) === String(id);
                  });
                  if (exists) {
                    pendingUpdates.set(String(id), upRow);
                  } else {
                    pendingAdds.push(upRow);
                  }
                } else {
                  pendingAdds.push(upRow);
                }
              });
            }

            if (pendingUpdates.size > 0) {
              // Fire cellValueChanged for API updates
              pendingUpdates.forEach((newRowData, sId) => {
                const oldRowNode = rowsRef.current.find(r => String(r.id) === sId);
                if (oldRowNode) {
                  const oldData = oldRowNode.data as any;
                  Object.keys(newRowData).forEach(key => {
                    if (oldData[key] !== (newRowData as any)[key]) {
                      const column = columns.find(c => c.field === key);
                      if (column) {
                        fireEvent('cellValueChanged', {
                          rowNode: oldRowNode,
                          column,
                          field: key,
                          oldValue: oldData[key],
                          newValue: (newRowData as any)[key],
                          api
                        });
                      }
                    }
                  });
                }
              });

              next = next.map(row => {
                const id = getRowId ? getRowId(row) : (row as any).id;
                const sId = String(id);
                if (pendingUpdates.has(sId)) {
                  // Use deepMerge to preserve nested properties that are not in the update
                  return deepMerge(row, pendingUpdates.get(sId));
                }
                return row;
              });
            }

            if (pendingRemoves.size > 0) {
              next = next.filter(row => {
                const id = getRowId ? getRowId(row) : (row as any).id;
                return !pendingRemoves.has(String(id));
              });
            }

            if (pendingAdds.length > 0) {
              next = [...next, ...pendingAdds];
            }

            return next;
          });
        }
      };
      return builder;
    },

    undo: () => {
      setInternalRowData((current) => {
        if (historyRef.current.length === 0) return current;
        const previous = historyRef.current.pop();
        return previous || current;
      });
    },

    pasteFromClipboard: async () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const text = await navigator.clipboard.readText();
          if (!text) return;

          const separator = text.includes('\t') ? '\t' : ',';
          const rows = text.split('\n').filter(r => r.trim() !== '');
          const newRows: T[] = [];


          const visibleCols = columnDefs.filter(c => !c.hide).map(c => c.field);

          rows.forEach(rowStr => {
            const values = rowStr.split(separator);
            const newRow: any = {};
            visibleCols.forEach((colField, i) => {
              if (i < values.length) {
                setValueAtPath(newRow, colField, values[i]);
              }
            });
            if (!newRow.id) newRow.id = `pasted-${Date.now()}-${Math.random()}`;
            newRows.push(newRow as T);
          });

          if (newRows.length > 0) {
            setInternalRowData(prev => {
              historyRef.current.push([...prev]);
              return [...prev, ...newRows];
            });
          }
        } catch (err) {
          console.warn('Failed to read from clipboard. Context might be insecure.', err);
        }
      } else {
        console.warn('Clipboard API not available (readText).');
      }
    },

    manager: () => {
      let pendingAdds: T[] = [];
      let pendingUpAdds: T[] = [];
      let pendingRemoves: Set<string> = new Set();
      let pendingUpdates: Map<string, T> = new Map();
      let pendingCellUpdates: Map<string, Record<string, any>> = new Map();
      let pendingReset = false;
      let pendingResetEdits = false;
      let pendingCellResets: Map<string, Set<string>> = new Map();
      let pendingRowResets: Set<string> = new Set();

      const builder: GridManagerBuilder<T> = {
        add: (rows: T[]) => {
          if (!rows || !Array.isArray(rows) || rows.length === 0) {
            console.warn('Grid Manager: add() requires a non-empty array of rows.');
            return builder;
          }
          pendingAdds.push(...rows);
          return builder;
        },
        upAdd: (rows: T[]) => {
          if (!rows || !Array.isArray(rows) || rows.length === 0) {
            console.warn('Grid Manager: upAdd() requires a non-empty array of rows.');
            return builder;
          }
          pendingUpAdds.push(...rows);
          return builder;
        },
        replaceAll: (rows: T[]) => {
          if (!rows || !Array.isArray(rows)) {
            console.warn('Grid Manager: replaceAll() requires an array of rows.');
            return builder;
          }
          builder.reset();
          builder.add(rows);
          return builder;
        },
        remove: (rowIds: string[]) => {
          if (!rowIds || !Array.isArray(rowIds) || rowIds.length === 0) {
            console.warn('Grid Manager: remove() requires a non-empty array of rowIds.');
            return builder;
          }
          rowIds.forEach(id => pendingRemoves.add(String(id)));
          return builder;
        },
        update: (rows: T[]) => {
          if (!rows || !Array.isArray(rows) || rows.length === 0) {
            console.warn('Grid Manager: update() requires a non-empty array of rows.');
            return builder;
          }
          rows.forEach(row => {
            const id = getRowId ? getRowId(row) : (row as any).id;
            if (id) pendingUpdates.set(String(id), row);
            else console.warn('Grid Manager: update() failed for row without ID:', row);
          });
          return builder;
        },
        updateCell: (rowId: string, field: string, value: any) => {
          if (!rowId || !field) {
            console.warn('Grid Manager: updateCell() requires rowId and field.');
            return builder;
          }
          const sRowId = String(rowId);
          const current = pendingCellUpdates.get(sRowId) || {};
          current[field] = value;
          pendingCellUpdates.set(sRowId, current);
          return builder;
        },
        resetCell: (rowId: string, field: string) => {
          if (!rowId || !field) return builder;
          const sRowId = String(rowId);
          const fields = pendingCellResets.get(sRowId) || new Set();
          fields.add(field);
          pendingCellResets.set(sRowId, fields);
          return builder;
        },
        resetRow: (rowId: string) => {
          if (!rowId) return builder;
          pendingRowResets.add(String(rowId));
          return builder;
        },
        reset: () => {
          pendingReset = true;
          return builder;
        },
        resetEdits: () => {
          pendingResetEdits = true;
          return builder;
        },
        execute: () => {
          if (pendingResetEdits) {
            setOverrides({});
          }

          if (pendingRowResets.size > 0 || pendingCellResets.size > 0) {
            setOverrides(prev => {
              const nextOverrides = { ...prev };

              pendingRowResets.forEach(rowId => {
                delete nextOverrides[rowId];
              });

              pendingCellResets.forEach((fields, rowId) => {
                if (nextOverrides[rowId]) {
                  const rowOverrides = { ...nextOverrides[rowId] };
                  fields.forEach(field => delete rowOverrides[field]);
                  if (Object.keys(rowOverrides).length === 0) {
                    delete nextOverrides[rowId];
                  } else {
                    nextOverrides[rowId] = rowOverrides;
                  }
                }
              });

              return nextOverrides;
            });
          }

          if (pendingCellUpdates.size > 0) {
            setOverrides(prev => {
              const nextOverrides = { ...prev };
              pendingCellUpdates.forEach((updates, rowId) => {
                nextOverrides[rowId] = { ...(nextOverrides[rowId] || {}), ...updates };
              });
              return nextOverrides;
            });
          }

          setInternalRowData(prev => {
            if (pendingReset) {
              historyRef.current = [];
              let next: T[] = [];

              if (pendingUpAdds.length > 0) {
                next = [...next, ...pendingUpAdds];
              }

              if (pendingAdds.length > 0) {
                next = [...next, ...pendingAdds];
              }

              return next;
            } else {
              if (pendingAdds.length > 0 || pendingRemoves.size > 0 || pendingUpdates.size > 0 || pendingUpAdds.length > 0) {
                historyRef.current.push([...prev]);
              }

              let next = [...prev];

              if (pendingUpAdds.length > 0) {
                pendingUpAdds.forEach(upRow => {
                  const id = getRowId ? getRowId(upRow) : (upRow as any).id;
                  if (id !== undefined && id !== null) {
                    const exists = next.some(r => {
                      const rId = getRowId ? getRowId(r) : (r as any).id;
                      return String(rId) === String(id);
                    });
                    if (exists) {
                      pendingUpdates.set(String(id), upRow);
                    } else {
                      pendingAdds.push(upRow);
                    }
                  } else {
                    pendingAdds.push(upRow);
                  }
                });
              }

              if (pendingUpdates.size > 0) {
                next = next.map(row => {
                  const id = getRowId ? getRowId(row) : (row as any).id;
                  const sId = String(id);
                  if (pendingUpdates.has(sId)) {
                    return { ...row, ...pendingUpdates.get(sId) };
                  }
                  return row;
                });
              }

              if (pendingRemoves.size > 0) {
                next = next.filter(row => {
                  const id = getRowId ? getRowId(row) : (row as any).id;
                  return !pendingRemoves.has(String(id));
                });
              }

              if (pendingAdds.length > 0) {
                next = [...next, ...pendingAdds];
              }

              return next;
            }
          });

          const hasDataChanges = pendingReset || pendingAdds.length > 0 || pendingRemoves.size > 0 ||
            pendingUpdates.size > 0 || pendingUpAdds.length > 0;

          if (hasDataChanges) {
            const operation = pendingReset ? 'replaceAll' :
              (pendingAdds.length > 0 || pendingUpAdds.length > 0) ? 'add' :
                pendingRemoves.size > 0 ? 'remove' : 'update';

            const count = pendingReset ? (pendingUpAdds.length + pendingAdds.length) :
              (pendingAdds.length + pendingUpAdds.length + pendingRemoves.size + pendingUpdates.size);

            api.dispatch('dataChanged', {
              operation,
              count,
              addedCount: pendingAdds.length + pendingUpAdds.length,
              removedCount: pendingRemoves.size,
              updatedCount: pendingUpdates.size,
            });
          }
        }
      };
      return builder;
    },
  }), [internalRowData, columnDefs, columns, selectAll, deselectAll, selectRow, paginationPageSize, setSelection]);

  // Fire Sort Changed Event
  const prevSortModel = useRef(sortModel);
  useEffect(() => {
    if (prevSortModel.current !== sortModel && api) {
      if (hasListeners('sortChanged')) {
        const oldSortModel = prevSortModel.current;
        prevSortModel.current = sortModel;
        fireEvent('sortChanged', { api, sortModel, oldSortModel });
      } else {
        prevSortModel.current = sortModel;
      }
    }
  }, [sortModel, fireEvent, api, hasListeners]);

  // Fire Filter Changed Event
  const prevFilterModel = useRef(filterModel);
  useEffect(() => {
    if (prevFilterModel.current !== filterModel && api) {
      const oldFilterModel = prevFilterModel.current;

      // Check for removed filters always (simple check) or guard? 
      // Filter removed is a separate event. Logic complicates if we skip.
      // Let's guard the main event fire but logic for removed might need to run?
      // Actually if no one listens to filterChanged OR filterRemoved we can skip.

      const hasFilterChangedListeners = hasListeners('filterChanged');
      const hasFilterRemovedListeners = hasListeners('filterRemoved');

      if (hasFilterChangedListeners || hasFilterRemovedListeners) {
        // Re-implementing logic with checks
        if (hasFilterRemovedListeners) {
          if (oldFilterModel.length > filterModel.length) {
            // Find removed
            oldFilterModel.forEach(oldF => {
              const stillExists = filterModel.find(f => f.field === oldF.field);
              if (!stillExists) {
                fireEvent('filterRemoved', { api, filterModel: oldF });
              }
            });
          }
        }

        if (hasFilterChangedListeners) {
          fireEvent('filterChanged', { api, filterModel, oldFilterModel });
        }
      } else {
        prevFilterModel.current = filterModel;
        return;
      }

      prevFilterModel.current = filterModel;
    }
  }, [filterModel, fireEvent, api, hasListeners]);

  // Fire Pagination Changed Event
  const prevPaginationState = useRef(finalPaginationState);
  useEffect(() => {
    if (Object.keys(finalPaginationState).length > 0 && api) {
      const prev = prevPaginationState.current;
      const curr = finalPaginationState;

      const hasChanged =
        prev.currentPage !== curr.currentPage ||
        prev.pageSize !== curr.pageSize ||
        prev.totalPages !== curr.totalPages ||
        prev.totalRows !== curr.totalRows;

      if (hasChanged) {
        if (hasListeners('paginationChanged')) {
          // ... calculations
          const isFirstPage = curr.currentPage === 0;
          const isLastPage = curr.currentPage >= (curr.totalPages - 1);
          const nextPage = !isLastPage ? curr.currentPage + 1 : null;
          const prevPage = !isFirstPage ? curr.currentPage - 1 : null;

          // Calculate old values for diffing
          const prevIsFirstPage = prev.currentPage === 0;
          const prevIsLastPage = prev.currentPage >= (prev.totalPages - 1);
          const oldNextPage = !prevIsLastPage ? prev.currentPage + 1 : null;
          const oldPrevPage = !prevIsFirstPage ? prev.currentPage - 1 : null;

          const fromPageSizeChange = prev.pageSize !== curr.pageSize;

          fireEvent('paginationChanged', {
            api,
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
  }, [finalPaginationState, fireEvent, api, hasListeners]);

  // Fire Quick Filter Changed Event
  const prevQuickFilterRef = useRef(internalQuickFilter);
  useEffect(() => {
    if (prevQuickFilterRef.current !== internalQuickFilter && api) {
      if (hasListeners('quickFilterChanged')) {
        const oldQuickFilterValue = prevQuickFilterRef.current;
        fireEvent('quickFilterChanged', { api, quickFilterValue: internalQuickFilter, oldQuickFilterValue });
      }
      prevQuickFilterRef.current = internalQuickFilter;
    }
  }, [internalQuickFilter, fireEvent, api, hasListeners]);

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
    quickFilter: internalQuickFilter,
    setQuickFilter: setInternalQuickFilter,
    fireEvent,
  };
}