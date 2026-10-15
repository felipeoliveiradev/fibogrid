# 03 - Hooks

## Location

```
src/components/FiboGrid/hooks/
```

---

## useFiboGrid (main hook — external access)

Hook to access the grid from any component outside the FiboGrid tree. Requires `GridRegistryProvider`.

```typescript
import { useFiboGrid } from 'fibogrid';

const { grid, events, registry } = useFiboGrid<MeuTipo>('meu-grid-id');

// Access data
const rows = grid.getSelectedRows();

// Listen to events
events.onSelectionChanged().listen((event) => {
  console.log('Selecao mudou:', event.selectedRows);
});

// Access another grid
const outroGrid = registry.getGridApi('outro-grid');
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `gridId` | `string` | ID of the grid registered in the GridRegistry |

### Return (`UseFiboGridReturn<T>`)

| Field | Type | Description |
|-------|------|-------------|
| `grid` | `GridApi<T>` | Full grid API |
| `events` | `EventBuilder<T>` | Event subscription builder |
| `registry` | `GridRegistryContextValue<T>` | Access to the grid registry |

---

## useGridState

Central state orchestrator. Combines all internal sub-hooks.

```typescript
import { useGridState } from 'fibogrid';

const state = useGridState<MeuTipo>(props, containerWidth);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `props` | `FiboGridProps<T>` | FiboGrid component props |
| `containerWidth` | `number` | Container width in px |

### Return (complete)

| Field | Type | Description |
|-------|------|-------------|
| `rows` | `RowNode<T>[]` | All rows (before sort/filter) |
| `allRows` | `RowNode<T>[]` | Alias of rows |
| `displayedRows` | `RowNode<T>[]` | Rows after sort/filter/page |
| `finalDisplayedRows` | `RowNode<T>[]` | Final rows (with grouping) |
| `columns` | `ColumnDef<T>[]` | Original columns |
| `sortModel` | `SortModel[]` | Sort model |
| `setSortModel` | `(model: SortModel[]) => void` | Update sort |
| `filterModel` | `FilterModel[]` | Filter model |
| `setFilterModel` | `(model: FilterModel[], opts?) => void` | Update filters |
| `quickFilter` | `string` | Quick filter text |
| `setQuickFilter` | `(text: string) => void` | Update quick filter |
| `selection` | `SelectionState` | Selection state |
| `selectRow` | `(id, selected?) => void` | Select row |
| `selectAll` | `() => void` | Select all |
| `deselectAll` | `() => void` | Deselect all |
| `paginationState` | `PaginationState` | Pagination state |
| `setPaginationState` | `(state) => void` | Update pagination |
| `editingCell` | `EditingCell \| null` | Cell being edited |
| `setEditingCell` | `(cell) => void` | Set cell being edited |
| `api` | `GridApi<T>` | Public API (with security) |
| `internalApi` | `GridApi<T>` | Internal API (without security) |
| `setColumnOrder` | `(order: string[]) => void` | Reorder columns |
| `setColumnWidths` | `(widths: Record<string, number>) => void` | Resize columns |
| `setColumnPinned` | `(field, pinned) => void` | Pin column |
| `serverSideLoading` | `boolean` | Server-side loading |
| `hasCustomRowNumber` | `boolean` | Has a custom rowNumber column |
| `hasCustomCheckbox` | `boolean` | Has a custom checkbox column |
| `fireEvent` | `(type, data) => void` | Fire event manually |
| `grouping` | `UseGroupingResult<T>` | Grouping state |

---

## useVirtualization

Virtual scrolling for large datasets. Renders only the rows visible in the viewport.

