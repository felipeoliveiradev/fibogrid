import React, { memo, useMemo } from 'react';
import { ProcessedColumn, RowNode, EditingCell, GridApi } from '../types';
import { GridCell } from './GridCell';
import { cn } from '@/lib/utils';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Row numbers
  showRowNumbers?: boolean;
  rowNumber?: number;
  // Add child row
  onAddChildRow?: (parentId: string) => void;
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
  showRowNumbers,
  rowNumber,
  onAddChildRow,
}: GridRowProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hide);
  const indentWidth = level * 20;
  const isChildRow = (row as any).isChildRow;

  // Calculate sticky positions for pinned columns
  const { leftPinnedColumns, centerColumns, rightPinnedColumns, leftPinnedWidth, rightPinnedWidth } = useMemo(() => {
    const left = visibleColumns.filter(c => c.pinned === 'left');
    const center = visibleColumns.filter(c => !c.pinned);
    const right = visibleColumns.filter(c => c.pinned === 'right');
    
    // Calculate cumulative left positions
    let leftOffset = (showRowNumbers ? 50 : 0) + (showCheckboxColumn ? 48 : 0);
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
      leftPinnedWidth: leftOffset,
      rightPinnedWidth: rightOffset,
    };
  }, [visibleColumns, showRowNumbers, showCheckboxColumn]);

  const renderCell = (
    column: ProcessedColumn<T> & { stickyLeft?: number; stickyRight?: number; isLastPinned?: boolean; isFirstPinned?: boolean }, 
    isPinned: boolean, 
    stickyLeft?: number,
    stickyRight?: number
  ) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;
    const globalColIndex = columns.findIndex(c => c.field === column.field);
    const cellSelected = isCellSelected?.(row.rowIndex, globalColIndex);
    const cellFocused = isCellFocused?.(row.id, column.field);
    const colIndex = visibleColumns.findIndex(c => c.field === column.field);
    const isFirstColumn = colIndex === 0;
    
    // Determine the background style for pinned columns - must be SOLID colors, not transparent
    const getPinnedBgStyle = (): React.CSSProperties => {
      if (isSelected) return { backgroundColor: 'hsl(var(--primary) / 0.15)' };
      if (isEven) return { backgroundColor: 'hsl(var(--muted))' };
      return { backgroundColor: 'hsl(var(--background))' };
    };

    return (
      <div
        key={column.field}
        className={cn(
          'h-full',
          isPinned && 'sticky z-[2]',
          // Add shadow to last left-pinned column
          column.isLastPinned && column.pinned === 'left' && 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]',
          // Add shadow to first right-pinned column  
          column.isFirstPinned && column.pinned === 'right' && 'shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]'
        )}
        style={{
          left: stickyLeft !== undefined ? stickyLeft : undefined,
          right: stickyRight !== undefined ? stickyRight : undefined,
          ...(isPinned ? getPinnedBgStyle() : {}),
        }}
      >
        <GridCell
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
          onMouseDown={(e) => onCellMouseDown?.(row.rowIndex, globalColIndex, e)}
          onMouseEnter={() => onCellMouseEnter?.(row.rowIndex, globalColIndex)}
          indent={isFirstColumn ? indentWidth : 0}
          showExpandIcon={isFirstColumn && hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          registerCellRef={registerCellRef}
          rowHeight={rowHeight}
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex border-b border-border transition-colors group/row',
        // Hover effect
        'hover:bg-accent/50',
        // Selection takes priority
        isSelected && 'bg-primary/10 hover:bg-primary/15',
        // Zebra striping when not selected
        !isSelected && isEven && 'bg-muted/30',
        !isSelected && !isEven && 'bg-background',
        isDragging && 'opacity-50',
        isDropTarget && dropPosition === 'before' && 'border-t-2 border-t-primary',
        isDropTarget && dropPosition === 'after' && 'border-b-2 border-b-primary',
        isChildRow && 'bg-muted/40'
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
      {/* Row Number Column - Sticky */}
      {showRowNumbers && (
        <div
          className="flex items-center justify-center border-r border-border px-2 text-xs text-muted-foreground bg-muted/30 flex-shrink-0 sticky left-0 z-[2]"
          style={{ width: 50, minWidth: 50 }}
        >
          {rowNumber}
        </div>
      )}
      
      {/* Checkbox Column - Sticky */}
      {showCheckboxColumn && (
        <div
          className="flex items-center justify-center border-r border-border px-2 bg-muted/30 flex-shrink-0 sticky z-[2]"
          style={{ 
            width: 48, 
            minWidth: 48,
            left: showRowNumbers ? 50 : 0,
          }}
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

      {/* Left Pinned Columns */}
      {leftPinnedColumns.map((column) => renderCell(column, true, column.stickyLeft, undefined))}

      {/* Center (non-pinned) Columns */}
      {centerColumns.map((column) => renderCell(column, false, undefined, undefined))}

      {/* Right Pinned Columns */}
      {rightPinnedColumns.map((column) => renderCell(column, true, undefined, column.stickyRight))}

      {/* Add Child Row Button */}
      {onAddChildRow && !isChildRow && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity absolute right-2"
          onClick={(e) => {
            e.stopPropagation();
            onAddChildRow(row.id);
          }}
          title="Add child row"
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export const GridRow = memo(GridRowInner) as typeof GridRowInner;
