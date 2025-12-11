import React, { useCallback, useMemo, useRef } from 'react';
import { ProcessedColumn, SortModel, SortDirection, FilterModel, GridApi } from '../types';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, MoreVertical, Filter } from 'lucide-react';
import { ColumnMenu } from './ColumnMenu';
import { Input } from '@/components/ui/input';

interface GridHeaderProps<T> {
  api: GridApi<T>;
  columns: ProcessedColumn<T>[];
  sortModel: SortModel[];
  filterModel: FilterModel[];
  onSort: (field: string, direction?: 'asc' | 'desc') => void;
  onResizeStart: (e: React.MouseEvent, column: ProcessedColumn<T>) => void;
  onResizeDoubleClick?: (column: ProcessedColumn<T>, measureContent: () => number) => void;
  resizingColumn: string | null;
  onDragStart: (e: React.DragEvent, column: ProcessedColumn<T>) => void;
  onDragOver: (e: React.DragEvent, column: ProcessedColumn<T>) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, column: ProcessedColumn<T>) => void;
  draggedColumn: string | null;
  dragOverColumn: string | null;
  showCheckboxColumn?: boolean;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
  onFilterClick?: (column: ProcessedColumn<T>, anchorRect: DOMRect) => void;
  onQuickColumnFilter?: (field: string, value: string) => void;
  headerHeight: number;
  measureColumnContent?: (field: string) => number;
  showRowNumbers?: boolean;
  onPinColumn?: (field: string, pinned: 'left' | 'right' | null) => void;
  onHideColumn?: (field: string) => void;
  onAutoSize?: (field: string) => void;
  onAutoSizeAll?: () => void;
  showFilterRow?: boolean;
  className?: string;
}

