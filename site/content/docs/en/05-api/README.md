# 05 - Grid API

## Location

```
src/components/FiboGrid/types.ts          # Interfaces
src/components/FiboGrid/hooks/grid-state/useGridApi.ts  # Implementation
```

## Index

| File | Contents |
|------|----------|
| [README.md](./README.md) | GridApi, GridApiBuilder, GridManagerBuilder, EventBuilder |
| [utils.md](./utils.md) | helpers, grouping, shortcuts, excelExport, permissionValidator, CSS |

---

## GridApi<T>

Main public grid API. Accessible via `onGridReady`, `useFiboGrid`, or `useGridState`.

```typescript
// Via onGridReady
<FiboGrid onGridReady={(e) => { apiRef.current = e.api; }} />

// Via useFiboGrid (outside the tree)
const { grid } = useFiboGrid<MeuTipo>('meu-grid');
grid.getSelectedRows();
```

---

## Data Methods

```typescript
// Get data
api.getRowData(): T[];
api.getDisplayedRows(): RowNode<T>[];
api.getRowNode(id: string): RowNode<T> | null;
api.getDisplayedRowCount(): number;
api.getDisplayedRowAtIndex(index: number): RowNode<T> | null;
api.forEachNode((node: RowNode<T>) => void): void;

// Modify data
api.setRowData(data: T[]): void;
api.updateRowData({ add?: T[], update?: T[], remove?: T[] }): void;
api.addChildToRow(parentId: string, data: T[]): void;
```

---

## Selection Methods

```typescript
api.selectAll(): void;
api.deselectAll(): void;
api.selectRow(id: string, selected?: boolean): void;
api.selectRows(ids: string[], selected?: boolean): void;
api.getSelectedRows(): RowNode<T>[];
api.getSelectedNodes(): RowNode<T>[];
```

---

## Sorting Methods

```typescript
api.setSortModel(model: SortModel[]): void;
api.getSortModel(): SortModel[];
```

---

## Filtering Methods

```typescript
api.setFilterModel(model: FilterModel[], options?: SetFilterOptions): void;
api.getFilterModel(): FilterModel[];
api.setQuickFilter(text: string): void;
```

### SetFilterOptions

```typescript
interface SetFilterOptions {
  behavior?: 'replace' | 'merge';
}
```

---

## Column Methods

```typescript
api.getColumnDefs(): ColumnDef<T>[];
api.setColumnVisible(field: string, visible: boolean): void;
api.setColumnPinned(field: string, pinned: 'left' | 'right' | null): void;
api.moveColumn(fromIndex: number, toIndex: number): void;
api.resizeColumn(field: string, width: number): void;
api.autoSizeColumn(field: string): void;
api.autoSizeAllColumns(): void;
```

---

## Pagination Methods

```typescript
api.setPage(page: number): void;
api.setPageSize(size: number): void;
api.nextPage(): void;
api.previousPage(): void;
```

---

## Editing Methods

```typescript
api.startEditingCell(rowId: string, field: string): void;
api.stopEditing(cancel?: boolean): void;
api.undo(): void;
```

---

## Scroll Methods

```typescript
api.ensureRowVisible(id: string): void;
api.ensureColumnVisible(field: string): void;
api.scrollTo({ top?: number, left?: number }): void;
```

---

## Export Methods

```typescript
api.exportToCsv(params?: ExportParams): void;
api.copyToClipboard(includeHeaders?: boolean): Promise<void>;
api.pasteFromClipboard(): Promise<void>;
```

---

## Refresh Methods

```typescript
api.refreshCells(): void;
api.redrawRows(): void;
api.refresh(): void;
api.refreshSelection(): void;
```

---

## Event Methods

```typescript
api.addEventListener(eventType: string, listener: (event: any) => void): void;
api.removeEventListener(eventType: string, listener: (event: any) => void): void;
api.events(): EventBuilder<T>;
```

---

## Connection Methods

```typescript
api.connect(sourceId: string): GridApi<T>;
```

Returns a version of the API with permissions validated via Ingress/Egress.

---

## GridApiBuilder<T> (Fluent API)

Chain operations and execute them atomically via `execute()`.

```typescript
api.params()
  .setFilterModel([{ field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' }])
  .setSortModel([{ field: 'nome', direction: 'asc' }])
  .setPage(0)
  .selectRows(['id1', 'id2'])
  .execute();
```

### Available Methods

