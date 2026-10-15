# 05 - Grid API

## 位置

```
src/components/FiboGrid/types.ts          # Interfaces
src/components/FiboGrid/hooks/grid-state/useGridApi.ts  # Implementacao
```

## 索引

| 文件 | 内容 |
|------|------|
| [README.md](./README.md) | GridApi、GridApiBuilder、GridManagerBuilder、EventBuilder |
| [utils.md](./utils.md) | helpers、grouping、shortcuts、excelExport、permissionValidator、CSS |

---

## GridApi<T>

表格的主要公共 API。可通过 `onGridReady`、`useFiboGrid` 或 `useGridState` 访问。

```typescript
// Via onGridReady
<FiboGrid onGridReady={(e) => { apiRef.current = e.api; }} />

// Via useFiboGrid (fora da arvore)
const { grid } = useFiboGrid<MeuTipo>('meu-grid');
grid.getSelectedRows();
```

---

## 数据方法

```typescript
// Obter dados
api.getRowData(): T[];
api.getDisplayedRows(): RowNode<T>[];
api.getRowNode(id: string): RowNode<T> | null;
api.getDisplayedRowCount(): number;
api.getDisplayedRowAtIndex(index: number): RowNode<T> | null;
api.forEachNode((node: RowNode<T>) => void): void;

// Modificar dados
api.setRowData(data: T[]): void;
api.updateRowData({ add?: T[], update?: T[], remove?: T[] }): void;
api.addChildToRow(parentId: string, data: T[]): void;
```

---

## 选择方法

```typescript
api.selectAll(): void;
api.deselectAll(): void;
api.selectRow(id: string, selected?: boolean): void;
api.selectRows(ids: string[], selected?: boolean): void;
api.getSelectedRows(): RowNode<T>[];
api.getSelectedNodes(): RowNode<T>[];
```

---

## 排序方法

```typescript
api.setSortModel(model: SortModel[]): void;
api.getSortModel(): SortModel[];
```

---

## 过滤方法

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

## 列方法

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

## 分页方法

```typescript
api.setPage(page: number): void;
api.setPageSize(size: number): void;
api.nextPage(): void;
api.previousPage(): void;
```

---

## 编辑方法

```typescript
api.startEditingCell(rowId: string, field: string): void;
api.stopEditing(cancel?: boolean): void;
api.undo(): void;
```

---

## 滚动方法

```typescript
api.ensureRowVisible(id: string): void;
api.ensureColumnVisible(field: string): void;
api.scrollTo({ top?: number, left?: number }): void;
```

---

## 导出方法

```typescript
api.exportToCsv(params?: ExportParams): void;
api.copyToClipboard(includeHeaders?: boolean): Promise<void>;
api.pasteFromClipboard(): Promise<void>;
```

---

## 刷新方法

```typescript
api.refreshCells(): void;
api.redrawRows(): void;
api.refresh(): void;
api.refreshSelection(): void;
```

---

## 事件方法

```typescript
api.addEventListener(eventType: string, listener: (event: any) => void): void;
api.removeEventListener(eventType: string, listener: (event: any) => void): void;
api.events(): EventBuilder<T>;
```

---

## 连接方法

```typescript
api.connect(sourceId: string): GridApi<T>;
```

返回经过 Ingress/Egress 权限校验的 API 版本。

---

## GridApiBuilder<T>（流式 API）

链式组合多个操作，并通过 `execute()` 原子地执行。

```typescript
api.params()
  .setFilterModel([{ field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' }])
  .setSortModel([{ field: 'nome', direction: 'asc' }])
  .setPage(0)
  .selectRows(['id1', 'id2'])
  .execute();
```

### 可用方法

| 方法 | 说明 |
|------|------|
| `setFilterModel(model, options?)` | 设置过滤器 |
| `removeFilter(field)` | 移除某个字段的过滤器 |
| `removeAllFilter()` | 移除所有过滤器 |
| `setQuickFilter(text)` | 设置快速过滤 |
| `removeQuickFilter()` | 移除快速过滤 |
| `setSortModel(model)` | 设置排序 |
| `removeSort(field)` | 移除某个字段的排序 |
| `removeAllSort()` | 移除所有排序 |
| `setPage(page)` | 跳转到指定页 |
| `setPageSize(size)` | 设置每页大小 |
| `setPagination(state)` | 设置部分分页状态 |
| `selectRow(id, selected?)` | 选中/取消选中行 |
| `selectRows(ids, selected?)` | 选中/取消选中多行 |
| `selectAll()` | 全选 |
| `deselectAll()` | 取消全选 |
| `updateRowData(updates)` | 新增/更新/删除数据 |
| `resetState()` | 重置完整状态 |
| `resetEdits()` | 重置编辑 |
| `resetCell(rowId, field)` | 重置指定单元格 |
| `resetRow(rowId)` | 重置指定行 |
| `gridManager(callback)` | 在 builder 内访问 Manager |
| `execute()` | 执行所有操作 |

---

## GridManagerBuilder<T>（高级 CRUD）

通过链式操作进行高级数据管理。

```typescript
api.manager()
  .add([{ id: 3, nome: 'Pedro' }])
  .update([{ id: 1, nome: 'João Atualizado' }])
  .remove(['2'])
  .execute();
```

### 可用方法

| 方法 | 说明 |
|------|------|
| `add(rows)` | 在末尾添加行 |
| `upAdd(rows)` | 在顶部添加行 |
| `key(keyName)` | 设置用于 merge 的键字段 |
| `mergeUnique(enable?)` | 基于键的唯一 merge |
| `replaceAll(rows, compareKey?)` | 替换所有数据 |
| `remove(rowIds)` | 按 ID 删除行 |
| `update(rows)` | 更新现有行 |
| `updateCell(rowId, field, value)` | 更新指定单元格 |
| `resetCell(rowId, field)` | 重置单元格 |
| `resetRow(rowId)` | 重置行 |
| `reset()` | 清除所有数据 |
| `resetEdits()` | 撤销所有编辑 |
| `setSelectionData(data)` | 为选中的行设置数据 |
| `split(rowId, options?)` | 拆分行（可选子行） |
| `execute()` | 执行所有操作 |

---

## EventBuilder<T>

带有流式 API 的事件订阅系统。

```typescript
const events = api.events();

// Subscrever com listen
const unsubscribe = events.onSelectionChanged().listen((event) => {
  console.log(event.selectedRows);
});

// Subscrever uma vez
events.onRowClicked().once((event) => {
  console.log('Primeiro click:', event.rowNode.data);
});

// Cancelar subscricao
events.onFilterChanged().off(handler);

// Usar em render (hook)
const selectedCount = useEventValue(events.onSelectionChanged().getCount(), 0);
```

### 专用订阅

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

注册直接处理函数（类似事件 props）。

```typescript
api.events().calls().onSelectionChanged = (event) => { ... };
api.events().calls().onSortChanged = (event) => { ... };
```

### DiffSubscription

跟踪变更，可访问旧值和新值。

```typescript
events.onSortChanged().getSortModel().old().listen(handler);    // valor anterior
events.onSortChanged().getSortModel().actual().listen(handler); // valor atual
events.onSortChanged().getSortModel().all().listen(handler);    // { old, actual }
events.onSortChanged().getSortModel().visual().listen(handler); // formatado
```
