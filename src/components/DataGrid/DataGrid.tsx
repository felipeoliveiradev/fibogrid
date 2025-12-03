import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DataGridProps, ProcessedColumn, SortModel, FilterModel, ContextMenuItem } from './types';
import { useGridState } from './hooks/useGridState';
import { useVirtualization } from './hooks/useVirtualization';
import { useColumnResize } from './hooks/useColumnResize';
import { useColumnDrag } from './hooks/useColumnDrag';
import { useRowDrag } from './hooks/useRowDrag';
import { useRangeSelection } from './hooks/useRangeSelection';
import { GridHeader } from './components/GridHeader';
import { GridRow } from './components/GridRow';
import { GridPagination } from './components/GridPagination';
import { GridOverlay } from './components/GridOverlay';
import { FilterPopover } from './components/FilterPopover';
import { GridContextMenu } from './components/ContextMenu';
import { cn } from '@/lib/utils';
import { Copy, Download, Trash2 } from 'lucide-react';

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
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [filterColumn, setFilterColumn] = useState<ProcessedColumn<T> | null>(null);

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
  } = useGridState(props, containerWidth);

  // Fire grid ready event
  useEffect(() => {
    onGridReady?.({ api });
  }, [api, onGridReady]);

  // Virtualization
  const bodyHeight = containerHeight - headerHeight - (pagination ? 52 : 0);
  const {
    virtualRows,
    totalHeight,
    offsetTop,
    handleScroll,
    containerRef: scrollContainerRef,
  } = useVirtualization(displayedRows, {
    rowHeight,
    overscan: rowBuffer,
    containerHeight: bodyHeight,
  });

  // Column resize
  const { isResizing, resizingColumn, handleResizeStart } = useColumnResize(
    (field, width) => {
      setColumnWidths((prev) => ({ ...prev, [field]: width }));
      const column = columns.find((c) => c.field === field);
      if (column) {
        onColumnResized?.({ column, newWidth: width });
      }
    }
  );

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
        // Reinsert at new position
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
      setFilterModel((prev) => {
        let newModel: FilterModel[];
        if (filter === null) {
          newModel = prev.filter((f) => f.field !== filterColumn?.field);
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
      setFilterColumn(null);
    },
    [setFilterModel, filterColumn, onFilterChanged]
  );

  // Selection handlers
  const handleRowClick = useCallback(
    (rowId: string, e: React.MouseEvent) => {
      if (!rowSelection) return;
      selectRow(rowId, true, e.shiftKey, e.ctrlKey || e.metaKey);
    },
    [rowSelection, selectRow]
  );

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

  const gridContent = (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col border border-border rounded-lg overflow-hidden bg-background',
        isResizing && 'cursor-col-resize select-none',
        className
      )}
      style={{ height: '100%', minHeight: 400 }}
    >
      {/* Header */}
      <GridHeader
        columns={columns}
        sortModel={sortModel}
        onSort={handleSort}
        onResizeStart={handleResizeStart}
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
        onFilterClick={(col) => setFilterColumn(col)}
        headerHeight={headerHeight}
      />

      {/* Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        style={{ height: bodyHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetTop}px)` }}>
            {virtualRows.map((row, index) => (
              <GridRow
                key={row.id}
                row={row}
                columns={columns}
                rowHeight={rowHeight}
                isSelected={selection.selectedRows.has(row.id)}
                onRowClick={(e) => {
                  handleRowClick(row.id, e);
                  onRowClicked?.({ rowNode: row, event: e, api });
                }}
                onRowDoubleClick={(e) => {
                  onRowDoubleClicked?.({ rowNode: row, event: e, api });
                }}
                onCellClick={(col, e) => {
                  onCellClicked?.({
                    rowNode: row,
                    column: col,
                    value: (row.data as any)[col.field],
                    event: e,
                    api,
                  });
                }}
                onCellDoubleClick={(col, e) => {
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
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                api={api}
                isEven={index % 2 === 0}
              />
            ))}
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

      {/* Overlays */}
      {loading && <GridOverlay type="loading" customComponent={loadingOverlayComponent} />}
      {!loading && displayedRows.length === 0 && (
        <GridOverlay type="noRows" customComponent={noRowsOverlayComponent} />
      )}

      {/* Filter Popover */}
      {filterColumn && (
        <FilterPopover
          column={filterColumn}
          currentFilter={filterModel.find((f) => f.field === filterColumn.field)}
          onFilterChange={handleFilterChange}
        >
          <div className="hidden" />
        </FilterPopover>
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
