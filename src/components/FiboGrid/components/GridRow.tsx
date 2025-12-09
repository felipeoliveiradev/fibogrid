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
  showCheckboxColumn?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  editingCell: EditingCell | null;
  onStartEdit: (field: string) => void;
  onEditChange: (value: any) => void;
  onStopEdit: (cancel?: boolean, currentValue?: any) => void;
  rowDragEnabled?: boolean;
  onRowDragStart?: (e: React.DragEvent) => void;
  onRowDragOver?: (e: React.DragEvent) => void;
  onRowDragEnd?: () => void;
  onRowDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  dropPosition?: 'before' | 'after' | null;
  isCellSelected?: (rowIndex: number, colIndex: number) => boolean;
  isCellFocused?: (rowId: string, field: string) => boolean;
  onCellMouseDown?: (rowIndex: number, colIndex: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (rowIndex: number, colIndex: number) => void;
  api: GridApi<T>;
  isEven: boolean;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  registerCellRef?: (field: string, rowId: string, element: HTMLElement | null) => void;
  showRowNumbers?: boolean;
  rowNumber?: number;
  onAddChildRow?: (parentId: string) => void;
  onRowRangeMouseDown?: (rowId: string, isSelected: boolean, onToggle: () => void) => void;
  onRowRangeMouseEnter?: (rowId: string, isSelected: boolean, onToggle: () => void) => void;
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
  onRowRangeMouseDown,
  onRowRangeMouseEnter,
}: GridRowProps<T>) {
  const visibleColumns = useMemo(() => columns.filter((col) => !col.hide), [columns]);
  const indentWidth = level * 20;
  const isChildRow = (row as any).isChildRow;

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
    
    return {
      leftPinnedColumns: leftWithPositions,
      centerColumns: center,
      rightPinnedColumns: rightWithPositions,
    };
  }, [visibleColumns]);

  const getPinnedBgClass = useMemo(() => {
    if (isSelected) return 'bg-primary/15';
    if (isEven) return 'bg-muted';
    return 'bg-background';
  }, [isSelected, isEven]);

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
    
    return (
      <div
        key={column.field}
        className={cn(
          'h-full',
          isPinned && 'sticky z-[2]',
          column.isLastPinned && column.pinned === 'left' && 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]',
          column.isFirstPinned && column.pinned === 'right' && 'shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]',
          isPinned && getPinnedBgClass
        )}
        style={{
          width: column.computedWidth,
          minWidth: column.computedWidth,
          maxWidth: column.computedWidth,
          flexShrink: 0,
          flexGrow: 0,
          left: stickyLeft,
          right: stickyRight,
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
        'flex border-b border-border group/row',
        'transition-[background-color] duration-150',
        'hover:bg-accent/50',
        isSelected && 'bg-primary/10 hover:bg-primary/15',
        !isSelected && isEven && 'bg-muted/30',
        !isSelected && !isEven && 'bg-background',
        isDragging && 'opacity-50',
        isDropTarget && dropPosition === 'before' && 'border-t-2 border-t-primary',
        isDropTarget && dropPosition === 'after' && 'border-b-2 border-b-primary',
        isChildRow && 'bg-muted/40'
      )}
      style={{ height: `${rowHeight}px` }}
      onClick={onRowClick}
      onDoubleClick={onRowDoubleClick}
      draggable={rowDragEnabled}
      onDragStart={onRowDragStart}
      onDragOver={onRowDragOver}
      onDragEnd={onRowDragEnd}
      onDrop={onRowDrop}
      onMouseDown={(e) => {
        if (e.button === 0 && !(e.target as HTMLElement).closest('input, button')) {
          if (onRowRangeMouseDown && onCheckboxChange) {
            onRowRangeMouseDown(row.id, isSelected, () => onCheckboxChange(!isSelected));
          }
        }
      }}
      onMouseEnter={(e) => {
        if (e.buttons === 1 && onRowRangeMouseEnter && onCheckboxChange) {
          onRowRangeMouseEnter(row.id, isSelected, () => onCheckboxChange(!isSelected));
        }
      }}
    >
      {leftPinnedColumns.map((column) => renderCell(column, true, column.stickyLeft, undefined))}

      {showRowNumbers && (
        <div
          className={cn(
            "flex items-center justify-center border-r border-border px-2 text-xs text-muted-foreground flex-shrink-0 fibogrid-row-number-column",
            isSelected ? 'fibogrid-row-number-bg-selected' : isEven ? 'fibogrid-row-number-bg-even' : 'bg-background'
          )}
        >
          {rowNumber}
        </div>
      )}
      
      {showCheckboxColumn && (
        <div
          className={cn(
            "flex items-center justify-center px-2 flex-shrink-0 fibogrid-checkbox-column",
            isSelected ? 'fibogrid-checkbox-column-bg-selected' : isEven ? 'fibogrid-checkbox-column-bg-even' : ''
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {rowDragEnabled && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mr-1" />
          )}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onCheckboxChange?.(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {centerColumns.map((column) => renderCell(column, false, undefined, undefined))}

      {rightPinnedColumns.map((column) => renderCell(column, true, undefined, column.stickyRight))}

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

export const GridRow = memo(GridRowInner, (prevProps, nextProps) => {
  if (prevProps.row === nextProps.row && 
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.editingCell === nextProps.editingCell &&
      prevProps.columns === nextProps.columns &&
      prevProps.isCellSelected === nextProps.isCellSelected) {
      return true;
    }
    
    if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.row.id !== nextProps.row.id) return false;
  if (prevProps.isDragging !== nextProps.isDragging) return false;
  if (prevProps.isDropTarget !== nextProps.isDropTarget) return false;
  if (prevProps.isExpanded !== nextProps.isExpanded) return false;
    if (prevProps.isCellSelected !== nextProps.isCellSelected) return false;
    
    const prevEdit = prevProps.editingCell;
  const nextEdit = nextProps.editingCell;
    if (prevEdit?.rowId !== nextEdit?.rowId || prevEdit?.field !== nextEdit?.field || prevEdit?.value !== nextEdit?.value) return false;
    
    if (prevProps.columns !== nextProps.columns) {
    if (prevProps.columns.length !== nextProps.columns.length) return false;
    for (let i = 0; i < prevProps.columns.length; i++) {
      const prevCol = prevProps.columns[i];
      const nextCol = nextProps.columns[i];
      if (
        prevCol.field !== nextCol.field ||
        prevCol.computedWidth !== nextCol.computedWidth ||
        prevCol.pinned !== nextCol.pinned ||
        prevCol.hide !== nextCol.hide
      ) {
        return false;
      }
    }
  }
  
  if (prevProps.row.data === nextProps.row.data) return true;

  const prevData = prevProps.row.data as Record<string, unknown>;
  const nextData = nextProps.row.data as Record<string, unknown>;
  const cols = nextProps.columns;
  const len = cols.length;
  
  for (let i = 0; i < len; i++) {
    const field = cols[i].field;
    if (prevData[field] !== nextData[field]) return false;
  }
  
  return true;
}) as typeof GridRowInner;