```typescript
import { useVirtualization } from 'fibogrid';

const result = useVirtualization<MeuTipo>(rows, options);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `rows` | `RowNode<T>[]` | Rows to virtualize |
| `options` | `VirtualizationOptions` | Configuration |

### VirtualizationOptions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `rowHeight` | `number` | `40` | Height of each row in px |
| `overscan` | `number` | `5` | Extra rows rendered above/below |
| `containerHeight` | `number` | — | Viewport height |

### Return (`VirtualizationResult<T>`)

| Field | Type | Description |
|-------|------|-------------|
| `virtualRows` | `RowNode<T>[]` | Only visible rows (+ overscan) |
| `totalHeight` | `number` | Total scroll height (all rows) |
| `offsetTop` | `number` | Y offset used to position the rows |
| `startIndex` | `number` | Index of the first visible row |
| `endIndex` | `number` | Index of the last visible row |
| `scrollTop` | `number` | Current scroll position |
| `handleScroll` | `(event) => void` | Scroll event handler |
| `scrollToRow` | `(index: number) => void` | Scroll to a row |
| `containerRef` | `RefObject<HTMLDivElement>` | Container ref |

---

## useColumnResize

Controls column resizing by dragging the header separator.

```typescript
import { useColumnResize } from 'fibogrid';

const result = useColumnResize(onResize);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `onResize` | `(field: string, width: number) => void` | Resize callback |

### Return (`ColumnResizeResult`)

| Field | Type | Description |
|-------|------|-------------|
| `isResizing` | `boolean` | Resize in progress |
| `resizingColumn` | `string \| null` | Field of the column being resized |
| `handleResizeStart` | `(field, startX, startWidth) => void` | Start resize |
| `handleResizeDoubleClick` | `(field) => void` | Auto-size on double-click |

---

## useColumnDrag

Drag-and-drop for column reordering.

```typescript
import { useColumnDrag } from 'fibogrid';

const result = useColumnDrag(onColumnMove);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `onColumnMove` | `(fromIndex: number, toIndex: number) => void` | Move callback |

### Return (`ColumnDragResult`)

| Field | Type | Description |
|-------|------|-------------|
| `isDragging` | `boolean` | Drag in progress |
| `draggedColumn` | `string \| null` | Field of the column being dragged |
| `dragOverColumn` | `string \| null` | Field of the column under the cursor |
| `handleDragStart` | `(field, index) => void` | Start drag |
| `handleDragOver` | `(field, index) => void` | Cursor over column |
| `handleDragEnd` | `() => void` | End drag |
| `handleDrop` | `(targetIndex) => void` | Drop column |

---

## useRowDrag

Row drag-and-drop for reordering.

```typescript
import { useRowDrag } from 'fibogrid';

const result = useRowDrag(onRowMove, onDragStart, onDragEnd, onDragMove);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `onRowMove` | `(fromIndex, toIndex) => void` | Move callback |
| `onDragStart` | `(event: RowDragEvent<T>) => void` | Optional: drag start |
| `onDragEnd` | `(event: RowDragEvent<T>) => void` | Optional: drag end |
| `onDragMove` | `(event: RowDragEvent<T>) => void` | Optional: during drag |

### Return (`RowDragResult<T>`)

| Field | Type | Description |
|-------|------|-------------|
| `isDragging` | `boolean` | Drag in progress |
| `draggedRow` | `RowNode<T> \| null` | Row being dragged |
| `dropTargetRow` | `RowNode<T> \| null` | Drop target row |
| `dropPosition` | `'above' \| 'below' \| null` | Relative drop position |
| `handleDragStart` | `(row, event) => void` | Start drag |
| `handleDragOver` | `(row, event) => void` | Cursor over row |
| `handleDrop` | `(event) => void` | Drop row |
| `handleDragEnd` | `() => void` | End drag |

---

## useRangeSelection

Excel-style cell range selection (click + drag).

```typescript
const result = useRangeSelection<MeuTipo>();
```

### Return (`RangeSelectionResult`)

| Field | Type | Description |
|-------|------|-------------|
| `isSelecting` | `boolean` | Selection in progress |
| `selectionStart` | `{rowId, field} \| null` | Start cell |
| `selectionEnd` | `{rowId, field} \| null` | End cell |
| `selectedCells` | `Set<string>` | Selected cells ("rowId:field" format) |
| `handleCellMouseDown` | `(rowId, field, event) => void` | Mouse down on cell |
| `handleCellMouseEnter` | `(rowId, field) => void` | Mouse enter on cell |
| `handleMouseUp` | `() => void` | Mouse up (finish selection) |
| `clearSelection` | `() => void` | Clear selection |
| `isCellSelected` | `(rowId, field) => boolean` | Check whether a cell is selected |

