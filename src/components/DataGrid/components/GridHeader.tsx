import React, { useCallback, useMemo } from 'react';
import { ProcessedColumn, SortModel, SortDirection, FilterModel } from '../types';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, MoreVertical, Filter } from 'lucide-react';
import { ColumnMenu } from './ColumnMenu';
import { Input } from '@/components/ui/input';

interface GridHeaderProps<T> {
  columns: ProcessedColumn<T>[];
  sortModel: SortModel[];
  filterModel: FilterModel[];
  onSort: (field: string, direction?: 'asc' | 'desc') => void;
  onResizeStart: (e: React.MouseEvent, column: ProcessedColumn<T>) => void;
  onResizeDoubleClick?: (column: ProcessedColumn<T>, measureContent: () => number) => void;
  resizingColumn: string | null;
  // Column drag
  onDragStart: (e: React.DragEvent, column: ProcessedColumn<T>) => void;
  onDragOver: (e: React.DragEvent, column: ProcessedColumn<T>) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, column: ProcessedColumn<T>) => void;
  draggedColumn: string | null;
  dragOverColumn: string | null;
  // Selection
  showCheckboxColumn?: boolean;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
  // Filter
  onFilterClick?: (column: ProcessedColumn<T>, anchorRect: DOMRect) => void;
  onQuickColumnFilter?: (field: string, value: string) => void;
  headerHeight: number;
  // For measuring column content
  measureColumnContent?: (field: string) => number;
  // Row numbers
  showRowNumbers?: boolean;
  // Column pinning
  onPinColumn?: (field: string, pinned: 'left' | 'right' | null) => void;
  // Column hide
  onHideColumn?: (field: string) => void;
  // Auto-size
  onAutoSize?: (field: string) => void;
  onAutoSizeAll?: () => void;
  // Show filter row
  showFilterRow?: boolean;
}

