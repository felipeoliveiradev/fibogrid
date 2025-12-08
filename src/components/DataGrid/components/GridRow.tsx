import React, { memo } from 'react';
import { ProcessedColumn, RowNode, EditingCell, GridApi } from '../types';
import { GridCell } from './GridCell';
import { cn } from '@/lib/utils';
import { GripVertical, ChevronRight, ChevronDown, Plus } from 'lucide-react';
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
  // Separate pinned and regular columns
  const leftPinnedColumns = columns.filter((col) => col.pinned === 'left' && !col.hide);
  const rightPinnedColumns = columns.filter((col) => col.pinned === 'right' && !col.hide);
  const regularColumns = columns.filter((col) => !col.pinned && !col.hide);
  const visibleColumns = [...leftPinnedColumns, ...regularColumns, ...rightPinnedColumns];
  
  const indentWidth = level * 20;
  const isChildRow = (row as any).isChildRow;

  return (
    <div
      className={cn(
        'flex border-b border-border transition-colors group/row',
        isSelected && 'bg-primary/10',
        !isSelected && isEven && 'bg-muted/20',
        !isSelected && !isEven && 'bg-background',
        isDragging && 'opacity-50',
        isDropTarget && dropPosition === 'before' && 'border-t-2 border-t-primary',
        isDropTarget && dropPosition === 'after' && 'border-b-2 border-b-primary',
        isChildRow && 'bg-muted/30'
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
      {/* Row Number Column */}
      {showRowNumbers && (
        <div
          className="flex items-center justify-center border-r border-border px-2 text-xs text-muted-foreground bg-muted/30 sticky left-0 z-[2]"
          style={{ width: 50, minWidth: 50 }}
        >
          {rowNumber}
        </div>
      )}
      
      {/* Checkbox Column */}
      {showCheckboxColumn && (
        <div
          className={cn(
            "flex items-center justify-center border-r border-border px-2 bg-muted/30",
            showRowNumbers ? "" : "sticky left-0 z-[2]"
          )}
          style={{ 
            width: 48, 
            minWidth: 48,
            position: 'sticky',
            left: showRowNumbers ? 50 : 0,
            zIndex: 2,
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
      {leftPinnedColumns.map((column, colIndex) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;
        const globalColIndex = columns.findIndex(c => c.field === column.field);
        const cellSelected = isCellSelected?.(row.rowIndex, globalColIndex);
        const cellFocused = isCellFocused?.(row.id, column.field);
        const isFirstColumn = colIndex === 0;
        
        return (
          <div
            key={column.field}
            className="bg-muted/50 sticky z-[1]"
            style={{ 
              left: (showRowNumbers ? 50 : 0) + (showCheckboxColumn ? 48 : 0) + column.left,
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
            />
          </div>
        );
      })}
      
      {/* Regular Columns */}
      {regularColumns.map((column, colIndex) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;
        const globalColIndex = columns.findIndex(c => c.field === column.field);
        const cellSelected = isCellSelected?.(row.rowIndex, globalColIndex);
        const cellFocused = isCellFocused?.(row.id, column.field);
        const isFirstVisibleColumn = leftPinnedColumns.length === 0 && colIndex === 0;
        
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
            onMouseDown={(e) => onCellMouseDown?.(row.rowIndex, globalColIndex, e)}
            onMouseEnter={() => onCellMouseEnter?.(row.rowIndex, globalColIndex)}
            indent={isFirstVisibleColumn ? indentWidth : 0}
            showExpandIcon={isFirstVisibleColumn && hasChildren}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            registerCellRef={registerCellRef}
          />
        );
      })}

      {/* Right Pinned Columns */}
      {rightPinnedColumns.map((column) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;
        const globalColIndex = columns.findIndex(c => c.field === column.field);
        const cellSelected = isCellSelected?.(row.rowIndex, globalColIndex);
        const cellFocused = isCellFocused?.(row.id, column.field);
        
        return (
          <div
            key={column.field}
            className="bg-muted/50 sticky right-0 z-[1]"
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
              indent={0}
              showExpandIcon={false}
              isExpanded={false}
              onToggleExpand={() => {}}
              registerCellRef={registerCellRef}
            />
          </div>
        );
      })}

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
