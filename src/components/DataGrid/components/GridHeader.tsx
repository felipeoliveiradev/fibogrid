import React, { useRef } from 'react';
import { ProcessedColumn, SortModel, SortDirection } from '../types';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, GripVertical, Filter } from 'lucide-react';

interface GridHeaderProps<T> {
  columns: ProcessedColumn<T>[];
  sortModel: SortModel[];
  onSort: (field: string) => void;
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
  onFilterClick?: (column: ProcessedColumn<T>) => void;
  headerHeight: number;
  // For measuring column content
  measureColumnContent?: (field: string) => number;
}

export function GridHeader<T>({
  columns,
  sortModel,
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
  headerHeight,
  measureColumnContent,
}: GridHeaderProps<T>) {
  const getSortDirection = (field: string): SortDirection => {
    const sort = sortModel.find((s) => s.field === field);
    return sort?.direction || null;
  };

  const getSortIndex = (field: string): number => {
    const index = sortModel.findIndex((s) => s.field === field);
    return index === -1 ? -1 : index + 1;
  };

  const visibleColumns = columns.filter((col) => !col.hide);

  const handleResizeDoubleClick = (e: React.MouseEvent, column: ProcessedColumn<T>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onResizeDoubleClick && measureColumnContent) {
      onResizeDoubleClick(column, () => measureColumnContent(column.field));
    }
  };

  return (
    <div
      className="flex border-b border-border bg-muted/50 sticky top-0 z-10"
      style={{ height: headerHeight }}
    >
      {showCheckboxColumn && (
        <div
          className="flex items-center justify-center border-r border-border px-2"
          style={{ width: 48, minWidth: 48 }}
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
      
      {visibleColumns.map((column) => {
        const sortDirection = getSortDirection(column.field);
        const sortIndex = getSortIndex(column.field);
        const isDragging = draggedColumn === column.field;
        const isDragOver = dragOverColumn === column.field;
        
        return (
          <div
            key={column.field}
            className={cn(
              'relative flex items-center border-r border-border px-3 select-none group',
              column.sortable !== false && 'cursor-pointer hover:bg-muted',
              isDragging && 'opacity-50',
              isDragOver && 'bg-primary/10'
            )}
            style={{ width: column.computedWidth, minWidth: column.minWidth || 50 }}
            onClick={() => column.sortable !== false && onSort(column.field)}
            draggable={column.draggable !== false}
            onDragStart={(e) => onDragStart(e, column)}
            onDragOver={(e) => onDragOver(e, column)}
            onDragEnd={onDragEnd}
            onDrop={(e) => onDrop(e, column)}
          >
            {column.draggable !== false && (
              <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 mr-1 cursor-grab" />
            )}
            
            <span className="flex-1 truncate font-medium text-sm">
              {column.headerRenderer
                ? column.headerRenderer({ colDef: column, column, api: {} as any })
                : column.headerName}
            </span>
            
            {sortDirection && (
              <div className="flex items-center ml-1">
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
            
            {column.filterable !== false && !column.suppressMenu && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterClick?.(column);
                }}
                className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 rounded"
              >
                <Filter className="h-3 w-3" />
              </button>
            )}
            
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
      })}
    </div>
  );
}
