import React, { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ProcessedColumn, RowNode, EditingCell, GridApi, RowClassParams } from '../types';
import { GridCell } from './GridCell';
import { cn } from '@/lib/utils';
import { GripVertical, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useGridLocale } from '../context/GridContext';

const rowFocusCache = new Map<string, string | null>();

/** Row morph (FLIP-lite): animate a row when its display index changes between commits. */
const ROW_MORPH_DURATION_MS = 90;
/** Moves larger than this many rows teleport instead of animating. */
const ROW_MORPH_MAX_ROWS = 40;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Current translateY of an element mid-transition (0 when none). */
function currentTranslateY(el: HTMLElement): number {
  if (typeof DOMMatrix === 'undefined') return 0;
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return 0;
  try {
    return new DOMMatrix(t).m42;
  } catch {
    return 0;
  }
}

type CellHandlers = {
  onStartEdit: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
};

type ColumnWithLayout<T> = ProcessedColumn<T> & {
  stickyLeft?: number;
  stickyRight?: number;
  isLastPinned?: boolean;
  isFirstPinned?: boolean;
  isLastCenterBeforeRight?: boolean;
  globalColIndex: number;
  visibleColIndex: number;
};

function focusedFieldForRow(
  isCellFocused: ((rowId: string, field: string) => boolean) | undefined,
  rowId: string,
  columns: { field: string }[],
): string | null {
  if (!isCellFocused) return null;
  for (let i = 0; i < columns.length; i++) {
    if (isCellFocused(rowId, columns[i].field)) return columns[i].field;
  }
  return null;
}
interface GridRowProps<T> {
  row: RowNode<T>;
  columns: ProcessedColumn<T>[];
  rowHeight: number;
  isSelected: boolean;
  onRowClick: (rowId: string, e: React.MouseEvent) => void;
  onRowDoubleClick: (rowId: string, e: React.MouseEvent) => void;
  onContextMenu?: (rowId: string, e: React.MouseEvent) => void;
  onCellClick: (rowId: string, column: ProcessedColumn<T>, e: React.MouseEvent) => void;
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
  /** Fingerprint so memoized rows repaint when range bounds change. */
  selectionVersion?: number;
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
  onContextMenu,
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
  const locale = useGridLocale();
  const selectRowLabel = locale.aria.selectRow ?? 'Select row';
  const addChildRowLabel = locale.aria.addChildRow ?? 'Add child row';
  const focusedField = focusedFieldForRow(isCellFocused, row.id, columns);
  useEffect(() => {
    rowFocusCache.set(row.id, focusedField);
  }, [row.id, focusedField]);
  useEffect(() => {
    const rowId = row.id;
    return () => {
      rowFocusCache.delete(rowId);
    };
  }, [row.id]);
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
    const globalIndexByField = new Map<string, number>();
    for (let i = 0; i < columns.length; i++) {
      globalIndexByField.set(columns[i].field, i);
    }
    const visibleIndexByField = new Map<string, number>();
    for (let i = 0; i < visibleColumns.length; i++) {
      visibleIndexByField.set(visibleColumns[i].field, i);
    }
    const withIndices = (col: ProcessedColumn<T>): ColumnWithLayout<T> => ({
      ...col,
      globalColIndex: globalIndexByField.get(col.field) ?? -1,
      visibleColIndex: visibleIndexByField.get(col.field) ?? -1,
    });
    const left = visibleColumns.filter(c => c.pinned === 'left').map(withIndices);
    const center = visibleColumns.filter(c => !c.pinned).map(withIndices);
    const right = visibleColumns.filter(c => c.pinned === 'right').map(withIndices);
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
  }, [visibleColumns, columns]);

  const rowElRef = useRef<HTMLDivElement>(null);
  const prevRowIndexRef = useRef(row.rowIndex);
  const morphRafRef = useRef<number | null>(null);

  const clearMorph = (el: HTMLElement | null) => {
    if (morphRafRef.current !== null) {
      cancelAnimationFrame(morphRafRef.current);
      morphRafRef.current = null;
    }
    if (el) {
      el.style.transform = '';
      el.style.transition = '';
    }
  };

  // The row sits in normal flow inside the virtualizer's translated wrapper, so after a
  // re-sort its layout box is already at the new slot. Invert with translateY(old - new),
  // then play to identity. Inline transform/transition are not managed by React's style prop.
  useIsomorphicLayoutEffect(() => {
    const prev = prevRowIndexRef.current;
    const next = row.rowIndex;
    prevRowIndexRef.current = next;
    const el = rowElRef.current;
    if (!el || prev === next) return;

    const delta = prev - next;
    if (Math.abs(delta) > ROW_MORPH_MAX_ROWS || rowHeight <= 0 || prefersReducedMotion()) {
      clearMorph(el);
      return;
    }

    // Carry over any residual offset from an interrupted morph.
    const residual = morphRafRef.current !== null || el.style.transform ? currentTranslateY(el) : 0;
    clearMorph(el);
    el.style.transition = 'none';
    el.style.transform = `translateY(${delta * rowHeight + residual}px)`;
    void el.offsetHeight; // commit the inverted state before animating

    morphRafRef.current = requestAnimationFrame(() => {
      morphRafRef.current = null;
      el.style.transition = `transform ${ROW_MORPH_DURATION_MS}ms linear`;
      el.style.transform = 'none';
    });
  }, [row.rowIndex, rowHeight]);

  useEffect(() => {
    const el = rowElRef.current;
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== 'transform') return;
      el.style.transform = '';
      el.style.transition = '';
    };
    el?.addEventListener('transitionend', onEnd);
    return () => {
      el?.removeEventListener('transitionend', onEnd);
      clearMorph(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowRef = useRef(row);
  rowRef.current = row;
  const onStartEditRef = useRef(onStartEdit);
  onStartEditRef.current = onStartEdit;
  const onCellClickRef = useRef(onCellClick);
  onCellClickRef.current = onCellClick;
  const onCellDoubleClickRef = useRef(onCellDoubleClick);
  onCellDoubleClickRef.current = onCellDoubleClick;
  const onCellMouseDownRef = useRef(onCellMouseDown);
  onCellMouseDownRef.current = onCellMouseDown;
  const onCellMouseEnterRef = useRef(onCellMouseEnter);
  onCellMouseEnterRef.current = onCellMouseEnter;
  const onCellContextMenuRef = useRef(onCellContextMenu);
  onCellContextMenuRef.current = onCellContextMenu;
  const columnByFieldRef = useRef(new Map<string, ColumnWithLayout<T>>());
  const colIndexByFieldRef = useRef(new Map<string, number>());
  const cellHandlersRef = useRef(new Map<string, CellHandlers>());

  {
    const nextColumns = new Map<string, ColumnWithLayout<T>>();
    const nextIndices = new Map<string, number>();
    const allLayoutCols = [
      ...leftPinnedColumns,
      ...centerColumns,
      ...rightPinnedColumns,
    ];
    for (const col of allLayoutCols) {
      nextColumns.set(col.field, col);
      nextIndices.set(col.field, col.globalColIndex);
    }
    columnByFieldRef.current = nextColumns;
    colIndexByFieldRef.current = nextIndices;
  }

  const getCellHandlers = (field: string): CellHandlers => {
    const cache = cellHandlersRef.current;
    const existing = cache.get(field);
    if (existing) return existing;
    const handlers: CellHandlers = {
      onStartEdit: () => onStartEditRef.current(field),
      onClick: (e) => {
        const col = columnByFieldRef.current.get(field);
        if (col) onCellClickRef.current(rowRef.current.id, col, e);
      },
      onDoubleClick: (e) => {
        const col = columnByFieldRef.current.get(field);
        if (col) onCellDoubleClickRef.current(col, e);
      },
      onMouseDown: (e) => {
        const idx = colIndexByFieldRef.current.get(field) ?? -1;
        onCellMouseDownRef.current?.(rowRef.current.rowIndex, idx, e);
      },
      onMouseEnter: () => {
        const idx = colIndexByFieldRef.current.get(field) ?? -1;
        onCellMouseEnterRef.current?.(rowRef.current.rowIndex, idx);
      },
      onContextMenu: (e) => {
        const idx = colIndexByFieldRef.current.get(field) ?? -1;
        onCellContextMenuRef.current?.(rowRef.current.rowIndex, idx, e);
      },
    };
    cache.set(field, handlers);
    return handlers;
  };

  const getPinnedBgClass = useMemo(() => {
    if (isSelected) return 'fibogrid-row-selected';
    if (isEven) return 'fibogrid-row-even';
    return 'fibogrid-row-odd';
  }, [isSelected, isEven]);
  const renderCell = (
    column: ColumnWithLayout<T>,
    isPinned: boolean,
    stickyLeft?: number,
    stickyRight?: number
  ) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.field;
    const globalColIndex = column.globalColIndex;
    const cellSelected = isCellSelected?.(row.rowIndex, globalColIndex);
    const cellFocused = isCellFocused?.(row.id, column.field);
    const isFirstColumn = column.visibleColIndex === 0;
    const handlers = getCellHandlers(column.field);
    return (
      <div
        key={column.field}
        role="none"
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
          onStartEdit={handlers.onStartEdit}
          onEditChange={onEditChange}
          onStopEdit={onStopEdit}
          onClick={handlers.onClick}
          onDoubleClick={handlers.onDoubleClick}
          isSelected={cellSelected}
          isFocused={cellFocused}
          onMouseDown={handlers.onMouseDown}
          onMouseEnter={handlers.onMouseEnter}
          onContextMenu={handlers.onContextMenu}
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
      ref={rowElRef}
      role="row"
      aria-selected={showCheckboxColumn || onCheckboxChange ? isSelected : undefined}
      aria-rowindex={row.rowIndex + 1}
      className={cn(
        'fibogrid-row flex border-b border-border group/row text-sm',
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
      onClick={(e) => onRowClick(row.id, e)}
      onDoubleClick={(e) => onRowDoubleClick(row.id, e)}
      onContextMenu={onContextMenu ? (e) => onContextMenu(row.id, e) : undefined}
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
          style={{ width: 'var(--fibogrid-row-number-width, 50px)', minWidth: 'var(--fibogrid-row-number-width, 50px)', maxWidth: 'var(--fibogrid-row-number-width, 50px)', flexShrink: 0, flexGrow: 0 }}
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
          style={{ width: 'var(--fibogrid-checkbox-column-width, 48px)', minWidth: 'var(--fibogrid-checkbox-column-width, 48px)', maxWidth: 'var(--fibogrid-checkbox-column-width, 48px)', flexShrink: 0, flexGrow: 0 }}
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
            aria-label={selectRowLabel}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {centerColumns.map((column) => renderCell(column, false, undefined, undefined))}
      <div className="flex-1 min-w-0 pointer-events-none" />
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
          title={addChildRowLabel}
          aria-label={addChildRowLabel}
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
  if (prevProps.selectionVersion !== nextProps.selectionVersion) return false;
  if (prevProps.isEven !== nextProps.isEven) return false;
  if (prevProps.rowNumber !== nextProps.rowNumber) return false;
  if (prevProps.row.rowIndex !== nextProps.row.rowIndex) return false;
  if (prevProps.dropPosition !== nextProps.dropPosition) return false;
  if (prevProps.rowHeight !== nextProps.rowHeight) return false;
  if (prevProps.level !== nextProps.level) return false;
  if (prevProps.hasChildren !== nextProps.hasChildren) return false;
  const prevEdit = prevProps.editingCell;
  const nextEdit = nextProps.editingCell;
  const rowId = nextProps.row.id;
  const prevIsEditing = prevEdit?.rowId === rowId;
  const nextIsEditing = nextEdit?.rowId === rowId;
  if (prevIsEditing || nextIsEditing) {
    if (
      prevIsEditing !== nextIsEditing ||
      prevEdit?.field !== nextEdit?.field ||
      prevEdit?.value !== nextEdit?.value
    ) {
      return false;
    }
  }
  const nextFocus = focusedFieldForRow(nextProps.isCellFocused, nextProps.row.id, nextProps.columns);
  const prevFocus = prevProps.isCellFocused === nextProps.isCellFocused
    ? (rowFocusCache.get(nextProps.row.id) ?? null)
    : focusedFieldForRow(prevProps.isCellFocused, prevProps.row.id, prevProps.columns);
  if (prevFocus !== nextFocus) return false;
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