| Method | Description |
|--------|-------------|
| `setFilterModel(model, options?)` | Set filters |
| `removeFilter(field)` | Remove the filter for a field |
| `removeAllFilter()` | Remove all filters |
| `setQuickFilter(text)` | Set quick filter |
| `removeQuickFilter()` | Remove quick filter |
| `setSortModel(model)` | Set sorting |
| `removeSort(field)` | Remove the sort for a field |
| `removeAllSort()` | Remove all sorting |
| `setPage(page)` | Go to page |
| `setPageSize(size)` | Set page size |
| `setPagination(state)` | Set partial pagination state |
| `selectRow(id, selected?)` | Select/deselect row |
| `selectRows(ids, selected?)` | Select/deselect multiple rows |
| `selectAll()` | Select all |
| `deselectAll()` | Deselect all |
| `updateRowData(updates)` | Add/update/remove data |
| `resetState()` | Reset the complete state |
| `resetEdits()` | Reset edits |
| `resetCell(rowId, field)` | Reset a specific cell |
| `resetRow(rowId)` | Reset a specific row |
| `gridManager(callback)` | Access the Manager inside the builder |
| `execute()` | Execute all operations |

---

## GridManagerBuilder<T> (Advanced CRUD)

Advanced data management with chained operations.

```typescript
api.manager()
  .add([{ id: 3, nome: 'Pedro' }])
  .update([{ id: 1, nome: 'João Atualizado' }])
  .remove(['2'])
  .execute();
```

### Available Methods

| Method | Description |
|--------|-------------|
| `add(rows)` | Append rows to the end |
| `upAdd(rows)` | Add rows at the top |
| `key(keyName)` | Set the key field for merge |
| `mergeUnique(enable?)` | Unique merge based on the key |
| `replaceAll(rows, compareKey?)` | Replace all data |
| `remove(rowIds)` | Remove rows by ID |
| `update(rows)` | Update existing rows |
| `updateCell(rowId, field, value)` | Update a specific cell |
| `resetCell(rowId, field)` | Reset cell |
| `resetRow(rowId)` | Reset row |
| `reset()` | Clear all data |
| `resetEdits()` | Undo all edits |
| `setSelectionData(data)` | Set data on the selected rows |
| `split(rowId, options?)` | Split row (with child option) |
| `execute()` | Execute all operations |

---

## EventBuilder<T>

Event subscription system with a fluent API.

```typescript
const events = api.events();

// Subscribe with listen
const unsubscribe = events.onSelectionChanged().listen((event) => {
  console.log(event.selectedRows);
});

// Subscribe once
events.onRowClicked().once((event) => {
  console.log('Primeiro click:', event.rowNode.data);
});

// Cancel subscription
events.onFilterChanged().off(handler);

// Use in render (hook)
const selectedCount = useEventValue(events.onSelectionChanged().getCount(), 0);
```

### Specialized Subscriptions

#### SelectionChangedSubscription

```typescript
events.onSelectionChanged().getRowData().listen(handler);
events.onSelectionChanged().getAllData().listen(handler);
events.onSelectionChanged().getIds().listen(handler);
events.onSelectionChanged().getCount().listen(handler);
events.onSelectionChanged().getFirstRow().listen(handler);
```

#### SortChangedSubscription

```typescript
events.onSortChanged().getSortModel().listen(handler);
events.onSortChanged().getFirstSort().listen(handler);
// DiffSubscription: .old(), .actual(), .all()
```

#### FilterChangedSubscription

```typescript
events.onFilterChanged().getFilterModel().listen(handler);
events.onFilterChanged().getFilterCount().listen(handler);
```

#### PaginationChangedSubscription

```typescript
events.onPaginationChanged().getCurrentPage().listen(handler);
events.onPaginationChanged().getPageSize().listen(handler);
events.onPaginationChanged().getTotalPages().listen(handler);
events.onPaginationChanged().getIsFirstPage().listen(handler);
events.onPaginationChanged().getIsLastPage().listen(handler);
events.onPaginationChanged().getNextPage().listen(handler);
events.onPaginationChanged().getPrevPage().listen(handler);
```

#### CellValueChangedSubscription

```typescript
events.onCellValueChanged().getNewValue().listen(handler);
events.onCellValueChanged().getOldValue().listen(handler);
events.onCellValueChanged().getField().listen(handler);
```

### EventBuilder.calls()

Register direct handlers (similar to event props).

```typescript
api.events().calls().onSelectionChanged = (event) => { ... };
api.events().calls().onSortChanged = (event) => { ... };
```

### DiffSubscription

Tracks changes with access to the old and new value.

```typescript
events.onSortChanged().getSortModel().old().listen(handler);    // previous value
events.onSortChanged().getSortModel().actual().listen(handler); // current value
events.onSortChanged().getSortModel().all().listen(handler);    // { old, actual }
events.onSortChanged().getSortModel().visual().listen(handler); // formatted
```
