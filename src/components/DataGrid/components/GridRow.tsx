import React, { memo } from 'react';
import { ProcessedColumn, RowNode, EditingCell, GridApi } from '../types';
import { GridCell } from './GridCell';
import { cn } from '@/lib/utils';
import { GripVertical, ChevronRight, ChevronDown } from 'lucide-react';

interface GridRowProps<T> {
  row: RowNode<T>;
  columns: ProcessedColumn<T>[];
  rowHeight: number;
  isSelected: boolean;
  onRowClick: (e: React.MouseEvent) => void;
  onRowDoubleClick: (e: React.MouseEvent) => void;
  onCellClick: (column: ProcessedColumn<T>, e: React.MouseEvent) => void;
  onCellDoubleClick: (column: ProcessedColumn<T>, e: React.MouseEvent) => void;
  // Selection
  showCheckboxColumn?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  // Editing
  editingCell: EditingCell | null;
  onStartEdit: (field: string) => void;
  onEditChange: (value: any) => void;
  onStopEdit: (cancel?: boolean) => void;
  // Row drag
  rowDragEnabled?: boolean;
  onRowDragStart?: (e: React.DragEvent) => void;
  onRowDragOver?: (e: React.DragEvent) => void;
  onRowDragEnd?: () => void;
  onRowDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  dropPosition?: 'before' | 'after' | null;
  // Range selection
  isCellSelected?: (rowIndex: number, colIndex: number) => boolean;
  isCellFocused?: (rowId: string, field: string) => boolean;
  onCellMouseDown?: (rowIndex: number, colIndex: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (rowIndex: number, colIndex: number) => void;
  // API
  api: GridApi<T>;
  // Striping
  isEven: boolean;
  // Tree/hierarchy
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  // Cell ref registration for auto-size
  registerCellRef?: (field: string, rowId: string, element: HTMLElement | null) => void;
}

function GridRowInner<T>({
  row,
  columns,
  rowHeight,
  isSelected,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  onCellDoubleClick,
  showCheckboxColumn,
  onCheckboxChange,
  editingCell,
  onStartEdit,
  onEditChange,
  onStopEdit,
  rowDragEnabled,
  onRowDragStart,
  onRowDragOver,
  onRowDragEnd,
  onRowDrop,
  isDragging,
  isDropTarget,
  dropPosition,
  isCellSelected,
  isCellFocused,
  onCellMouseDown,
  onCellMouseEnter,
  api,
  isEven,
  level = 0,
  hasChildren,
  isExpanded,
  onToggleExpand,
  registerCellRef,
}: GridRowProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hide);
  const indentWidth = level * 20;

  return (
    <div
      className={cn(
        'flex border-b border-border transition-colors',
        isSelected && 'bg-primary/10',
        !isSelected && isEven && 'bg-muted/20',
        !isSelected && !isEven && 'bg-background',
        isDragging && 'opacity-50',
        isDropTarget && dropPosition === 'before' && 'border-t-2 border-t-primary',
        isDropTarget && dropPosition === 'after' && 'border-b-2 border-b-primary'
      )}
      style={{ height: rowHeight }}
      onClick={onRowClick}
      onDoubleClick={onRowDoubleClick}
      draggable={rowDragEnabled}
      onDragStart={onRowDragStart}
      onDragOver={onRowDragOver}
      onDragEnd={onRowDragEnd}
      onDrop={onRowDrop}
    >
      {showCheckboxColumn && (
        <div
          className="flex items-center justify-center border-r border-border px-2"
          style={{ width: 48, minWidth: 48 }}
        >
          {rowDragEnabled && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mr-1" />
          )}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onCheckboxChange?.(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-border"
          />
        </div>
      )}
      
      {visibleColumns.map((column, colIndex) => {
        const isEditing =
          editingCell?.rowId === row.id && editingCell?.field === column.field;
        const cellSelected = isCellSelected?.(row.rowIndex, colIndex);
        const cellFocused = isCellFocused?.(row.id, column.field);
        const isFirstColumn = colIndex === 0;
        
        return (
          <GridCell
            key={column.field}
            column={column}
            row={row}
            api={api}
            isEditing={isEditing}
            editValue={isEditing ? editingCell?.value : undefined}
            onStartEdit={() => onStartEdit(column.field)}
            onEditChange={onEditChange}
            onStopEdit={onStopEdit}
            onClick={(e) => onCellClick(column, e)}
            onDoubleClick={(e) => onCellDoubleClick(column, e)}
            isSelected={cellSelected}
            isFocused={cellFocused}
            onMouseDown={(e) => onCellMouseDown?.(row.rowIndex, colIndex, e)}
            onMouseEnter={() => onCellMouseEnter?.(row.rowIndex, colIndex)}
            indent={isFirstColumn ? indentWidth : 0}
            showExpandIcon={isFirstColumn && hasChildren}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            registerCellRef={registerCellRef}
          />
        );
      })}
    </div>
  );
}

export const GridRow = memo(GridRowInner) as typeof GridRowInner;
