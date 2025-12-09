import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { FiboGridProps, ProcessedColumn, SortModel, FilterModel, ContextMenuItem, RowNode, EditingCell } from './types';
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
import { useGrouping } from './hooks/useGrouping';
import { useGridContext } from './context/GridContext';
import { GridHeader } from './components/GridHeader';
import { GridRow } from './components/GridRow';
import { GroupRow } from './components/GroupRow';
import { GridPagination } from './components/GridPagination';
import { GridOverlay } from './components/GridOverlay';
import { FilterPopover } from './components/FilterPopover';
import { GridContextMenu } from './components/ContextMenu';
import { GridToolbar } from './components/GridToolbar';
import { GridStatusBar } from './components/GridStatusBar';
import { isGroupNode, GroupRowNode } from './utils/grouping';
import { cn } from '@/lib/utils';
import { Copy, Download, Trash2 } from 'lucide-react';

interface FilterState<T> {
  column: ProcessedColumn<T>;
  anchorRect: DOMRect;
}

export function FiboGrid<T extends object>(props: FiboGridProps<T>) {
  const {
    rowHeight = 40,
    headerHeight = 44,
    rowBuffer = 10,
    pagination = false,
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
    contextMenu = true,
    getContextMenuItems,
    showToolbar = true,
    showStatusBar = true,
    showRowNumbers = false,
    enableFilterValueVirtualization = false,
    filterValues,
    height,
    gridId,
    groupByFields: initialGroupByFields,
    splitByField,
    groupAggregations,
    treeData,
    getChildRows,
    childRowsField,
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
    onRowClickFallback,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const cellContentRefs = useRef<Map<string, Map<string, HTMLElement>>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [filterState, setFilterState] = useState<FilterState<T> | null>(null);

  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [contextMenuTarget, setContextMenuTarget] = useState<any>(null); // State to hold inner clicked cell data
  
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
    setColumnOrder,
    setColumnWidths,
    setColumnPinned,
    serverSideLoading,
  } = useGridState({ ...props, quickFilterText: quickFilterValue }, containerWidth);

  const isLoading = loading || serverSideLoading;

  useEffect(() => {
    editingCellRef.current = editingCell;
  }, [editingCell]);

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
  } = useGrouping({
    rows: displayedRows,
    groupByFields: initialGroupByFields,
    splitByField,
    aggregations: groupAggregations,
    getRowId: props.getRowId,
  });

  const finalDisplayedRows = useMemo(() => {
    return groupByFields.length > 0 || splitByField ? groupedDisplayRows : displayedRows;
  }, [groupByFields, splitByField, groupedDisplayRows, displayedRows]);

  const gridContext = useGridContext<T>();
  
  useEffect(() => {
    if (gridContext && gridId) {
      gridContext.registerGrid(gridId, api);
      return () => gridContext.unregisterGrid(gridId);
    }
  }, [gridContext, gridId, api]);

  useEffect(() => {
    onGridReady?.({ api });
  }, [api, onGridReady]);

  const effectiveContainerHeight = typeof height === 'number' ? height : (containerHeight || 600);
  const toolbarHeight = showToolbar ? 48 : 0;
  const statusBarHeight = showStatusBar ? 36 : 0;
  const paginationHeight = pagination ? 52 : 0;
  const bodyHeight = effectiveContainerHeight - headerHeight - toolbarHeight - statusBarHeight - paginationHeight;

  const totalContentWidth = useMemo(() => {
    const checkboxWidth = rowSelection ? 48 : 0;
    const rowNumberWidth = showRowNumbers ? 50 : 0;
    const columnsWidth = columns.reduce((sum, col) => sum + col.computedWidth, 0);
    return checkboxWidth + rowNumberWidth + columnsWidth;
  }, [columns, rowSelection, showRowNumbers]);

  const virtualizationHeight = Math.max(bodyHeight, 400);
  
  const {
    virtualRows,
    totalHeight,
    offsetTop,
    handleScroll,
    containerRef: scrollContainerRef,
  } = useVirtualization(finalDisplayedRows as RowNode<T>[], {
    rowHeight,
    overscan: rowBuffer,
    containerHeight: virtualizationHeight,
  });

  const { isResizing, resizingColumn, handleResizeStart, handleResizeDoubleClick } = useColumnResize(
    (field, width) => {
      setColumnWidths((prev) => ({ ...prev, [field]: width }));
      const column = columns.find((c) => c.field === field);
      if (column) {
        onColumnResized?.({ column, newWidth: width });
      }
    }
  );

  const measureColumnContent = useCallback((field: string): number => {
    const columnCells = cellContentRefs.current.get(field);
    if (!columnCells || columnCells.size === 0) return 100;
    
    let maxWidth = 0;
    columnCells.forEach((cell) => {
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      span.style.fontSize = getComputedStyle(cell).fontSize;
      span.style.fontFamily = getComputedStyle(cell).fontFamily;
      span.textContent = cell.textContent || '';
      document.body.appendChild(span);
      
      const width = span.offsetWidth;
      document.body.removeChild(span);
      
      if (width > maxWidth) maxWidth = width;
    });
    
    return Math.max(80, maxWidth);
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
        api.updateRowData({
          remove: [displayedRows.find((r) => r.id === fromId)?.data as T],
        });
        const targetIndex = displayedRows.findIndex((r) => r.id === toId);
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        const movedRow = displayedRows.find((r) => r.id === fromId)?.data;
        if (movedRow) {
          const newData = [...props.rowData];
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
    isCellSelected,
    handleCellMouseDown,
    handleCellMouseEnter,
    isSelecting,
  } = rangeCellSelection ? rangeSelectionHook : {
    isCellSelected: () => false,
    handleCellMouseDown: () => {},
    handleCellMouseEnter: () => {},
    isSelecting: false,
  };

  const {
    isDraggingRows,
    handleRowMouseDown: handleRowRangeMouseDown,
    handleRowMouseEnter: handleRowRangeMouseEnter,
  } = useRowRangeSelection();

  const { detectClick: detectRowClick } = useClickDetector({ doubleClickDelay: 300 });
  const { detectClick: detectCellClick } = useClickDetector({ doubleClickDelay: 300 });

  const {
    focusedCell,
    focusCell,
    isCellFocused,
  } = useKeyboardNavigation({
    containerRef,
    displayedRows,
    columns,
    api,
    onStartEdit: (rowId, field) => api.startEditingCell(rowId, field),
    onStopEdit: (cancel) => api.stopEditing(cancel),
    isEditing: !!editingCell,
  });

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

        onSortChanged?.({ sortModel: newModel });
        return newModel;
      });
    },
    [setSortModel, onSortChanged]
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
        onFilterChanged?.({ filterModel: newModel });
        return newModel;
      });
    },
    [setFilterModel, filterState, onFilterChanged]
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

  const handleRowClick = useCallback(
    (rowId: string, e: React.MouseEvent) => {
      if (isRowDragging || isDraggingRows) return;
      
      if (rowSelection) {
        selectRow(rowId, true, e.shiftKey, e.ctrlKey || e.metaKey);
      }
      
      if (onRowClickFallback) {
        const row = displayedRows.find(r => r.id === rowId);
        if (row) {
          detectRowClick((clickType) => {
            onRowClickFallback({
              clickType,
              rowData: row.data,
              allRowsData: displayedRows.map(r => r.data),
              rowNode: row,
              event: e,
              api,
            });
          });
        }
      }
    },
    [rowSelection, selectRow, isRowDragging, isDraggingRows, onRowClickFallback, displayedRows, detectRowClick, api]
  );

  useEffect(() => {
    if (onSelectionChanged) {
      const selectedRows = displayedRows.filter((r) => selection.selectedRows.has(r.id));
      onSelectionChanged({ selectedRows, api });
    }
  }, [selection.selectedRows, displayedRows, api, onSelectionChanged]);

  const allSelected =
    displayedRows.length > 0 &&
    displayedRows.every((r) => selection.selectedRows.has(r.id));
  const someSelected = displayedRows.some((r) => selection.selectedRows.has(r.id));

  const getDefaultContextMenuItems = useCallback(
    (): ContextMenuItem[] => [
      {
        name: 'Copy',
        icon: <Copy className="h-4 w-4" />,
        action: () => api.copyToClipboard(),
      },
      {
        name: 'Export to CSV',
        icon: <Download className="h-4 w-4" />,
        action: () => api.exportToCsv(),
      },
      { name: '', action: () => {}, separator: true },
      {
        name: 'Delete Selected',
        icon: <Trash2 className="h-4 w-4" />,
        action: () => {
          const selectedData = api.getSelectedRows().map((r) => r.data);
          api.updateRowData({ remove: selectedData });
        },
        disabled: selection.selectedRows.size === 0,
      },
    ],
    [api, selection.selectedRows.size]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPaginationState((prev) => {
        const newState = { ...prev, currentPage: page };
        onPaginationChanged?.(newState);
        return newState;
      });
    },
    [setPaginationState, onPaginationChanged]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPaginationState((prev) => {
        const newState = { ...prev, pageSize: size, currentPage: 0 };
        onPaginationChanged?.(newState);
        return newState;
      });
    },
    [setPaginationState, onPaginationChanged]
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

  const gridContent = (
    <div
      ref={containerRef}
      className={cn(
        'fibogrid',
        className, // Theme class should come before Tailwind classes to ensure proper CSS specificity
        'relative flex flex-col rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50',
        isResizing && 'cursor-col-resize select-none',
        isSelecting && 'select-none cursor-crosshair'
      )}
      style={{ height: height || '100%', minHeight: 400 }}
      tabIndex={0}
    >
      {showToolbar && (
        <GridToolbar
          api={api}
          columns={columns}
          quickFilterValue={quickFilterValue}
          onQuickFilterChange={setQuickFilterValue}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          selectedCount={selection.selectedRows.size}
          totalCount={displayedRows.length}
          filterModel={filterModel}
            onResetFilters={filterModel.length > 0 ? () => {
              api.setFilterModel([]);
              setQuickFilterValue('');
            } : undefined}
            className={className}
          />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          onScroll={handleScroll}
        >
          <div style={{ minWidth: totalContentWidth }}>
            <div className="sticky top-0 z-10">
              <GridHeader
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
                showCheckboxColumn={!!rowSelection}
                allSelected={allSelected}
                someSelected={someSelected}
                onSelectAll={() => (allSelected ? deselectAll() : selectAll())}
                onFilterClick={handleFilterClick}
                onQuickColumnFilter={handleQuickColumnFilter}
                headerHeight={headerHeight}
                measureColumnContent={measureColumnContent}
                showRowNumbers={showRowNumbers}
                onPinColumn={handlePinColumn}
                onHideColumn={handleHideColumn}
                onAutoSize={handleAutoSize}
                onAutoSizeAll={handleAutoSizeAll}
                showFilterRow={true}
                className={className}
              />
            </div>

            <div style={{ height: totalHeight, position: 'relative' }}>
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
                        onRowClick={(e) => handleRowClick(row.id, e)}
                        onRowDoubleClick={onRowDoubleClicked ? (e) => onRowDoubleClicked({ rowNode: row, event: e, api }) : () => {}}
                        onCellClick={(col, e) => {
                          e.stopPropagation();
                          
                          if (rowSelection && !isRowDragging && !isDraggingRows) {
                            selectRow(row.id, true, e.shiftKey, e.ctrlKey || e.metaKey);
                          }
                          
                          focusCell(row.id, col.field);
                          onCellClicked?.({ rowNode: row, column: col, value: (row.data as any)[col.field], event: e, api });
                          
                          if (onRowClickFallback) {
                            detectCellClick((clickType) => {
                              onRowClickFallback({
                                clickType,
                                rowData: row.data,
                                allRowsData: displayedRows.map(r => r.data),
                                rowNode: row,
                                event: e,
                                api,
                                cell: {
                                  column: col,
                                  value: (row.data as any)[col.field],
                                  isEditable: !!col.editable,
                                },
                              });
                            });
                          }
                        }}
                        onCellDoubleClick={(col, e) => {
                          if (col.editable) api.startEditingCell(row.id, col.field);
                          onCellDoubleClicked?.({ rowNode: row, column: col, value: (row.data as any)[col.field], event: e, api });
                        }}
                        showCheckboxColumn={!!rowSelection}
                        onCheckboxChange={(checked) => {
                          selectRow(row.id, checked);
                          onRowSelected?.({ rowNode: row, selected: checked, api });
                        }}
                        editingCell={editingCell}
                        onStartEdit={(field) => {
                          const value = (row.data as any)[field];
                          const edit: EditingCell = {
                            rowId: row.id,
                            field,
                            value,
                            originalValue: value,
                          };
                          editingCellRef.current = edit;
                          api.startEditingCell(row.id, field);
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
                            currentEditing.value = currentValue;
                            editingCellRef.current = currentEditing;
                            
                            onCellValueChanged?.({
                              rowNode: { ...row, data: { ...row.data, [currentEditing.field]: currentValue } },
                              column: columns.find((c) => c.field === currentEditing.field)!,
                              oldValue: currentEditing.originalValue,
                              newValue: currentValue,
                              api,
                            });
                          }
                          editingCellRef.current = null;
                          api.stopEditing(cancel);
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
                        api={api}
                        isEven={index % 2 === 0}
                        level={regularRow.level || 0}
                        hasChildren={regularRow.childRows?.length > 0}
                        isExpanded={expandedRows.has(row.id)}
                        onToggleExpand={() => toggleRowExpand(row.id)}
                        registerCellRef={registerCellRef}
                        showRowNumbers={showRowNumbers}
                        rowNumber={row.rowIndex + 1}
                        onAddChildRow={handleAddChildRow}
                        onRowRangeMouseDown={handleRowRangeMouseDown}

                        onRowRangeMouseEnter={handleRowRangeMouseEnter}
                        onCellContextMenu={(rowIndex, colIndex, e) => {
                          // Do NOT prevent default here, as it blocks Radix UI ContextMenuTrigger from seeing the event
                          // e.preventDefault(); 
                          
                          const column = columns[colIndex];
                          const value = (row.data as any)[column.field];

                          // Selection Logic on Right Click
                          
                          // 1. Always focus the clicked cell
                          focusCell(row.id, column.field);

                          // 2. Handle Row Selection
                          // 2. Handle Row Selection
                          if (rowSelection) {
                             if (rowSelection === 'multiple') {
                               // User request: Right click acts as a toggle in multi-select mode (no modifiers needed)
                               selectRow(row.id, true);
                             } else {
                               // Single selection behavior
                               const isAlreadySelected = selection.selectedRows.has(row.id);
                               if (!isAlreadySelected) {
                                 deselectAll();
                                 selectRow(row.id, true);
                               }
                             }
                          }

                          setContextMenuTarget({
                            value,
                            data: row.data,
                            rowIndex: row.rowIndex,
                            colDef: column,
                            column,
                            api,
                          });
                        }}
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
                      onToggleExpand={() => toggleGroupExpand(row.id)}
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

      {pagination && (
        <GridPagination
          pagination={paginationState}
          pageSizeOptions={paginationPageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          className={className}
        />
      )}

      {showStatusBar && (
        <GridStatusBar
          displayedRows={displayedRows}
          totalRows={paginationState.totalRows}
          selectedCount={selection.selectedRows.size}
          columns={columns}
        />
      )}

      {isLoading && (
        <GridOverlay 
          type="loading" 
          customComponent={loadingOverlayComponent} 
          headerHeight={headerHeight}
          toolbarHeight={showToolbar ? toolbarHeight : 0}
          filterRowHeight={36}
        />
      )}
      {!isLoading && displayedRows.length === 0 && (
        <GridOverlay 
          type="noRows" 
          customComponent={noRowsOverlayComponent}
          headerHeight={headerHeight}
          toolbarHeight={showToolbar ? toolbarHeight : 0}
          filterRowHeight={36}
        />
      )}

      {filterState && (() => {
        const columnField = filterState.column.field;
        const allValues = filterValues?.[columnField] 
          ? filterValues[columnField]
          : allRows.map((r) => (r.data as any)[columnField]);
        
        return (
          <FilterPopover
            column={filterState.column}
            currentFilter={filterModel.find((f) => f.field === columnField)}
            onFilterChange={handleFilterChange}
            onClose={handleCloseFilter}
            allValues={allValues}
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

  if (contextMenu) {
    const defaultParams = { api, column: null, node: null, value: null, data: null, selectedRows: [] };
    
    // Get currently selected rows data for the context menu
    const selectedRowsData = displayedRows
      .filter((r) => selection.selectedRows.has(r.id))
      .map((r) => r.data);

    const params = contextMenuTarget 
      ? { ...contextMenuTarget, api, selectedRows: selectedRowsData } 
      : { ...defaultParams, selectedRows: selectedRowsData };

    const items = getContextMenuItems
      ? getContextMenuItems(params)
      : getDefaultContextMenuItems();
    return <GridContextMenu items={items} className={className}>{gridContent}</GridContextMenu>;
  }

  return gridContent;
}