---

## useRowRangeSelection

Row range selection (Shift+Click to select multiple).

```typescript
const result = useRowRangeSelection<MeuTipo>();
```

### Return (`RowRangeSelectionResult`)

| Field | Type | Description |
|-------|------|-------------|
| `isDraggingRows` | `boolean` | Range selection in progress |
| `handleRowMouseDown` | `(rowIndex, event) => void` | Mouse down on row |
| `handleRowMouseEnter` | `(rowIndex) => void` | Mouse enter on row |
| `handleRowMouseUp` | `() => void` | Mouse up (finish) |

---

## useKeyboardNavigation

Keyboard navigation with support for custom shortcuts.

```typescript
const result = useKeyboardNavigation<MeuTipo>(props);
```

### Parameters (`UseKeyboardNavigationProps<T>`)

| Param | Type | Description |
|-------|------|-------------|
| `containerRef` | `RefObject<HTMLDivElement>` | Grid container ref |
| `displayedRows` | `RowNode<T>[]` | Displayed rows |
| `columns` | `ProcessedColumn<T>[]` | Processed columns |
| `api` | `GridApi<T>` | Grid API |
| `onStartEdit` | `(rowId, field) => void` | Callback to start editing |
| `onStopEdit` | `(cancel?) => void` | Callback to stop editing |
| `isEditing` | `boolean` | Whether in edit mode |
| `shortcuts` | `boolean \| ShortcutDef<T>[]` | Custom shortcuts |

### Return

| Field | Type | Description |
|-------|------|-------------|
| `focusedCell` | `{rowId, field} \| null` | Focused cell |
| `focusCell` | `(rowIndex, colIndex) => void` | Focus cell by indices |
| `isCellFocused` | `(rowId, field) => boolean` | Check focus |
| `setFocusedCell` | `(cell) => void` | Set focus manually |
| `handleKeyDown` | `(event) => void` | Keyboard handler |

---

## useCellSelection

Individual cell selection with fill handle support.

