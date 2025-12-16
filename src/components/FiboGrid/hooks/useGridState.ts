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
        selected: false,
        expanded: false,
        level: 0,
      };
    }
    return result;
  }, [internalRowData, serverSideState.data, paginationMode, getRowId, overrides]);

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

      const nextSelection = {
        selectedRows: newSelected,
        lastSelectedIndex: rowIndex,
        anchorIndex: shift ? prev.anchorIndex : rowIndex,
      };

      selectionRef.current = nextSelection;
      setSelection(nextSelection);
    },
    [rowSelection]
  );

  const selectAll = useCallback(() => {
    if (rowSelection !== 'multiple') return;
    const nextSelection = {
      ...selectionRef.current,
      selectedRows: new Set(displayedRowsRef.current.map((r) => r.id)),
    };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);
  }, [rowSelection]);

  const deselectAll = useCallback(() => {
    const nextSelection = {
      ...selectionRef.current,
      selectedRows: new Set<string>(),
    };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);
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
      let pendingResetEdits = false;

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
        resetEdits: () => {
          pendingResetEdits = true;
          return builder;
        },
        execute: () => {
          if (pendingReset) {
            setFilterModel([]);
            setInternalQuickFilter('');
            setSortModel([]);
            setPaginationState(prev => ({ ...prev, currentPage: 0, pageSize: paginationPageSize }));
            setSelection({ selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null });
            setSelection({ selectedRows: new Set(), lastSelectedIndex: null, anchorIndex: null });
            setOverrides({});
            return;
          }

          if (pendingResetEdits) {
            setOverrides({});
          }

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
        },
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
        }
      };
      return builder;
    },
  }), [internalRowData, columnDefs, columns, sortModel, filterModel, selection, selectAll, deselectAll, selectRow, paginationPageSize, setSelection]);

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
  };
}