import React, { memo, useMemo } from 'react';
import { ProcessedColumn, RowNode, EditingCell, GridApi, RowClassParams } from '../types';
import { GridCell } from './GridCell';
import { cn } from '@/lib/utils';
import { GripVertical, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
  onCellContextMenu?: (rowIndex: number, colIndex: number, e: React.MouseEvent) => void;
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
  getRowClass?: (params: RowClassParams<T>) => string | string[] | undefined;
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
  onCellContextMenu,
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
  getRowClass,
}: GridRowProps<T>) {
  const visibleColumns = useMemo(() => columns.filter((col) => !col.hide), [columns]);
  const indentWidth = level * 20;
  const isChildRow = (row as any).isChildRow;

  const dynamicRowClass = useMemo(() => {
    if (!getRowClass) return '';
    const result = getRowClass({
      data: row.data,
      rowIndex: row.rowIndex,
      rowNode: row,
      api
    });
    if (!result) return '';
    return Array.isArray(result) ? result.join(' ') : result;
  }, [getRowClass, row, api]);

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

  const getPinnedBgClass = useMemo(() => {
    if (isSelected) return 'fibogrid-row-selected';
    if (isEven) return 'fibogrid-row-even';
    return 'fibogrid-row-odd';
  }, [isSelected, isEven]);

  const renderCell = (
    column: ProcessedColumn<T> & { stickyLeft?: number; stickyRight?: number; isLastPinned?: boolean; isFirstPinned?: boolean; isLastCenterBeforeRight?: boolean },
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
          column.isLastPinned && column.pinned === 'left' && 'fibogrid-pinned-left-shadow',
          column.isFirstPinned && column.pinned === 'right' && 'fibogrid-pinned-right-shadow',
          isPinned && (isSelected ? 'fibogrid-row-selected' : (dynamicRowClass || (isEven ? 'fibogrid-row-even' : 'fibogrid-row-odd')))
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
          onContextMenu={(e) => onCellContextMenu?.(row.rowIndex, globalColIndex, e)}
          indent={isFirstColumn ? indentWidth : 0}
          showExpandIcon={isFirstColumn && hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          registerCellRef={registerCellRef}
          rowHeight={rowHeight}
          isFirstPinnedRight={column.isFirstPinned && column.pinned === 'right'}
          isLastCenterBeforeRight={column.isLastCenterBeforeRight}
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex border-b border-border group/row text-sm',
        'transition-[background-color] duration-150',
        'fibogrid-row-hover',
        isSelected && 'fibogrid-row-selected',
        !isSelected && dynamicRowClass,
        !isSelected && !dynamicRowClass && isEven && 'fibogrid-row-even',
        !isSelected && !dynamicRowClass && !isEven && 'fibogrid-row-odd',
        isDragging && 'fibogrid-row-dragging',
        isDropTarget && dropPosition === 'before' && 'fibogrid-drop-target-top',
        isDropTarget && dropPosition === 'after' && 'fibogrid-drop-target-bottom',
        isChildRow && 'fibogrid-row-child'
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
            isSelected ? 'fibogrid-row-number-bg-selected' : isEven ? 'fibogrid-row-number-bg-even' : ''
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
        >
          {rowDragEnabled && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mr-1" />
          )}
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onCheckboxChange?.(!!checked);
            }}
            className="translate-y-[1px]"
            aria-label="Select row"
            onClick={onRowClick}
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
  if (prevProps.showRowNumbers !== nextProps.showRowNumbers) return false;
  if (prevProps.showCheckboxColumn !== nextProps.showCheckboxColumn) return false;

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