```typescript
const result = useCellSelection<MeuTipo>(rows, columns);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `rows` | `RowNode<T>[]` | Displayed rows |
| `columns` | `ProcessedColumn<T>[]` | Processed columns |

### Return (`UseCellSelectionResult`)

| Field | Type | Description |
|-------|------|-------------|
| `selectedRange` | `{start, end} \| null` | Selected range |
| `isSelecting` | `boolean` | Selection in progress |
| `isCellSelected` | `(rowId, field) => boolean` | Whether the cell is selected |
| `handleCellMouseDown` | `(rowId, field, event) => void` | Mouse down |
| `handleCellMouseEnter` | `(rowId, field) => void` | Mouse enter |
| `handleMouseUp` | `() => void` | Mouse up |
| `clearSelection` | `() => void` | Clear |
| `getSelectedCells` | `() => {rowId, field, value}[]` | Get selected cells |
| `fillHandlePosition` | `{rowId, field} \| null` | Fill handle position |
| `isFillHandleDragging` | `boolean` | Fill handle being dragged |
| `fillRange` | `{start, end} \| null` | Fill range |

---

## useFillHandle

Fill handle to extend values (drag the bottom-right corner of the selection).

```typescript
const result = useFillHandle<MeuTipo>(options);
```

### Parameters (`UseFillHandleOptions<T>`)

| Param | Type | Description |
|-------|------|-------------|
| `rows` | `RowNode<T>[]` | Displayed rows |
| `columns` | `ProcessedColumn<T>[]` | Processed columns |
| `onFill` | `(source, target) => void` | Fill callback |

### Return (`UseFillHandleResult`)

| Field | Type | Description |
|-------|------|-------------|
| `fillRange` | `{start, end} \| null` | Fill range |
| `isFilling` | `boolean` | Fill in progress |
| `handleFillStart` | `(rowId, field) => void` | Start fill |
| `handleFillMove` | `(rowId, field) => void` | Move fill |
| `handleFillEnd` | `() => void` | End fill |
| `getFillHandlePosition` | `() => {x, y} \| null` | Visual handle position |

---

## useUndoRedo

Undo/redo system with configurable history.

```typescript
const result = useUndoRedo<MeuTipo>({ maxHistory: 50 });
```

### Parameters (`UseUndoRedoOptions<T>`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `maxHistory` | `number` | `50` | Maximum number of operations in the history |

### Return (`UseUndoRedoResult<T>`)

| Field | Type | Description |
|-------|------|-------------|
| `recordChange` | `(change) => void` | Record a change in the history |
| `undo` | `() => Change \| undefined` | Undo the last change |
| `redo` | `() => Change \| undefined` | Redo an undone change |
| `canUndo` | `boolean` | Has operations to undo |
| `canRedo` | `boolean` | Has operations to redo |
| `clearHistory` | `() => void` | Clear the entire history |

---

## useGrouping

Row grouping by fields with aggregations and expansion.

```typescript
const result = useGrouping<MeuTipo>(options);
```

### Parameters (`UseGroupingOptions<T>`)

| Param | Type | Description |
|-------|------|-------------|
| `rows` | `RowNode<T>[]` | Rows to group |
| `groupByFields` | `string[]` | Fields to group by |
| `splitByField` | `string` | Field to split by |
| `aggregations` | `Record<string, AggFunc>` | Aggregation functions |
| `getRowId` | `(data: T) => string` | ID function |
| `overrides` | `Record<string, any>` | Value overrides |

### Return (`UseGroupingResult<T>`)

| Field | Type | Description |
|-------|------|-------------|
| `displayRows` | `GroupableRowNode<T>[]` | Rows ready for display (with groups) |
| `groupedRows` | `GroupableRowNode<T>[]` | Grouped rows (hierarchy) |
| `expandedGroups` | `Set<string>` | IDs of expanded groups |
| `toggleGroupExpand` | `(groupId: string) => void` | Expand/collapse group |
| `expandAllGroups` | `() => void` | Expand all groups |
| `collapseAllGroups` | `() => void` | Collapse all groups |
| `setGroupByFields` | `(fields: string[]) => void` | Change grouping fields |
| `isGroupRow` | `(node) => boolean` | Check whether it is a group row |
| `addChildToRow` | `(parentId, data) => void` | Add children to a row |
| `expandedRows` | `Set<string>` | IDs of expanded rows (tree) |
| `toggleRowExpand` | `(rowId: string) => void` | Expand/collapse tree row |
| `hasChildren` | `boolean` | Some row has children |

---

## useServerSideData

Loads data from the server with loading and error state.

```typescript
const result = useServerSideData<MeuTipo>(enabled, dataSource, request);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `enabled` | `boolean` | Whether server-side mode is active |
| `dataSource` | `ServerSideDataSource<T>` | Remote data source |
| `request` | `ServerSideDataSourceRequest` | Current request (page, sort, filter) |

### Return (`ServerSideDataState<T>`)

| Field | Type | Description |
|-------|------|-------------|
| `data` | `T[]` | Data received from the server |
| `totalRows` | `number` | Total rows on the server |
| `loading` | `boolean` | Loading in progress |
| `error` | `Error \| null` | Error from the last request |
| `refresh` | `() => void` | Reload data |
| `updateData` | `(data: T[]) => void` | Update data locally |

---

## useGridEvents

Creates an EventBuilder for a specific grid via the Registry.