export function GridHeader<T>({
  api,
  columns,
  sortModel,
  filterModel,
  onSort,
  onResizeStart,
  onResizeDoubleClick,
  resizingColumn,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  draggedColumn,
  dragOverColumn,
  showCheckboxColumn,
  allSelected,
  someSelected,
  onSelectAll,
  onFilterClick,
  onQuickColumnFilter,
  headerHeight,
  measureColumnContent,
  showRowNumbers,
  onPinColumn,
  onHideColumn,
  onAutoSize,
  onAutoSizeAll,
  showFilterRow = true,
  className,
}: GridHeaderProps<T>) {
  const getSortDirection = (field: string): SortDirection => {
    const sort = sortModel.find((s) => s.field === field);
    return sort?.direction || null;
  };

  const getSortIndex = (field: string): number => {
    const index = sortModel.findIndex((s) => s.field === field);
    return index === -1 ? -1 : index + 1;
  };

  const getActiveFilter = (field: string): FilterModel | undefined => {
    return filterModel.find((f) => f.field === field);
  };

  const visibleColumns = columns.filter((col) => !col.hide);

  const { leftPinnedColumns, centerColumns, rightPinnedColumns } = useMemo(() => {
    const left = visibleColumns.filter(c => c.pinned === 'left');
    const center = visibleColumns.filter(c => !c.pinned);
    const right = visibleColumns.filter(c => c.pinned === 'right');

    let leftOffset = 0;
    const leftWithPositions = left.map((col, idx) => {
      const pos = leftOffset;
      leftOffset += col.computedWidth;
      return { ...col, stickyLeft: pos, isLastPinned: idx === left.length - 1 };
    });

    let rightOffset = 0;
    const rightWithPositions = [...right].reverse().map((col, idx) => {
      const pos = rightOffset;
      rightOffset += col.computedWidth;
      return { ...col, stickyRight: pos, isFirstPinned: idx === right.length - 1 };
    }).reverse();

    // Mark last center column if there are right pinned columns
    const centerWithFlags = center.map((col, idx) => ({
      ...col,
      isLastCenterBeforeRight: right.length > 0 && idx === center.length - 1
    }));

    return {
      leftPinnedColumns: leftWithPositions,
      centerColumns: centerWithFlags,
      rightPinnedColumns: rightWithPositions,
    };
  }, [visibleColumns]);

  const handleFilterClick = useCallback((e: React.MouseEvent, column: ProcessedColumn<T>) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onFilterClick?.(column, rect);
  }, [onFilterClick]);

  const handleResizeDoubleClick = (e: React.MouseEvent, column: ProcessedColumn<T>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onResizeDoubleClick && measureColumnContent) {
      onResizeDoubleClick(column, () => measureColumnContent(column.field));
    }
  };

  const filterRowHeight = showFilterRow ? 36 : 0;

  const wasResizingRef = useRef(false);

  const handleHeaderClick = useCallback((column: ProcessedColumn<T>) => {
    if (wasResizingRef.current || resizingColumn) {
      wasResizingRef.current = false;
      return;
    }
    if (column.sortable !== false) {
      onSort(column.field);
    }
  }, [resizingColumn, onSort]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, column: ProcessedColumn<T>) => {
    e.preventDefault();
    e.stopPropagation();
    wasResizingRef.current = true;
    onResizeStart(e, column);

    const handleMouseUp = () => {
      setTimeout(() => {
        wasResizingRef.current = false;
        // Clean up the style that might have been applied to body during resize
        document.body.style.cursor = '';
      }, 100);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResizeStart]);

  const renderColumnHeader = (column: ProcessedColumn<T> & { stickyLeft?: number; stickyRight?: number; isLastPinned?: boolean; isFirstPinned?: boolean; isLastCenterBeforeRight?: boolean }, isPinned: boolean) => {
    const sortDirection = getSortDirection(column.field);
    const sortIndex = getSortIndex(column.field);
    const hasFilter = !!getActiveFilter(column.field);
    const isDragging = draggedColumn === column.field;
    const isDragOver = dragOverColumn === column.field;

    return (
      <div
        key={column.field}
        className={cn(
          'relative flex items-center px-3 select-none group fibogrid-header-container',
          !column.isLastCenterBeforeRight && 'border-r border-border',
          column.sortable !== false && 'cursor-pointer',
          isDragging && 'opacity-50',
          isDragOver && 'fibogrid-header-drag-over',
          isPinned && 'sticky z-[2]',
          column.isLastPinned && column.pinned === 'left' && 'fibogrid-pinned-left-shadow',
          column.isFirstPinned && column.pinned === 'right' && 'fibogrid-pinned-right-shadow border-l border-border'
        )}
        style={{
          width: column.computedWidth,
          minWidth: column.computedWidth,
          maxWidth: column.computedWidth,
          flexShrink: 0,
          flexGrow: 0,
          left: column.stickyLeft !== undefined ? column.stickyLeft : undefined,
          right: column.stickyRight !== undefined ? column.stickyRight : undefined,
        }}
        onClick={() => handleHeaderClick(column)}
        draggable={column.draggable !== false && !isPinned}
        onDragStart={(e) => !isPinned && onDragStart(e, column)}
        onDragOver={(e) => onDragOver(e, column)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, column)}
      >
        <div className="flex-1 min-w-0 flex items-center">
          {column.headerRenderer
            ? column.headerRenderer({ colDef: column, column, api })
            : <span className="truncate w-full block">{column.headerName}</span>}
        </div>

        {sortDirection && (
          <div className="flex items-center ml-1 flex-shrink-0">
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {sortModel.length > 1 && (
              <span className="text-xs text-muted-foreground ml-0.5">
                {sortIndex}
              </span>
            )}
          </div>
        )}

        {hasFilter && (
          <Filter className="h-3 w-3 ml-1 text-primary flex-shrink-0" />
        )}

        <ColumnMenu
          column={column}
          onSort={onSort}
          onHide={onHideColumn}
          onPin={onPinColumn}
          onAutoSize={onAutoSize}
          onAutoSizeAll={onAutoSizeAll}
          onFilterClick={(col, rect) => onFilterClick?.(col, rect)}
          className={className}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-[color:var(--fibogrid-surface-hover)] rounded flex-shrink-0"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </ColumnMenu>

        {column.resizable !== false && (
          <div
            className={cn(
              'absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[color:var(--fibogrid-primary)] group/resize fibogrid-resize-handle',
              resizingColumn === column.field && 'bg-[color:var(--fibogrid-primary)]'
            )}
            onMouseDown={(e) => handleResizeMouseDown(e, column)}
            onDoubleClick={(e) => handleResizeDoubleClick(e, column)}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 group-hover/resize:bg-[color:var(--fibogrid-primary)] transition-colors" />
          </div>
        )}
      </div>
    );
  };

  const renderFilterCell = (column: ProcessedColumn<T> & { stickyLeft?: number; stickyRight?: number; isLastPinned?: boolean; isFirstPinned?: boolean; isLastCenterBeforeRight?: boolean }, isPinned: boolean) => {
    const activeFilter = getActiveFilter(column.field);
    const hasActiveFilter = !!activeFilter;
    const filterValue =
      activeFilter?.value == null
        ? ''
        : Array.isArray(activeFilter.value)
          ? activeFilter.value.join(', ')
          : String(activeFilter.value);

    return (
      <div
        key={`filter - ${column.field} `}
        className={cn(
          'flex items-center px-1 fibogrid-filter-row-container',
          !column.isLastCenterBeforeRight && 'border-r border-border',
          isPinned && 'sticky z-[2]',
          column.isLastPinned && column.pinned === 'left' && 'fibogrid-pinned-left-shadow',
          column.isFirstPinned && column.pinned === 'right' && 'fibogrid-pinned-right-shadow border-l border-border'
        )}
        style={{
          width: column.computedWidth,
          minWidth: column.computedWidth,
          maxWidth: column.computedWidth,
          flexShrink: 0,
          flexGrow: 0,
          left: column.stickyLeft !== undefined ? column.stickyLeft : undefined,
          right: column.stickyRight !== undefined ? column.stickyRight : undefined,
        }}
      >
        {column.filterable !== false ? (
          <div className="flex items-center py-2 w-full gap-1">
            <Input
              placeholder=""
              value={filterValue}
              className={cn(
                "h-7 text-xs border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-[color:var(--fibogrid-primary)] fibogrid-filter-input",
                hasActiveFilter && "fibogrid-filter-input-active"
              )}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onQuickColumnFilter?.(column.field, e.target.value)}
            />
            <button
              onClick={(e) => handleFilterClick(e, column)}
              className={cn(
                "p-1 rounded hover:bg-[color:var(--fibogrid-surface-hover)] flex-shrink-0",
                hasActiveFilter && "text-[color:var(--fibogrid-primary)]"
              )}
              title="Advanced filter"
            >
              <Filter className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="w-full" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col border-b border-border fibogrid-header-container">
      <div
        className="flex"
        style={{ height: `${headerHeight}px` }}
      >
        {leftPinnedColumns.map((column) => renderColumnHeader(column, true))}

        {showRowNumbers && (
          <div
            className="flex items-center justify-center border-r border-border px-2 flex-shrink-0 fibogrid-row-number-column fibogrid-header-container"
          >
            <span className="text-xs text-muted-foreground font-medium">#</span>
          </div>
        )}

        {showCheckboxColumn && (
          <div
            className="flex items-center justify-center px-2 flex-shrink-0 fibogrid-checkbox-column fibogrid-header-container"
          >
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected;
              }}
              onChange={onSelectAll}
            />
          </div>
        )}

        {centerColumns.map((column) => renderColumnHeader(column, false))}

        {rightPinnedColumns.map((column) => renderColumnHeader(column, true))}
      </div>

      {showFilterRow && (
        <div
          className="flex border-t border-border fibogrid-filter-row-container"
          style={{ height: `${filterRowHeight}px` }}
        >
          {leftPinnedColumns.map((column) => renderFilterCell(column, true))}

          {showRowNumbers && (
            <div
              className="border-r border-border flex-shrink-0 fibogrid-row-number-column fibogrid-filter-row-container"
            />
          )}

          {showCheckboxColumn && (
            <div
              className="border-r border-border flex-shrink-0 fibogrid-checkbox-column fibogrid-filter-row-container"
            />
          )}

          {centerColumns.map((column) => renderFilterCell(column, false))}

          {rightPinnedColumns.map((column) => renderFilterCell(column, true))}
        </div>
      )}
    </div>
  );
}
