import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { FiboGridProps, ProcessedColumn, SortModel, FilterModel, ContextMenuItem, RowNode, EditingCell } from './types';
import { shouldLoadMoreOnScroll } from './utils/infiniteScroll';
import { getValueFromPath, setValueAtPath } from './utils/helpers';
import './styles/theme-mapping.css';
import { useGridState } from './hooks/useGridState';
import { useVirtualization } from './hooks/useVirtualization';
import { useColumnResize } from './hooks/useColumnResize';
import { useColumnDrag } from './hooks/useColumnDrag';
import { useRowDrag } from './hooks/useRowDrag';
import { useRangeSelection } from './hooks/useRangeSelection';
import { useRowRangeSelection } from './hooks/useRowRangeSelection';
import { useClickDetector } from './hooks/useClickDetector';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useGridContext, GridProvider } from './context/GridContext';
import { useGridRegistry, useGridEvent } from './context/GridRegistryContext';
import { GridHeader } from './components/GridHeader';
import { GridRow } from './components/GridRow';
import { GroupRow } from './components/GroupRow';
import { GridOverlay } from './components/GridOverlay';
import { FilterPopover } from './components/FilterPopover';
import { GridContextMenu } from './components/ContextMenu';
import { GridToolbar } from './components/GridToolbar';
import { GridFooter } from './components/GridFooter';
import { isGroupNode, GroupRowNode } from './utils/grouping';
import { cn } from '@/lib/utils';
import { Copy, Download, Trash2 } from 'lucide-react';
import { enUS } from './locales/enUS';
interface FilterState<T> {
  column: ProcessedColumn<T>;
  anchorRect: DOMRect;
}
const EMPTY_SELECTED_CELLS = new Set<string>();
const NOOP = (_rowId: string, _event: React.MouseEvent) => {};
export function FiboGrid<T extends object>(props: FiboGridProps<T>) {
  const {
    rowHeight: rowHeightProp,
    headerHeight: headerHeightProp,
    rowBuffer = 10,
    pagination = false,
    infiniteScroll = false,
    infiniteScrollThreshold = 240,
    paginationPageSize = 100,
    paginationPageSizeOptions = [25, 50, 100, 250, 500],
    rowSelection,
    rangeCellSelection = true,
    rowDragEnabled = true,
    rowDragManaged = true,
    loading = false,
    loadingOverlayComponent,
    noRowsOverlayComponent,
    className,
    theme,
    contextMenu = true,
    getContextMenuItems,
    showToolbar = true,
    showStatusBar = true,
    showRowNumbers = false,
    enableFilterValueVirtualization = true,
    filterValues,
    height,
    gridId,
    groupByFields: initialGroupByFields,
    splitByField,
    groupAggregations,
    treeData,
    getChildRows,
    childRowsField,
    getRowClass,
    onRowSelected,
    onSelectionChanged,
    onCellClicked,
    onCellDoubleClicked,
    onCellValueChanged,
    onRowClicked,
    onRowDoubleClicked,
    onRowDragStart,
    onRowDragEnd,
    onRowDragMove,
    onSortChanged,
    onFilterChanged,
    onColumnResized,
    onColumnMoved,
    onGridReady,
    onPaginationChanged,
    onGlobalFilterChange,
    onFilterRemoved,
    onRowClickFallback,
    quickFilterText,
    lang = enUS,
    configs,
    shortcuts = true,
    minHeight: minHeightProp,
  } = props;
  const isCompact = configs?.compact ?? false;
  const rowHeight = rowHeightProp ?? (isCompact ? 28 : 40);
  const headerHeight = headerHeightProp ?? (isCompact ? 30 : 44);
  const effectiveShowToolbar = configs?.header?.show ?? showToolbar;
  const effectiveShowStatusBar = configs?.footer?.show ?? showStatusBar;
  const effectiveShowRowNumbers = configs?.center?.rowNumbers ?? showRowNumbers;
  const effectiveShowPagination = infiniteScroll ? false : (configs?.footer?.pagination ?? pagination);
  const footerInfo = configs?.footer?.information ?? true;
  const showBorders = configs?.center?.borders !== false;
  const showStripes = configs?.center?.stripes !== false;
  const containerRef = useRef<HTMLDivElement>(null);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const restoreGridFocus = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      const current = containerRef.current;
      if (!current) return;
      const active = document.activeElement;
      if (active instanceof Node && current.contains(active)) return;
      current.focus();
    });
  }, []);
  const cellContentRefs = useRef<Map<string, Map<string, HTMLElement>>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [filterState, setFilterState] = useState<FilterState<T> | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const editingCellRef = useRef<{ rowId: string; field: string; value: any; originalValue: any } | null>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (theme !== 'auto') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);
  const isDarkTheme = theme === 'dark' || (theme === 'auto' && systemPrefersDark);
  const appearance = props.appearance;
  const {
    displayedRows,
    allRows,
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
    internalApi,
    setColumnOrder,
    setColumnWidths,
    setColumnPinned,
    serverSideLoading,
    hasCustomRowNumber,
    hasCustomCheckbox,
    quickFilter,
    setQuickFilter,
    fireEvent,
    grouping,
    finalDisplayedRows
  } = useGridState(props, containerWidth);
  const isInitialServerLoad = serverSideLoading && finalDisplayedRows.length === 0;
  const isLoading = loading || (infiniteScroll ? isInitialServerLoad : serverSideLoading);
  const isServerPagePending = serverSideLoading && finalDisplayedRows.length > 0;
  editingCellRef.current = editingCell;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const displayedRowsRef = useRef(displayedRows);
  displayedRowsRef.current = displayedRows;
  const {
    displayRows: groupedDisplayRows,
    groupedRows,
    splitPoints,
    expandedGroups,
    toggleGroupExpand,
    expandAllGroups,
    collapseAllGroups,
    setGroupByFields,
    groupByFields,
    isGroupRow,
    addChildToRow,
    expandedRows,
    toggleRowExpand,
  } = grouping;
  const gridContext = useGridContext<T>();
  const { registerGrid: registerGlobal, unregisterGrid: unregisterGlobal } = useGridRegistry();
  const apiRef = useRef(api);
  apiRef.current = api;
  const onGridReadyRef = useRef(onGridReady);
  onGridReadyRef.current = onGridReady;
  const readyFiredRef = useRef(false);
  const appliedQuickFilterPropRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (gridContext && gridId) {
      gridContext.registerGrid(gridId, apiRef.current);
      return () => gridContext.unregisterGrid(gridId);
    }
  }, [gridContext, gridId, api]);
  useEffect(() => {
    if (gridId && registerGlobal && unregisterGlobal) {
      registerGlobal(gridId, apiRef.current);
      return () => unregisterGlobal(gridId);
    }
  }, [gridId, registerGlobal, unregisterGlobal, api]);
  useEffect(() => {
    if (readyFiredRef.current) return;
    readyFiredRef.current = true;
    onGridReadyRef.current?.({ api: apiRef.current });
  }, []);
  useEffect(() => {
    if (quickFilterText === undefined) return;
    if (appliedQuickFilterPropRef.current === quickFilterText) return;
    appliedQuickFilterPropRef.current = quickFilterText;
    setQuickFilter(quickFilterText);
  }, [quickFilterText, setQuickFilter]);
  useGridEvent<T>(gridId, 'cellValueChanged', (event) => {
    onCellValueChanged?.(event);
  });
  useGridEvent<T>(gridId, 'sortChanged', (event) => {
    onSortChanged?.(event);
  });
  useGridEvent<T>(gridId, 'filterChanged', (event) => {
    onFilterChanged?.(event);
  });
  useGridEvent<T>(gridId, 'paginationChanged', (event) => {
    onPaginationChanged?.(event);
  });
  useGridEvent<T>(gridId, 'quickFilterChanged', (event) => {
    onGlobalFilterChange?.(event);
  });
  useGridEvent<T>(gridId, 'filterRemoved', (event) => {
    onFilterRemoved?.(event);
  });
  const effectiveContainerHeight = typeof height === 'number' ? height : (containerHeight || 600);
  const toolbarHeight = effectiveShowToolbar ? (isCompact ? 36 : 48) : 0;
  const statusBarHeight = effectiveShowStatusBar ? (isCompact ? 28 : 36) : 0;
  const paginationHeight = effectiveShowPagination ? (isCompact ? 40 : 52) : 0;
  const bodyHeight = effectiveContainerHeight - headerHeight - toolbarHeight - statusBarHeight - paginationHeight;
  const totalContentWidth = useMemo(() => {
    const showCheckbox = !hasCustomCheckbox && configs?.center?.checkboxSelection !== false && !!rowSelection;
    const checkboxWidth = showCheckbox ? 48 : 0;
    const rowNumberWidth = effectiveShowRowNumbers ? 50 : 0;
    const columnsWidth = columns.filter(c => !c.hide).reduce((sum, col) => sum + col.computedWidth, 0);
    return checkboxWidth + rowNumberWidth + columnsWidth;
  }, [columns, rowSelection, effectiveShowRowNumbers, hasCustomCheckbox, configs?.center?.checkboxSelection]);
  const minHeight = minHeightProp ?? 400;
  const virtualizationHeight = Math.max(bodyHeight, typeof minHeight === 'number' ? minHeight : 400);
  const {
    virtualRows,
    totalHeight,
    offsetTop,
    handleScroll,
    scrollToRow,
    containerRef: scrollContainerRef,
  } = useVirtualization(finalDisplayedRows as RowNode<T>[], {
    rowHeight,
    overscan: rowBuffer,
    containerHeight: virtualizationHeight,
  });
  const handleViewportScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleScroll(e);
      if (!infiniteScroll) return;
      const el = e.currentTarget;
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (
        !shouldLoadMoreOnScroll(
          remaining,
          infiniteScrollThreshold,
          serverSideLoading,
          paginationState.currentPage,
          paginationState.totalPages,
        )
      ) {
        return;
      }
      setPaginationState((prev) => {
        if (prev.currentPage >= prev.totalPages - 1) return prev;
        return { ...prev, currentPage: prev.currentPage + 1 };
      });
    },
    [
      handleScroll,
      infiniteScroll,
      infiniteScrollThreshold,
      serverSideLoading,
      paginationState.currentPage,
      paginationState.totalPages,
      setPaginationState,
    ],
  );
  const { isResizing, resizingColumn, handleResizeStart, handleResizeDoubleClick } = useColumnResize(
    (field, width) => {
      setColumnWidths((prev) => ({ ...prev, [field]: width }));
      const column = columns.find((c) => c.field === field);
      if (column) {
        onColumnResized?.({ column, newWidth: width });
        fireEvent('columnResized', { column, newWidth: width });
      }
    }
  );
  const measureColumnContent = useCallback((field: string): number => {
    const columnCells = cellContentRefs.current.get(field);
    if (!columnCells || columnCells.size === 0) return 100;
    const firstCell = columnCells.values().next().value as HTMLElement | undefined;
    if (!firstCell) return 100;
    const font = getComputedStyle(firstCell).font;
    if (!measureCanvasRef.current) {
      measureCanvasRef.current = document.createElement('canvas');
    }
    const context = measureCanvasRef.current.getContext('2d');
    if (!context) return 100;
    context.font = font;
    let maxWidth = 0;
    columnCells.forEach((cell) => {
      const width = context.measureText(cell.textContent || '').width;
      if (width > maxWidth) maxWidth = width;
    });
    return Math.max(80, Math.ceil(maxWidth));
  }, []);
  const registerCellRef = useCallback((field: string, rowId: string, element: HTMLElement | null) => {
    if (!cellContentRefs.current.has(field)) {
      cellContentRefs.current.set(field, new Map());
    }
    const fieldMap = cellContentRefs.current.get(field)!;
    if (element) {
      fieldMap.set(rowId, element);
    } else {
      fieldMap.delete(rowId);
    }
  }, []);
  const {
    draggedColumn,
    dragOverColumn,
    handleDragStart: handleColumnDragStart,
    handleDragOver: handleColumnDragOver,
    handleDragEnd: handleColumnDragEnd,
    handleDrop: handleColumnDrop,
  } = useColumnDrag((fromIndex, toIndex) => {
    setColumnOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    const column = columns[fromIndex];
    if (column) {
      onColumnMoved?.({ column, fromIndex, toIndex });
      fireEvent('columnMoved', { column, fromIndex, toIndex });
    }
  });
  const {
    isDragging: isRowDragging,
    draggedRow,
    dropTargetRow,
    dropPosition,
    handleRowDragStart,
    handleRowDragOver,
    handleRowDragEnd,
    handleRowDrop,
  } = useRowDrag<T>(
    (fromId, toId, position) => {
      if (rowDragManaged) {
        const draggedNode = displayedRows.find((r) => r.id === fromId);
        if (draggedNode && draggedNode.data !== undefined) {
          api.updateRowData({
            remove: [draggedNode.data],
          });
        }
        const targetIndex = displayedRows.findIndex((r) => r.id === toId);
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        const movedRow = draggedNode?.data;
        if (movedRow) {
          const newData = [...(props.rowData ?? [])];
          const fromIndex = newData.findIndex(
            (d, i) => (props.getRowId?.(d) ?? `row-${i}`) === fromId
          );
          const removed = newData.splice(fromIndex, 1)[0];
          newData.splice(insertIndex, 0, removed);
          api.setRowData(newData);
        }
      }
    },
    (row) => onRowDragStart?.({ rowNode: row, api }),
    (row, target) => onRowDragEnd?.({ rowNode: row, overNode: target, api }),
    (row, target) => onRowDragMove?.({ rowNode: row, overNode: target, api })
  );
  const rangeSelectionHook = useRangeSelection();
  const {
    handleCellMouseDown: handleRangeMouseDown,
    handleCellMouseEnter,
    isSelecting,
  } = rangeCellSelection ? rangeSelectionHook : {
    handleCellMouseDown: () => { },
    handleCellMouseEnter: () => { },
    isSelecting: false,
  };
  const selectedCellsRef = useRef(rangeSelectionHook.selectedCells);
  selectedCellsRef.current = rangeCellSelection ? rangeSelectionHook.selectedCells : EMPTY_SELECTED_CELLS;
  const {
    isDraggingRows,
    handleRowMouseDown: handleRowRangeMouseDown,
    handleRowMouseEnter: handleRowRangeMouseEnter,
  } = useRowRangeSelection();
  const { detectClick: detectRowClick } = useClickDetector({ doubleClickDelay: 300 });
  const { detectClick: detectCellClick } = useClickDetector({ doubleClickDelay: 300 });
  const handleActiveCellChange = useCallback((rowIndex: number, _colIndex: number) => {
    scrollToRow(rowIndex);
  }, [scrollToRow]);
  const keyboardNavigationProps = {
    containerRef,
    displayedRows,
    columns,
    api: internalApi,
    onStartEdit: (rowId: string, field: string) => {
      const rowNode = internalApi.getRowNode(rowId);
      const value = rowNode ? (rowNode.data as any)[field] : null;
      setEditingCell({ rowId, field, value, originalValue: value });
      fireEvent('cellEditingStarted', { rowNode, field, value });
    },
    onStopEdit: () => {
      setEditingCell(null);
      fireEvent('cellEditingStopped', {});
      restoreGridFocus();
    },
    isEditing: !!editingCell,
    shortcuts,
    onActiveCellChange: handleActiveCellChange,
  };
  const {
    focusedCell,
    focusCell,
    handleKeyDown,
  } = useKeyboardNavigation(keyboardNavigationProps);
  const focusedCellRef = useRef(focusedCell);
  focusedCellRef.current = focusedCell;
  const isCellSelected = useCallback((rowIndex: number, colIndex: number) => {
    return selectedCellsRef.current.has(`${rowIndex}-${colIndex}`);
  }, []);
  const isCellFocused = useCallback((rowId: string, field: string) => {
    const cell = focusedCellRef.current;
    return cell?.rowId === rowId && cell?.field === field;
  }, []);
  const handleContainerKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target && target !== event.currentTarget) {
      const tag = target.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        tag === 'BUTTON' ||
        target.isContentEditable
      ) {
        return;
      }
    }
    handleKeyDown(event);
  }, [handleKeyDown]);
  const handleSort = useCallback(
    (field: string, direction?: 'asc' | 'desc') => {
      setSortModel((prev) => {
        const existing = prev.find((s) => s.field === field);
        let newModel: SortModel[];
        if (direction) {
          if (existing) {
            newModel = prev.map((s) =>
              s.field === field ? { ...s, direction } : s
            );
          } else {
            newModel = [...prev, { field, direction }];
          }
        } else {
          if (!existing) {
            newModel = [...prev, { field, direction: 'asc' }];
          } else if (existing.direction === 'asc') {
            newModel = prev.map((s) =>
              s.field === field ? { ...s, direction: 'desc' as const } : s
            );
          } else {
            newModel = prev.filter((s) => s.field !== field);
          }
        }
        return newModel;
      });
    },
    [setSortModel /* onSortChanged removed to avoid dupe */]
  );
  const handleFilterChange = useCallback(
    (filter: FilterModel | null) => {
      setFilterModel((prev) => {
        let newModel: FilterModel[];
        if (filter === null) {
          newModel = prev.filter((f) => f.field !== filterState?.column.field);
        } else {
          const existing = prev.findIndex((f) => f.field === filter.field);
          if (existing >= 0) {
            newModel = [...prev];
            newModel[existing] = filter;
          } else {
            newModel = [...prev, filter];
          }
        }
        return newModel;
      });
    },
    [setFilterModel, filterState]
  );
  const handleFilterClick = useCallback((column: ProcessedColumn<T>, anchorRect: DOMRect) => {
    setFilterState({ column, anchorRect });
  }, []);
  const handleCloseFilter = useCallback(() => {
    setFilterState(null);
  }, []);
  const handlePinColumn = useCallback((field: string, pinned: 'left' | 'right' | null) => {
    setColumnPinned(field, pinned);
  }, [setColumnPinned]);
  const handleHideColumn = useCallback((field: string) => {
    api.setColumnVisible(field, false);
  }, [api]);
  const handleAutoSize = useCallback((field: string) => {
    const contentWidth = measureColumnContent(field);
    const column = columns.find(c => c.field === field);
    if (column) {
      const headerText = column.headerName || '';
      const headerWidth = headerText.length * 8 + 80;
      const newWidth = Math.max(contentWidth + 40, headerWidth, column.minWidth || 50);
      setColumnWidths(prev => ({ ...prev, [field]: Math.min(newWidth, column.maxWidth || 800) }));
    }
  }, [columns, measureColumnContent, setColumnWidths]);
  const handleAutoSizeAll = useCallback(() => {
    columns.forEach(column => {
      if (!column.hide) {
        handleAutoSize(column.field);
      }
    });
  }, [columns, handleAutoSize]);
  const handleQuickColumnFilter = useCallback((field: string, value: string) => {
    if (!value.trim()) {
      setFilterModel(prev => prev.filter(f => f.field !== field));
    } else {
      setFilterModel(prev => {
        const existing = prev.findIndex(f => f.field === field);
        const newFilter: FilterModel = {
          field,
          filterType: 'text',
          value: value.trim(),
          operator: 'contains',
        };
        if (existing >= 0) {
          const newModel = [...prev];
          newModel[existing] = newFilter;
          return newModel;
        }
        return [...prev, newFilter];
      });
    }
  }, [setFilterModel]);
  const handleCellMouseDown = useCallback((rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    const row = displayedRows[rowIndex];
    const column = columns[colIndex];
    if (row && column) {
      focusCell(row.id, column.field);
    }
    handleRangeMouseDown(rowIndex, colIndex, e);
  }, [displayedRows, columns, focusCell, handleRangeMouseDown]);
  const rowEventRef = useRef({
    rowSelection,
    selectRow,
    isRowDragging,
    isDraggingRows,
    onRowClickFallback,
    onRowClicked,
    onRowDoubleClicked,
    onCellClicked,
    detectRowClick,
    detectCellClick,
    api,
    fireEvent,
    focusCell,
  });
  rowEventRef.current.rowSelection = rowSelection;
  rowEventRef.current.selectRow = selectRow;
  rowEventRef.current.isRowDragging = isRowDragging;
  rowEventRef.current.isDraggingRows = isDraggingRows;
  rowEventRef.current.onRowClickFallback = onRowClickFallback;
  rowEventRef.current.onRowClicked = onRowClicked;
  rowEventRef.current.onRowDoubleClicked = onRowDoubleClicked;
  rowEventRef.current.onCellClicked = onCellClicked;
  rowEventRef.current.detectRowClick = detectRowClick;
  rowEventRef.current.detectCellClick = detectCellClick;
  rowEventRef.current.api = api;
  rowEventRef.current.fireEvent = fireEvent;
  rowEventRef.current.focusCell = focusCell;
  const handleRowClick = useCallback(
    (rowId: string, e: React.MouseEvent, fromCell = false) => {
      const ctx = rowEventRef.current;
      if (ctx.isRowDragging || ctx.isDraggingRows) return;
      const target = e.target as HTMLElement;
      const isCheckboxColumn = !!target.closest('.fibogrid-checkbox-column');
      const isCheckboxElement = target.getAttribute('role') === 'checkbox' ||
        (target.tagName === 'BUTTON' && target.getAttribute('role') === 'checkbox');
      const isCheckboxInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox' && isCheckboxColumn;
      const isCheckboxClick = isCheckboxColumn || isCheckboxElement || isCheckboxInput;
      if (ctx.rowSelection && !isCheckboxClick) {
        const isShift = e.shiftKey;
        const isCtrl = e.ctrlKey || e.metaKey;
        if (ctx.rowSelection === 'single') {
          ctx.selectRow(rowId, true, isShift, isCtrl);
        } else {
          if (!isShift && !isCtrl) {
            const currentlySelected = selectionRef.current.selectedRows.has(rowId);
            ctx.selectRow(rowId, !currentlySelected, false, false);
          } else {
            ctx.selectRow(rowId, true, isShift, isCtrl);
          }
        }
      }
      if (!ctx.onRowClickFallback) return;
      const row = displayedRowsRef.current.find(r => r.id === rowId);
      if (!row) return;
      const currentSelection = selectionRef.current;
      let futureSelected = currentSelection.selectedRows.has(row.id);
      if (ctx.rowSelection && !isCheckboxClick) {
        const isShift = e.shiftKey;
        if (ctx.rowSelection === 'single') {
          futureSelected = true;
        } else {
          if (!isShift) {
            futureSelected = !futureSelected;
          }
          if (isShift) futureSelected = true;
        }
      }
      ctx.detectRowClick((clickType) => {
        const latest = rowEventRef.current;
        if (!fromCell && latest.onRowClickFallback) {
          latest.onRowClickFallback({
            clickType,
            rowData: row.data,
            allRowsData: displayedRowsRef.current.map(r => r.data),
            rowNode: { ...row, selected: futureSelected },
            event: e,
            api: latest.api,
          });
        }
        latest.fireEvent('rowClicked', {
          rowNode: { ...row, selected: futureSelected },
          event: e,
          api: latest.api,
        });
        latest.onRowClicked?.({
          rowNode: { ...row, selected: futureSelected },
          event: e,
          api: latest.api,
        });
      });
    },
    []
  );
  const handleRowDoubleClick = useCallback((rowId: string, e: React.MouseEvent) => {
    const ctx = rowEventRef.current;
    if (!ctx.onRowDoubleClicked) return;
    const row = displayedRowsRef.current.find(r => r.id === rowId);
    if (!row) return;
    ctx.onRowDoubleClicked({ rowNode: row, event: e, api: ctx.api });
  }, []);
  const handleRowContextMenu = useCallback((rowId: string, e: React.MouseEvent) => {
    const ctx = rowEventRef.current;
    if (!ctx.onRowClickFallback) return;
    const rows = displayedRowsRef.current;
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    const isCurrentlySelected = selectionRef.current.selectedRows.has(row.id);
    ctx.onRowClickFallback({
      clickType: 'menu',
      rowData: row.data,
      allRowsData: rows.map(r => r.data),
      rowNode: { ...row, selected: isCurrentlySelected },
      event: e,
      api: ctx.api,
    });
  }, []);
  const handleCellClick = useCallback((rowId: string, col: ProcessedColumn<T>, e: React.MouseEvent) => {
    e.stopPropagation();
    handleRowClick(rowId, e, true);
    const row = displayedRowsRef.current.find(r => r.id === rowId);
    if (!row) return;
    const ctx = rowEventRef.current;
    const currentSelection = selectionRef.current;
    const isCurrentlySelected = currentSelection.selectedRows.has(row.id);
    let futureSelected = isCurrentlySelected;
    if (ctx.rowSelection && !ctx.isRowDragging && !ctx.isDraggingRows) {
      const target = e.target as HTMLElement;
      const isCheckboxClick = !!target.closest('.fibogrid-checkbox-column');
      if (!isCheckboxClick) {
        if (ctx.rowSelection === 'single') {
          futureSelected = true;
        } else {
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
            futureSelected = !isCurrentlySelected;
          } else {
            futureSelected = true;
          }
        }
      }
    }
    ctx.focusCell(row.id, col.field);
    ctx.onCellClicked?.({
      rowNode: { ...row, selected: futureSelected },
      column: col,
      value: (row.data as any)[col.field],
      event: e,
      api: ctx.api,
    });
    if (!ctx.onRowClickFallback) return;
    ctx.detectCellClick((clickType) => {
      const latest = rowEventRef.current;
      if (!latest.onRowClickFallback) return;
      latest.onRowClickFallback({
        clickType,
        rowData: row.data,
        allRowsData: displayedRowsRef.current.map(r => r.data),
        rowNode: { ...row, selected: futureSelected },
        event: e,
        api: latest.api,
        cell: {
          column: col,
          value: getValueFromPath(row.data, col.field),
          isEditable: !!col.editable,
        },
      });
    });
  }, [handleRowClick]);
  const prevSelectedIdsRef = useRef<Set<string> | null>(null);
  const prevSelectedRowsRef = useRef<RowNode<T>[] | undefined>(undefined);
  useEffect(() => {
    if (onSelectionChanged) {
      const currentIds = selection.selectedRows;
      const prevIds = prevSelectedIdsRef.current;
      let changed = !prevIds || currentIds.size !== prevIds.size;
      if (!changed && prevIds) {
        for (const id of currentIds) {
          if (!prevIds.has(id)) {
            changed = true;
            break;
          }
        }
      }
      if (changed) {
        prevSelectedIdsRef.current = new Set(currentIds);
        const selectedRows = displayedRows.filter((r) => selection.selectedRows.has(r.id));
        const oldSelectedRows = prevSelectedRowsRef.current;
        prevSelectedRowsRef.current = selectedRows;
        onSelectionChanged({ selectedRows, oldSelectedRows, api });
      }
    }
  }, [selection.selectedRows, displayedRows, api, onSelectionChanged]);
  const allSelected = useMemo(
    () =>
      displayedRows.length > 0 &&
      displayedRows.every((r) => selection.selectedRows.has(r.id)),
    [displayedRows, selection.selectedRows]
  );
  const someSelected = useMemo(
    () => displayedRows.some((r) => selection.selectedRows.has(r.id)),
    [displayedRows, selection.selectedRows]
  );
  const getDefaultContextMenuItems = useCallback(
    (): ContextMenuItem[] => {
      const contextMenuLabels = (lang as { contextMenu?: { copy?: string; exportCsv?: string; deleteSelected?: string } }).contextMenu;
      return [
        {
          name: contextMenuLabels?.copy ?? 'Copy',
          icon: <Copy className="h-4 w-4" />,
          action: () => api.copyToClipboard(),
        },
        {
          name: contextMenuLabels?.exportCsv ?? 'Export to CSV',
          icon: <Download className="h-4 w-4" />,
          action: () => api.exportToCsv(),
        },
        { name: '', action: () => { }, separator: true },
        {
          name: contextMenuLabels?.deleteSelected ?? 'Delete Selected',
          icon: <Trash2 className="h-4 w-4" />,
          action: () => {
            const selectedData = api.getSelectedRows().map((r) => r.data);
            api.updateRowData({ remove: selectedData });
          },
          disabled: selection.selectedRows.size === 0,
        },
      ];
    },
    [api, selection.selectedRows.size, lang]
  );
  const cellMenuRef = useRef({
    columns,
    rowSelection,
    selectRow,
    deselectAll,
    displayedRows,
    finalDisplayedRows,
    getContextMenuItems,
    getDefaultContextMenuItems,
    focusCell,
    api,
    setContextMenuItems,
    setContextMenuPosition,
  });
  cellMenuRef.current = {
    columns,
    rowSelection,
    selectRow,
    deselectAll,
    displayedRows,
    finalDisplayedRows,
    getContextMenuItems,
    getDefaultContextMenuItems,
    focusCell,
    api,
    setContextMenuItems,
    setContextMenuPosition,
  };
  const handleCellContextMenu = useCallback((
    row: RowNode<T> | number,
    column: ProcessedColumn<T> | number,
    event: React.MouseEvent,
  ) => {
    const ctx = cellMenuRef.current;
    const resolvedColumn = typeof column === 'number' ? ctx.columns[column] : column;
    if (!resolvedColumn) return;
    let resolvedRow: RowNode<T> | undefined;
    if (typeof row === 'number') {
      const target = event.target;
      const rowEl = target instanceof Element ? target.closest('[role="row"]') : null;
      const preferChild = rowEl?.classList.contains('fibogrid-row-child') ?? false;
      const list = ctx.finalDisplayedRows;
      for (let i = 0; i < list.length; i++) {
        const candidate = list[i];
        if (isGroupNode(candidate) || candidate.rowIndex !== row) continue;
        const isChild = Boolean((candidate as { isChildRow?: boolean }).isChildRow);
        if (isChild === preferChild) {
          resolvedRow = candidate;
          break;
        }
        if (!resolvedRow) resolvedRow = candidate;
      }
    } else {
      resolvedRow = row;
    }
    if (!resolvedRow) return;
    const value = getValueFromPath(resolvedRow.data, resolvedColumn.field);
    ctx.focusCell(resolvedRow.id, resolvedColumn.field);
    const currentSelection = selectionRef.current;
    let newSelectedRows = new Set(currentSelection.selectedRows);
    if (ctx.rowSelection) {
      if (ctx.rowSelection === 'multiple') {
        if (currentSelection.selectedRows.has(resolvedRow.id)) {
        } else {
          newSelectedRows.add(resolvedRow.id);
          ctx.selectRow(resolvedRow.id, true);
        }
      } else {
        if (!currentSelection.selectedRows.has(resolvedRow.id)) {
          ctx.deselectAll();
          ctx.selectRow(resolvedRow.id, true);
          newSelectedRows = new Set([resolvedRow.id]);
        }
      }
    }
    const selectedData = ctx.displayedRows
      .filter((item) => newSelectedRows.has(item.id))
      .map((item) => item.data);
    const params = {
      api: ctx.api,
      column: resolvedColumn,
      colDef: resolvedColumn,
      node: resolvedRow,
      rowNode: resolvedRow,
      value,
      data: resolvedRow.data,
      rowIndex: resolvedRow.rowIndex,
      selectedRows: selectedData,
    };
    const items = ctx.getContextMenuItems
      ? ctx.getContextMenuItems(params)
      : ctx.getDefaultContextMenuItems();
    event.preventDefault();
    ctx.setContextMenuItems(items);
    ctx.setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, []);
  const expandRef = useRef({ toggleRowExpand, toggleGroupExpand });
  expandRef.current.toggleRowExpand = toggleRowExpand;
  expandRef.current.toggleGroupExpand = toggleGroupExpand;
  const handleToggleExpand = useCallback((rowId: string) => {
    expandRef.current.toggleRowExpand(rowId);
  }, []);
  const handleToggleGroupExpand = useCallback((rowId: string) => {
    expandRef.current.toggleGroupExpand(rowId);
  }, []);
  const rowExpandHandlersRef = useRef(new Map<string, () => void>());
  const groupExpandHandlersRef = useRef(new Map<string, () => void>());
  const expandHandlerForRow = (rowId: string) => {
    const cache = rowExpandHandlersRef.current;
    const existing = cache.get(rowId);
    if (existing) return existing;
    const handler = () => handleToggleExpand(rowId);
    cache.set(rowId, handler);
    return handler;
  };
  const expandHandlerForGroup = (rowId: string) => {
    const cache = groupExpandHandlersRef.current;
    const existing = cache.get(rowId);
    if (existing) return existing;
    const handler = () => handleToggleGroupExpand(rowId);
    cache.set(rowId, handler);
    return handler;
  };
  const handlePageChange = useCallback(
    (page: number) => {
      setPaginationState((prev) => {
        const newState = { ...prev, currentPage: page };
        return newState;
      });
    },
    [setPaginationState]
  );
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPaginationState((prev) => {
        const newState = { ...prev, pageSize: size, currentPage: 0 };
        return newState;
      });
    },
    [setPaginationState]
  );
  const handleColumnVisibilityChange = useCallback(
    (field: string, visible: boolean) => {
      api.setColumnVisible(field, visible);
    },
    [api]
  );
  const handleAddChildRow = useCallback((parentId: string) => {
    const parentRow = displayedRows.find(r => r.id === parentId);
    if (parentRow) {
      const childData = { ...parentRow.data, id: `${parentId}-child-${Date.now()}` } as T;
      addChildToRow(parentId, [childData]);
    }
  }, [displayedRows, addChildToRow]);
  const effectiveShowFilterRow = configs?.header?.filterRow ?? true;
  const currentFilterRowHeight = effectiveShowFilterRow ? (isCompact ? 26 : 36) : 0;
  const visibleColumnCount = useMemo(
    () => columns.reduce((count, column) => (column.hide ? count : count + 1), 0),
    [columns]
  );
  const filterColumnField = filterState?.column.field;
  const [filterPopoverValues, setFilterPopoverValues] = useState<unknown[]>([]);
  useEffect(() => {
    if (!filterColumnField) {
      setFilterPopoverValues([]);
      return;
    }
    const provided = filterValues?.[filterColumnField];
    if (provided) {
      setFilterPopoverValues(provided);
      return;
    }
    let cancelled = false;
    const values: unknown[] = [];
    let index = 0;
    let idleId = 0;
    let timerId = 0;
    const finish = () => {
      if (!cancelled) setFilterPopoverValues(values);
    };
    const step = (deadline?: IdleDeadline) => {
      if (cancelled) return;
      const start = performance.now();
      const budget = Math.max(deadline?.timeRemaining() ?? 8, 4);
      while (index < allRows.length && performance.now() - start < budget) {
        values.push(getValueFromPath(allRows[index]!.data, filterColumnField));
        index += 1;
      }
      if (index < allRows.length) {
        schedule();
        return;
      }
      finish();
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback((deadline) => step(deadline));
        return;
      }
      timerId = window.setTimeout(() => step(), 1);
    };
    schedule();
    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, [filterColumnField, filterValues, allRows]);
  const gridContent = (
    <div
      ref={containerRef}
      className={cn(
        'fibogrid',
        isDarkTheme && 'fibogrid-dark',
        appearance && appearance !== 'default' && `fibogrid-theme-${appearance}`,
        className,
        'relative flex flex-col rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50',
        isResizing && 'cursor-col-resize select-none',
        isSelecting && 'select-none cursor-crosshair',
        !showBorders && 'fibogrid-no-borders',
        showStripes && 'fibogrid-striped',
        isCompact && 'fibogrid-compact'
      )}
      style={{ height: height || '100%', minHeight }}
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      onMouseDown={(e) => {
        if (e.button !== 2) {
          setContextMenuPosition(null);
        }
      }}
    >
      {effectiveShowToolbar && (
        <GridToolbar
          api={internalApi}
          columns={columns}
          quickFilterValue={quickFilter}
          onQuickFilterChange={setQuickFilter}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          selectedCount={selection.selectedRows.size}
          totalCount={displayedRows.length}
          filterModel={filterModel}
          headerConfig={configs?.header}
          onResetFilters={filterModel.length > 0 ? () => {
            internalApi.setFilterModel([]);
            setQuickFilter('');
          } : undefined}
          className={className}
        />
      )}
      {(initialGroupByFields?.length ?? 0) > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--fibogrid-spacing-xs)',
            padding: 'var(--fibogrid-spacing-xs) var(--fibogrid-spacing-sm)',
            background: 'var(--fibogrid-surface)',
            borderBottom: '1px solid var(--fibogrid-toolbar-border-bottom)',
          }}
        >
          <button
            type="button"
            aria-label={lang.groups.expandAll}
            onClick={() => {
              (api as { expandAllGroups?: () => void; collapseAllGroups?: () => void }).expandAllGroups?.();
            }}
            style={{
              fontSize: 'var(--fibogrid-font-size-sm)',
              lineHeight: 1.2,
              padding: '2px 8px',
              borderRadius: 'var(--fibogrid-radius-sm)',
              border: '1px solid var(--fibogrid-button-border)',
              background: 'var(--fibogrid-button-bg)',
              color: 'var(--fibogrid-button-text)',
              cursor: 'pointer',
            }}
          >
            {lang.groups.expandAll}
          </button>
          <button
            type="button"
            aria-label={lang.groups.collapseAll}
            onClick={() => {
              (api as { expandAllGroups?: () => void; collapseAllGroups?: () => void }).collapseAllGroups?.();
            }}
            style={{
              fontSize: 'var(--fibogrid-font-size-sm)',
              lineHeight: 1.2,
              padding: '2px 8px',
              borderRadius: 'var(--fibogrid-radius-sm)',
              border: '1px solid var(--fibogrid-button-border)',
              background: 'var(--fibogrid-button-bg)',
              color: 'var(--fibogrid-button-text)',
              cursor: 'pointer',
            }}
          >
            {lang.groups.collapseAll}
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={cn('flex-1 overflow-auto', isServerPagePending && 'fibogrid-loading')}
          role="grid"
          aria-busy={isServerPagePending ? true : undefined}
          aria-multiselectable={rowSelection === 'multiple' ? true : undefined}
          aria-rowcount={paginationState.totalRows + 1}
          aria-colcount={visibleColumnCount}
          onScroll={handleViewportScroll}
        >
          <div style={{ minWidth: totalContentWidth }}>
            <div className="sticky top-0 z-10">
              <GridHeader
                api={internalApi}
                columns={columns}
                sortModel={sortModel}
                filterModel={filterModel}
                onSort={handleSort}
                onResizeStart={handleResizeStart}
                onResizeDoubleClick={handleResizeDoubleClick}
                resizingColumn={resizingColumn}
                onDragStart={handleColumnDragStart}
                onDragOver={handleColumnDragOver}
                onDragEnd={handleColumnDragEnd}
                onDrop={handleColumnDrop}
                draggedColumn={draggedColumn}
                dragOverColumn={dragOverColumn}
                showCheckboxColumn={!hasCustomCheckbox && configs?.center?.checkboxSelection !== false && !!rowSelection}
                allSelected={allSelected}
                someSelected={someSelected}
                onSelectAll={() => (allSelected ? deselectAll() : selectAll())}
                onFilterClick={handleFilterClick}
                onQuickColumnFilter={handleQuickColumnFilter}
                headerHeight={headerHeight}
                measureColumnContent={measureColumnContent}
                showRowNumbers={!hasCustomRowNumber && effectiveShowRowNumbers}
                onPinColumn={handlePinColumn}
                onHideColumn={handleHideColumn}
                onAutoSize={handleAutoSize}
                onAutoSizeAll={handleAutoSizeAll}
                showFilterRow={effectiveShowFilterRow}
                compact={isCompact}
                className={className}
                locale={lang}
              />
            </div>
              <div style={{ height: totalHeight, position: 'relative', opacity: isServerPagePending ? 0.55 : undefined }}>
                <div style={{ transform: `translateY(${offsetTop}px)` }}>
                  {virtualRows.map((row, index) => {
                    if (!isGroupRow(row)) {
                      const isSelected = selection.selectedRows.has(row.id);
                      const regularRow = row as any;
                      return (
                        <GridRow
                          key={row.id}
                          row={row}
                          columns={columns}
                          rowHeight={rowHeight}
                          isSelected={isSelected}
                          onRowClick={handleRowClick}
                          onRowDoubleClick={onRowDoubleClicked ? handleRowDoubleClick : NOOP}
                          onContextMenu={handleRowContextMenu}
                          onCellClick={handleCellClick}
                          onCellDoubleClick={(col, e) => {
                            let isEditable = col.editable;
                            if (typeof isEditable === 'function') {
                              isEditable = isEditable({
                                value: getValueFromPath(row.data, col.field),
                                data: row.data,
                                rowIndex: row.rowIndex,
                                colDef: col,
                                column: col,
                                api,
                                rowNode: row
                              });
                            }
                            if (isEditable) internalApi.startEditingCell(row.id, col.field);
                            onCellDoubleClicked?.({ rowNode: row, column: col, value: getValueFromPath(row.data, col.field), event: e, api });
                          }}
                          showCheckboxColumn={!hasCustomCheckbox && configs?.center?.checkboxSelection !== false && !!rowSelection}
                          onCheckboxChange={(checked) => {
                            selectRow(row.id, checked);
                            onRowSelected?.({ rowNode: row, selected: checked, api });
                          }}
                          editingCell={editingCell}
                          onStartEdit={(field) => {
                            const value = getValueFromPath(row.data, field);
                            const edit: EditingCell = {
                              rowId: row.id,
                              field,
                              value,
                              originalValue: value,
                            };
                            editingCellRef.current = edit;
                            internalApi.startEditingCell(row.id, field);
                          }}
                          onEditChange={(value) => {
                            setEditingCell((prev) => {
                              const next = prev ? { ...prev, value } : null;
                              editingCellRef.current = next;
                              return next;
                            });
                          }}
                          onStopEdit={(cancel, currentValue) => {
                            const currentEditing = editingCellRef.current;
                            if (currentEditing && !cancel && currentValue !== undefined) {
                              const column = columns.find((c) => c.field === currentEditing.field);
                              if (!column) {
                                editingCellRef.current = null;
                                api.stopEditing(cancel);
                                restoreGridFocus();
                                return;
                              }
                              let isValid = true;
                              if (column.valueSetter) {
                                isValid = column.valueSetter({
                                  oldValue: currentEditing.originalValue,
                                  newValue: currentValue,
                                  data: row.data,
                                  column,
                                  api,
                                });
                              }
                              if (isValid) {
                                currentEditing.value = currentValue;
                                editingCellRef.current = currentEditing;
                                onCellValueChanged?.({
                                  rowNode: { ...row, data: setValueAtPath(row.data, currentEditing.field, currentValue) },
                                  column,
                                  oldValue: currentEditing.originalValue,
                                  newValue: currentValue,
                                  api,
                                });
                              } else {
                                console.warn(`Validation failed for ${column.field}`);
                              }
                            }
                            editingCellRef.current = null;
                            api.stopEditing(cancel);
                            restoreGridFocus();
                          }}
                          rowDragEnabled={rowDragEnabled && !rangeCellSelection}
                          onRowDragStart={(e) => handleRowDragStart(e, row)}
                          onRowDragOver={(e) => handleRowDragOver(e, row)}
                          onRowDragEnd={handleRowDragEnd}
                          onRowDrop={(e) => handleRowDrop(e, row)}
                          isDragging={draggedRow === row.id}
                          isDropTarget={dropTargetRow === row.id}
                          dropPosition={dropTargetRow === row.id ? dropPosition : null}
                          isCellSelected={isCellSelected}
                          isCellFocused={isCellFocused}
                          onCellMouseDown={handleCellMouseDown}
                          onCellMouseEnter={handleCellMouseEnter}
                          api={internalApi}
                          isEven={index % 2 === 0}
                          level={regularRow.level || 0}
                          hasChildren={regularRow.childRows?.length > 0}
                          isExpanded={expandedRows.has(row.id)}
                          onToggleExpand={expandHandlerForRow(row.id)}
                          registerCellRef={registerCellRef}
                          showRowNumbers={!hasCustomRowNumber && effectiveShowRowNumbers}
                          rowNumber={row.rowIndex + 1}
                          getRowClass={getRowClass}
                          onAddChildRow={handleAddChildRow}
                          onRowRangeMouseDown={handleRowRangeMouseDown}
                          onRowRangeMouseEnter={handleRowRangeMouseEnter}
                          onCellContextMenu={handleCellContextMenu}
                        />
                      );
                    }
                    const groupRow = row as unknown as GroupRowNode<T>;
                    const isExpanded = expandedGroups.has(row.id);
                    return (
                      <GroupRow
                        key={row.id}
                        row={groupRow}
                        columns={columns}
                        rowHeight={rowHeight}
                        isExpanded={isExpanded}
                        onToggleExpand={expandHandlerForGroup(row.id)}
                        showCheckboxColumn={!!rowSelection}
                        allChildrenSelected={groupRow.groupChildren.every((child) => selection.selectedRows.has(child.id))}
                        someChildrenSelected={groupRow.groupChildren.some((child) => selection.selectedRows.has(child.id))}
                        onSelectAll={(selected) => {
                          groupRow.groupChildren.forEach((child) => selectRow(child.id, selected));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
          </div>
        </div>
      </div>
      {contextMenu && (
        <GridContextMenu
          items={contextMenuItems}
          position={contextMenuPosition}
          onClose={() => setContextMenuPosition(null)}
          className={className}
        />
      )}
      <div className="flex-none">
        {(effectiveShowPagination || effectiveShowStatusBar) && (
          <GridFooter
            displayedRows={displayedRows}
            totalRows={paginationState.totalRows}
            selectedCount={selection.selectedRows.size}
            columns={columns}
            aggregations={groupAggregations as any}
            paginationState={paginationState}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={paginationPageSizeOptions}
            config={{
              ...configs?.footer,
              zIndex: configs?.zIndex,
              layout: configs?.footer?.layout || [
                ...(effectiveShowPagination && paginationState.enabled ? ['pagination'] as const : []),
                ...(effectiveShowStatusBar && footerInfo ? ['status-bar'] as const : [])
              ]
            }}
          />
        )}
      </div>
      {isLoading && (
        <GridOverlay
          type="loading"
          customComponent={loadingOverlayComponent}
          headerHeight={headerHeight}
          toolbarHeight={showToolbar ? toolbarHeight : 0}
          filterRowHeight={currentFilterRowHeight}
        />
      )}
      {!isLoading && displayedRows.length === 0 && (
        <GridOverlay
          type="noRows"
          customComponent={noRowsOverlayComponent}
          headerHeight={headerHeight}
          toolbarHeight={showToolbar ? toolbarHeight : 0}
          filterRowHeight={currentFilterRowHeight}
        />
      )}
      {filterState && (() => {
        const columnField = filterState.column.field;
        return (
          <FilterPopover
            column={filterState.column}
            currentFilter={filterModel.find((f) => f.field === columnField)}
            onFilterChange={handleFilterChange}
            onClose={handleCloseFilter}
            allValues={filterPopoverValues}
            onSort={(direction) => {
              setSortModel([{ field: columnField, direction }]);
              handleCloseFilter();
            }}
            anchorRect={filterState.anchorRect}
            containerRef={containerRef}
            enableVirtualization={enableFilterValueVirtualization}
            className={className}
          />
        );
      })()}
    </div>
  );
  const content = gridContent;
  return (
    <GridProvider locale={lang}>
      {content}
    </GridProvider>
  );
}