```typescript
import { useGridEvents } from 'fibogrid';

const events = useGridEvents<MeuTipo>('meu-grid-id');
events.onSelectionChanged().listen(handler);
events.onFilterChanged().listen(handler);
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `gridId` | `string` | Grid ID |

### Return

`EventBuilder<T>` — see section 05-api for full details.

---

## useGridEvent

Declarative hook to subscribe to a specific event of a grid. Auto-cleanup on unmount.

```typescript
import { useGridEvent } from 'fibogrid';

useGridEvent('meu-grid-id', 'selectionChanged', (event) => {
  console.log('Selecao:', event.selectedRows);
});
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `gridId` | `string` | Grid ID |
| `eventName` | `string` | Event name |
| `handler` | `(event: any) => void` | Event callback |

---

## Internal Hooks (grid-state/)

Hooks used internally by `useGridState`. Not exported directly, but documented for reference.

### useGridColumns

Column processing: flex layout, widths, pinning, ordering, visibility.

| Return | Type | Description |
|--------|------|-------------|
| `columnOrder` | `string[]` | Column order |
| `setColumnOrder` | `(order) => void` | Reorder |
| `columnWidths` | `Record<string, number>` | Widths by field |
| `setColumnWidths` | `(widths) => void` | Resize |
| `hiddenColumns` | `Set<string>` | Hidden columns |
| `setHiddenColumns` | `(hidden) => void` | Hide/show |
| `pinnedColumns` | `Record<string, 'left'\|'right'>` | Pinned columns |
| `setPinnedColumns` | `(pinned) => void` | Pin/unpin |
| `processedColumns` | `ProcessedColumn<T>[]` | Final processed columns |
| `hasCustomRowNumber` | `boolean` | rowNumber column defined |
| `hasCustomCheckbox` | `boolean` | checkbox column defined |
| `columns` | `ColumnDef<T>[]` | Original columns |
| `setColumnPinned` | `(field, pinned) => void` | Pin column |

### useGridRows

Creation of RowNodes, application of sort/filter, management of overrides and server-side data.

| Return | Type | Description |
|--------|------|-------------|
| `rows` | `RowNode<T>[]` | All rows |
| `filteredRows` | `RowNode<T>[]` | After filters |
| `sortedRows` | `RowNode<T>[]` | After sort |
| `displayedRows` | `RowNode<T>[]` | After pagination |
| `internalRowData` | `T[]` | Internal data |
| `overrides` | `Record<string, Record<string, any>>` | Edit overrides |
| `setOverrides` | `(overrides) => void` | Set overrides |
| `historyRef` | `RefObject` | Undo/redo history ref |
| `serverSideState` | `ServerSideDataState<T>` | Server-side state |
| `totalRows` | `number` | Total rows (pre-pagination) |

### useGridSelection

Single/multiple selection management with Shift and Ctrl support.

| Return | Type | Description |
|--------|------|-------------|
| `selection` | `SelectionState` | Selection state |
| `setSelection` | `(state) => void` | Set selection |
| `selectionRef` | `RefObject<SelectionState>` | Stable selection ref |
| `selectRow` | `(id, selected?, event?) => void` | Select with Shift/Ctrl |
| `selectRows` | `(ids, selected?) => void` | Select multiple |
| `selectAll` | `() => void` | Select all |
| `deselectAll` | `() => void` | Deselect all |

### useGridSortFilter

Multi-column sort, composite filters, and quick filter.

| Return | Type | Description |
|--------|------|-------------|
| `sortModel` | `SortModel[]` | Active sort model |
| `setSortModel` | `(model) => void` | Set sort |
| `filterModel` | `FilterModel[]` | Active filter model |
| `setFilterModel` | `(model, opts?) => void` | Set filters |
| `quickFilter` | `string` | Quick filter text |
| `setQuickFilter` | `(text) => void` | Set quick filter |

### useGridEditing

Inline cell editing with overrides and undo/redo integration.

### useGridEventSystem

Internal grid event pub/sub. Used for communication between sub-hooks.

### useGridApi

Assembly of the full GridApi<T> with security proxies (Ingress/Egress validation).

### useClickDetector

Click type detection: single, double, triple, context menu. Uses an internal timer to tell consecutive clicks apart.
