import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { DataGridProps, ProcessedColumn, SortModel, FilterModel, ContextMenuItem, RowNode } from './types';
import { useGridState } from './hooks/useGridState';
import { useVirtualization } from './hooks/useVirtualization';
import { useColumnResize } from './hooks/useColumnResize';
import { useColumnDrag } from './hooks/useColumnDrag';
import { useRowDrag } from './hooks/useRowDrag';
import { useRangeSelection } from './hooks/useRangeSelection';
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

export function DataGrid<T extends object>(props: DataGridProps<T>) {
  const {
    rowHeight = 40,
    headerHeight = 44,
    rowBuffer = 10,
    pagination = false,
    paginationPageSize = 100,
    paginationPageSizeOptions = [25, 50, 100, 250, 500],
    rowSelection,
    rowDragEnabled = false,
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
    height,
    gridId,
    // Grouping
    groupByFields: initialGroupByFields,
    splitByField,
    groupAggregations,
    // Tree data
    treeData,
    getChildRows,
    childRowsField,
    // Events
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
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const cellContentRefs = useRef<Map<string, Map<string, HTMLElement>>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [filterState, setFilterState] = useState<FilterState<T> | null>(null);
  const [quickFilterValue, setQuickFilterValue] = useState('');

  // Resize observer
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

  // Grid state
  const {
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
  } = useGridState({ ...props, quickFilterText: quickFilterValue }, containerWidth);

  // Grouping
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

  // Use grouped rows if grouping is enabled
  const finalDisplayedRows = useMemo(() => {
    return groupByFields.length > 0 || splitByField ? groupedDisplayRows : displayedRows;
  }, [groupByFields, splitByField, groupedDisplayRows, displayedRows]);

  // Grid context for shared state
  const gridContext = useGridContext<T>();
  
  useEffect(() => {
    if (gridContext && gridId) {
      gridContext.registerGrid(gridId, api);
      return () => gridContext.unregisterGrid(gridId);
    }
  }, [gridContext, gridId, api]);

  // Fire grid ready event
  useEffect(() => {
    onGridReady?.({ api });
  }, [api, onGridReady]);

  // Calculate heights
  const toolbarHeight = showToolbar ? 48 : 0;
  const statusBarHeight = showStatusBar ? 36 : 0;
  const paginationHeight = pagination ? 52 : 0;
  const bodyHeight = containerHeight - headerHeight - toolbarHeight - statusBarHeight - paginationHeight;

  // Calculate total content width for horizontal scroll
  const totalContentWidth = useMemo(() => {
    const checkboxWidth = rowSelection ? 48 : 0;
    const rowNumberWidth = showRowNumbers ? 50 : 0;
    const columnsWidth = columns.reduce((sum, col) => sum + col.computedWidth, 0);
    return checkboxWidth + rowNumberWidth + columnsWidth;
  }, [columns, rowSelection, showRowNumbers]);

  // Virtualization
  const {
    virtualRows,
    totalHeight,
    offsetTop,
    handleScroll,
    containerRef: scrollContainerRef,
  } = useVirtualization(finalDisplayedRows as RowNode<T>[], {
    rowHeight,
    overscan: rowBuffer,
    containerHeight: Math.max(bodyHeight, 100),
  });

  // Column resize with double-click support
  const { isResizing, resizingColumn, handleResizeStart, handleResizeDoubleClick } = useColumnResize(
    (field, width) => {
      setColumnWidths((prev) => ({ ...prev, [field]: width }));
      const column = columns.find((c) => c.field === field);
      if (column) {
        onColumnResized?.({ column, newWidth: width });
      }
    }
  );

  // Measure column content width
  const measureColumnContent = useCallback((field: string): number => {
    const columnCells = cellContentRefs.current.get(field);
    if (!columnCells) return 100;
    
    let maxWidth = 0;
    columnCells.forEach((cell) => {
      const width = cell.scrollWidth + 24; // padding
      if (width > maxWidth) maxWidth = width;
    });
    
    return Math.max(50, maxWidth);
  }, []);

  // Register cell refs for measuring
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

  // Column drag
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

  // Row drag
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

  // Range selection
  const {
    isCellSelected,
    handleCellMouseDown,
    handleCellMouseEnter,
  } = useRangeSelection();

  // Keyboard navigation
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

  // Sort handler
  const handleSort = useCallback(
    (field: string) => {
      setSortModel((prev) => {
        const existing = prev.find((s) => s.field === field);
        let newModel: SortModel[];

        if (!existing) {
          newModel = [...prev, { field, direction: 'asc' }];
        } else if (existing.direction === 'asc') {
          newModel = prev.map((s) =>
            s.field === field ? { ...s, direction: 'desc' as const } : s
          );
        } else {
          newModel = prev.filter((s) => s.field !== field);
        }

        onSortChanged?.({ sortModel: newModel });
        return newModel;
      });
    },
    [setSortModel, onSortChanged]
  );

  // Filter handler
  const handleFilterChange = useCallback(
    (filter: FilterModel | null) => {
      console.log('handleFilterChange called with:', filter);
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
        console.log('New filter model:', newModel);
        onFilterChanged?.({ filterModel: newModel });
        return newModel;
      });
    },
    [setFilterModel, filterState, onFilterChanged]
  );

  // Handle filter click from header
  const handleFilterClick = useCallback((column: ProcessedColumn<T>, anchorRect: DOMRect) => {
    setFilterState({ column, anchorRect });
  }, []);

  // Close filter
  const handleCloseFilter = useCallback(() => {
    setFilterState(null);
  }, []);

  // Column pin handler
  const handlePinColumn = useCallback((field: string, pinned: 'left' | 'right' | null) => {
    setColumnPinned(field, pinned);
  }, [setColumnPinned]);

  // Selection handlers
  const handleRowClick = useCallback(
    (rowId: string, e: React.MouseEvent) => {
      if (!rowSelection) return;
      selectRow(rowId, true, e.shiftKey, e.ctrlKey || e.metaKey);
    },
    [rowSelection, selectRow]
  );

  // Fire selection changed event
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

  // Default context menu items
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

  // Pagination change handler
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

  // Column visibility handler
  const handleColumnVisibilityChange = useCallback(
    (field: string, visible: boolean) => {
      api.setColumnVisible(field, visible);
    },
    [api]
  );

  // Add child row handler
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
        'relative flex flex-col border border-border rounded-lg overflow-hidden bg-background focus:outline-none focus:ring-2 focus:ring-primary/50',
        isResizing && 'cursor-col-resize select-none',
        className
      )}
      style={{ height: height || '100%', minHeight: 400 }}
      tabIndex={0}
    >
      {/* Toolbar */}
      {showToolbar && (
        <GridToolbar
          api={api}
          columns={columns}
          quickFilterValue={quickFilterValue}
          onQuickFilterChange={setQuickFilterValue}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          selectedCount={selection.selectedRows.size}
          totalCount={displayedRows.length}
        />
      )}

      {/* Scrollable container for header + body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          onScroll={handleScroll}
        >
          {/* Content wrapper with min-width for horizontal scroll */}
          <div style={{ minWidth: totalContentWidth }}>
            {/* Header */}
            <div className="sticky top-0 z-10">
              <GridHeader
                columns={columns}
                sortModel={sortModel}
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
                headerHeight={headerHeight}
                measureColumnContent={measureColumnContent}
                showRowNumbers={showRowNumbers}
                onPinColumn={handlePinColumn}
              />
            </div>

            {/* Body */}
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetTop}px)` }}>
                {virtualRows.map((row, index) => {
                  // Check if this is a split point
                  const isSplitPoint = splitPoints.includes(index);
                  
                  // Check if this is a group row
                  if (isGroupRow(row)) {
                    const groupRow = row as unknown as GroupRowNode<T>;
                    const isExpanded = expandedGroups.has(row.id);
                    const allChildrenSelected = groupRow.groupChildren.every(
                      (child) => selection.selectedRows.has(child.id)
                    );
                    const someChildrenSelected = groupRow.groupChildren.some(
                      (child) => selection.selectedRows.has(child.id)
                    );
                    
                    return (
                      <React.Fragment key={row.id}>
                        {isSplitPoint && (
                          <div className="h-2 bg-muted border-y border-border" />
                        )}
                        <GroupRow
                          row={groupRow}
                          columns={columns}
                          rowHeight={rowHeight}
                          isExpanded={isExpanded}
                          onToggleExpand={() => toggleGroupExpand(row.id)}
                          showCheckboxColumn={!!rowSelection}
                          allChildrenSelected={allChildrenSelected}
                          someChildrenSelected={someChildrenSelected}
                          onSelectAll={(selected) => {
                            groupRow.groupChildren.forEach((child) => {
                              selectRow(child.id, selected);
                            });
                          }}
                        />
                      </React.Fragment>
                    );
                  }
                  
                  // Check if this is a child row
                  const regularRow = row as any;
                  const isChildRow = regularRow.isChildRow || (regularRow.level && regularRow.level > 0);
                  const hasChildren = regularRow.childRows && regularRow.childRows.length > 0;
                  const isRowExpanded = expandedRows.has(row.id);
                  
                  return (
                    <React.Fragment key={row.id}>
                      {isSplitPoint && (
                        <div className="h-2 bg-muted border-y border-border" />
                      )}
                      <GridRow
                        row={row}
                        columns={columns}
                        rowHeight={rowHeight}
                        isSelected={selection.selectedRows.has(row.id)}
                        onRowClick={(e) => {
                          handleRowClick(row.id, e);
                          focusCell(row.id, columns[0]?.field || '');
                          onRowClicked?.({ rowNode: row, event: e, api });
                          
                          // Notify grid context for shared state
                          if (gridContext && gridId) {
                            gridContext.onRowSelect(gridId, row);
                          }
                        }}
                        onRowDoubleClick={(e) => {
                          onRowDoubleClicked?.({ rowNode: row, event: e, api });
                        }}
                        onCellClick={(col, e) => {
                          focusCell(row.id, col.field);
                          onCellClicked?.({
                            rowNode: row,
                            column: col,
                            value: (row.data as any)[col.field],
                            event: e,
                            api,
                          });
                        }}
                        onCellDoubleClick={(col, e) => {
                          if (col.editable) {
                            api.startEditingCell(row.id, col.field);
                          }
                          onCellDoubleClicked?.({
                            rowNode: row,
                            column: col,
                            value: (row.data as any)[col.field],
                            event: e,
                            api,
                          });
                        }}
                        showCheckboxColumn={!!rowSelection}
                        onCheckboxChange={(checked) => {
                          selectRow(row.id, checked);
                          onRowSelected?.({ rowNode: row, selected: checked, api });
                        }}
                        editingCell={editingCell}
                        onStartEdit={(field) => api.startEditingCell(row.id, field)}
                        onEditChange={(value) =>
                          setEditingCell((prev) => (prev ? { ...prev, value } : null))
                        }
                        onStopEdit={(cancel) => {
                          if (editingCell && !cancel) {
                            onCellValueChanged?.({
                              rowNode: row,
                              column: columns.find((c) => c.field === editingCell.field)!,
                              oldValue: editingCell.originalValue,
                              newValue: editingCell.value,
                              api,
                            });
                          }
                          api.stopEditing(cancel);
                        }}
                        rowDragEnabled={rowDragEnabled}
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
                        hasChildren={hasChildren}
                        isExpanded={isRowExpanded}
                        onToggleExpand={() => toggleRowExpand(row.id)}
                        registerCellRef={registerCellRef}
                        showRowNumbers={showRowNumbers}
                        rowNumber={row.rowIndex + 1}
                        onAddChildRow={handleAddChildRow}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <GridPagination
          pagination={paginationState}
          pageSizeOptions={paginationPageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Status Bar */}
      {showStatusBar && (
        <GridStatusBar
          displayedRows={displayedRows}
          totalRows={props.rowData.length}
          selectedCount={selection.selectedRows.size}
          columns={columns}
        />
      )}

      {/* Overlays */}
      {loading && <GridOverlay type="loading" customComponent={loadingOverlayComponent} />}
      {!loading && displayedRows.length === 0 && (
        <GridOverlay type="noRows" customComponent={noRowsOverlayComponent} />
      )}

      {/* Filter Popover - Positioned relative to grid */}
      {filterState && (
        <FilterPopover
          column={filterState.column}
          currentFilter={filterModel.find((f) => f.field === filterState.column.field)}
          onFilterChange={handleFilterChange}
          onClose={handleCloseFilter}
          allValues={props.rowData.map((r) => (r as any)[filterState.column.field])}
          onSort={(direction) => {
            setSortModel([{ field: filterState.column.field, direction }]);
            handleCloseFilter();
          }}
          anchorRect={filterState.anchorRect}
          containerRef={containerRef}
        />
      )}
    </div>
  );

  if (contextMenu) {
    const items = getContextMenuItems
      ? getContextMenuItems({} as any)
      : getDefaultContextMenuItems();
    return <GridContextMenu items={items}>{gridContent}</GridContextMenu>;
  }

  return gridContent;
}