export function GridHeader<T>({
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

  // Calculate sticky positions for pinned columns
  const { leftPinnedColumns, centerColumns, rightPinnedColumns } = useMemo(() => {
    const left = visibleColumns.filter(c => c.pinned === 'left');
    const center = visibleColumns.filter(c => !c.pinned);
    const right = visibleColumns.filter(c => c.pinned === 'right');
    
    // Calculate cumulative left positions - start from 0 since other columns are not sticky
    let leftOffset = 0;
    const leftWithPositions = left.map((col, idx) => {
      const pos = leftOffset;
      leftOffset += col.computedWidth;
      return { ...col, stickyLeft: pos, isLastPinned: idx === left.length - 1 };
    });
    
    // Calculate cumulative right positions
    let rightOffset = 0;
    const rightWithPositions = [...right].reverse().map((col, idx) => {
      const pos = rightOffset;
      rightOffset += col.computedWidth;
      return { ...col, stickyRight: pos, isFirstPinned: idx === right.length - 1 };
    }).reverse();
    
    return {
      leftPinnedColumns: leftWithPositions,
      centerColumns: center,
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

  const renderColumnHeader = (column: ProcessedColumn<T> & { stickyLeft?: number; stickyRight?: number; isLastPinned?: boolean; isFirstPinned?: boolean }, isPinned: boolean) => {
    const sortDirection = getSortDirection(column.field);
    const sortIndex = getSortIndex(column.field);
    const hasFilter = !!getActiveFilter(column.field);
    const isDragging = draggedColumn === column.field;
    const isDragOver = dragOverColumn === column.field;
    
    return (
      <div
        key={column.field}
        className={cn(
          'relative flex items-center border-r border-border px-3 select-none group flex-shrink-0',
          column.sortable !== false && 'cursor-pointer hover:bg-muted',
          isDragging && 'opacity-50',
          isDragOver && 'bg-primary/10',
          isPinned && 'sticky z-[2]',
          // Add shadow to last left-pinned column
          column.isLastPinned && column.pinned === 'left' && 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]',
          // Add shadow to first right-pinned column  
          column.isFirstPinned && column.pinned === 'right' && 'shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]'
        )}
        style={{ 
          width: column.computedWidth, 
          minWidth: column.minWidth || 50,
          left: column.stickyLeft !== undefined ? column.stickyLeft : undefined,
          right: column.stickyRight !== undefined ? column.stickyRight : undefined,
          backgroundColor: isPinned ? 'hsl(var(--muted))' : undefined,
        }}
        onClick={() => column.sortable !== false && onSort(column.field)}
        draggable={column.draggable !== false && !isPinned}
        onDragStart={(e) => !isPinned && onDragStart(e, column)}
        onDragOver={(e) => onDragOver(e, column)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, column)}
      >
        <span className="flex-1 truncate font-medium text-sm">
          {column.headerRenderer
            ? column.headerRenderer({ colDef: column, column, api: {} as any })
            : column.headerName}
        </span>
        
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

        {/* Filter indicator - only show when column has active filter */}
        {hasFilter && (
          <Filter className="h-3 w-3 ml-1 text-primary flex-shrink-0" />
        )}
        
        {/* Column Menu Button - appears on hover */}
        <ColumnMenu
          column={column}
          onSort={onSort}
          onHide={onHideColumn}
          onPin={onPinColumn}
          onAutoSize={onAutoSize}
          onAutoSizeAll={onAutoSizeAll}
          onFilterClick={(col, rect) => onFilterClick?.(col, rect)}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 rounded flex-shrink-0"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </ColumnMenu>
        
        {/* Resize Handle */}
        {column.resizable !== false && (
          <div
            className={cn(
              'absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary group/resize',
              resizingColumn === column.field && 'bg-primary'
            )}
            onMouseDown={(e) => onResizeStart(e, column)}
            onDoubleClick={(e) => handleResizeDoubleClick(e, column)}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 group-hover/resize:bg-primary transition-colors" />
          </div>
        )}
      </div>
    );
  };

  const renderFilterCell = (column: ProcessedColumn<T> & { stickyLeft?: number; stickyRight?: number; isLastPinned?: boolean; isFirstPinned?: boolean }, isPinned: boolean) => {
    const activeFilter = getActiveFilter(column.field);
    const hasActiveFilter = !!activeFilter;
    
    return (
      <div
        key={`filter-${column.field}`}
        className={cn(
          'flex items-center border-r border-border px-1 flex-shrink-0',
          isPinned && 'sticky z-[2]',
          // Add shadow to last left-pinned column
          column.isLastPinned && column.pinned === 'left' && 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]',
          // Add shadow to first right-pinned column  
          column.isFirstPinned && column.pinned === 'right' && 'shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]'
        )}
        style={{ 
          width: column.computedWidth, 
          minWidth: column.minWidth || 50,
          left: column.stickyLeft !== undefined ? column.stickyLeft : undefined,
          right: column.stickyRight !== undefined ? column.stickyRight : undefined,
          backgroundColor: isPinned ? 'hsl(var(--background))' : undefined,
        }}
      >
        {column.filterable !== false ? (
          <div className="flex items-center w-full gap-1">
            <Input
              placeholder=""
              className={cn(
                "h-7 text-xs border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary",
                hasActiveFilter && "bg-primary/10"
              )}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onQuickColumnFilter?.(column.field, e.target.value)}
            />
            <button
              onClick={(e) => handleFilterClick(e, column)}
              className={cn(
                "p-1 rounded hover:bg-muted flex-shrink-0",
                hasActiveFilter && "text-primary"
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
    <div className="flex flex-col border-b border-border bg-muted/50">
      {/* Main Header Row */}
      <div
        className="flex"
        style={{ height: headerHeight }}
      >
        {/* Left Pinned Column Headers - FIRST so they are sticky at left:0 */}
        {leftPinnedColumns.map((column) => renderColumnHeader(column, true))}

        {/* Row Numbers Header */}
        {showRowNumbers && (
          <div
            className="flex items-center justify-center border-r border-border px-2 flex-shrink-0"
            style={{ 
              width: 50, 
              minWidth: 50,
              backgroundColor: 'hsl(var(--muted))',
            }}
          >
            <span className="text-xs text-muted-foreground font-medium">#</span>
          </div>
        )}
        
        {/* Checkbox Header */}
        {showCheckboxColumn && (
          <div
            className="flex items-center justify-center border-r border-border px-2 flex-shrink-0"
            style={{ 
              width: 48, 
              minWidth: 48,
              backgroundColor: 'hsl(var(--muted))',
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected;
              }}
              onChange={onSelectAll}
              className="h-4 w-4 rounded border-border"
            />
          </div>
        )}
        
        {/* Center Column Headers */}
        {centerColumns.map((column) => renderColumnHeader(column, false))}
        
        {/* Right Pinned Column Headers */}
        {rightPinnedColumns.map((column) => renderColumnHeader(column, true))}
      </div>

      {/* Filter Row - Like AG Grid */}
      {showFilterRow && (
        <div
          className="flex border-t border-border bg-background"
          style={{ height: filterRowHeight }}
        >
          {/* Left Pinned Filter Cells - FIRST */}
          {leftPinnedColumns.map((column) => renderFilterCell(column, true))}

          {/* Row Numbers placeholder */}
          {showRowNumbers && (
            <div
              className="border-r border-border flex-shrink-0"
              style={{ 
                width: 50, 
                minWidth: 50,
                backgroundColor: 'hsl(var(--background))',
              }}
            />
          )}
          
          {/* Checkbox placeholder */}
          {showCheckboxColumn && (
            <div
              className="border-r border-border flex-shrink-0"
              style={{ 
                width: 48, 
                minWidth: 48,
                backgroundColor: 'hsl(var(--background))',
              }}
            />
          )}
          
          {/* Center Filter Cells */}
          {centerColumns.map((column) => renderFilterCell(column, false))}
          
          {/* Right Pinned Filter Cells */}
          {rightPinnedColumns.map((column) => renderFilterCell(column, true))}
        </div>
      )}
    </div>
  );
}
