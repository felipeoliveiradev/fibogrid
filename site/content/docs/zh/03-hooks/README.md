# 03 - Hooks

## 位置

```
src/components/FiboGrid/hooks/
```

---

## useFiboGrid（主 Hook — 外部访问）

用于在 FiboGrid 树之外的任意组件中访问表格的 Hook。需要 `GridRegistryProvider`。

```typescript
import { useFiboGrid } from 'fibogrid';

const { grid, events, registry } = useFiboGrid<MeuTipo>('meu-grid-id');

// Acessar dados
const rows = grid.getSelectedRows();

// Ouvir eventos
events.onSelectionChanged().listen((event) => {
  console.log('Selecao mudou:', event.selectedRows);
});

// Acessar outro grid
const outroGrid = registry.getGridApi('outro-grid');
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `gridId` | `string` | 在 GridRegistry 中注册的表格 ID |

### 返回值（`UseFiboGridReturn<T>`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `grid` | `GridApi<T>` | 完整的表格 API |
| `events` | `EventBuilder<T>` | 事件订阅 Builder |
| `registry` | `GridRegistryContextValue<T>` | 访问表格注册表 |

---

## useGridState

中央状态编排器。整合所有内部子 Hooks。

```typescript
import { useGridState } from 'fibogrid';

const state = useGridState<MeuTipo>(props, containerWidth);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `props` | `FiboGridProps<T>` | FiboGrid 组件的 Props |
| `containerWidth` | `number` | 容器宽度（px） |

### 返回值（完整）

| 字段 | 类型 | 说明 |
|------|------|------|
| `rows` | `RowNode<T>[]` | 所有行（排序/过滤之前） |
| `allRows` | `RowNode<T>[]` | rows 的别名 |
| `displayedRows` | `RowNode<T>[]` | 经过排序/过滤/分页后的行 |
| `finalDisplayedRows` | `RowNode<T>[]` | 最终行（含分组） |
| `columns` | `ColumnDef<T>[]` | 原始列 |
| `sortModel` | `SortModel[]` | 排序模型 |
| `setSortModel` | `(model: SortModel[]) => void` | 更新排序 |
| `filterModel` | `FilterModel[]` | 过滤模型 |
| `setFilterModel` | `(model: FilterModel[], opts?) => void` | 更新过滤器 |
| `quickFilter` | `string` | 快速过滤文本 |
| `setQuickFilter` | `(text: string) => void` | 更新快速过滤 |
| `selection` | `SelectionState` | 选择状态 |
| `selectRow` | `(id, selected?) => void` | 选择行 |
| `selectAll` | `() => void` | 全选 |
| `deselectAll` | `() => void` | 取消全选 |
| `paginationState` | `PaginationState` | 分页状态 |
| `setPaginationState` | `(state) => void` | 更新分页 |
| `editingCell` | `EditingCell \| null` | 正在编辑的单元格 |
| `setEditingCell` | `(cell) => void` | 设置正在编辑的单元格 |
| `api` | `GridApi<T>` | 公共 API（带安全机制） |
| `internalApi` | `GridApi<T>` | 内部 API（无安全机制） |
| `setColumnOrder` | `(order: string[]) => void` | 重新排序列 |
| `setColumnWidths` | `(widths: Record<string, number>) => void` | 调整列宽 |
| `setColumnPinned` | `(field, pinned) => void` | 固定列 |
| `serverSideLoading` | `boolean` | 服务端加载中 |
| `hasCustomRowNumber` | `boolean` | 是否有自定义 rowNumber 列 |
| `hasCustomCheckbox` | `boolean` | 是否有自定义 checkbox 列 |
| `fireEvent` | `(type, data) => void` | 手动触发事件 |
| `grouping` | `UseGroupingResult<T>` | 分组状态 |

---

## useVirtualization

用于大数据集的虚拟滚动。仅渲染视口中可见的行。

```typescript
import { useVirtualization } from 'fibogrid';

const result = useVirtualization<MeuTipo>(rows, options);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `rows` | `RowNode<T>[]` | 需要虚拟化的行 |
| `options` | `VirtualizationOptions` | 配置 |

### VirtualizationOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rowHeight` | `number` | `40` | 每行高度（px） |
| `overscan` | `number` | `5` | 上下额外渲染的行数 |
| `containerHeight` | `number` | — | 视口高度 |

### 返回值（`VirtualizationResult<T>`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `virtualRows` | `RowNode<T>[]` | 仅可见行（+ overscan） |
| `totalHeight` | `number` | 滚动总高度（所有行） |
| `offsetTop` | `number` | 用于定位行的 Y 偏移 |
| `startIndex` | `number` | 第一个可见行的索引 |
| `endIndex` | `number` | 最后一个可见行的索引 |
| `scrollTop` | `number` | 当前滚动位置 |
| `handleScroll` | `(event) => void` | 滚动事件处理函数 |
| `scrollToRow` | `(index: number) => void` | 滚动到某一行 |
| `containerRef` | `RefObject<HTMLDivElement>` | 容器的 Ref |

---

## useColumnResize

通过拖动表头分隔线来控制列宽调整。

```typescript
import { useColumnResize } from 'fibogrid';

const result = useColumnResize(onResize);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `onResize` | `(field: string, width: number) => void` | 调整大小的回调 |

### 返回值（`ColumnResizeResult`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `isResizing` | `boolean` | 正在调整大小 |
| `resizingColumn` | `string \| null` | 正在被调整的列的字段 |
| `handleResizeStart` | `(field, startX, startWidth) => void` | 开始调整大小 |
| `handleResizeDoubleClick` | `(field) => void` | 双击时自动调整大小 |

---

## useColumnDrag

用于列重新排序的拖放。

```typescript
import { useColumnDrag } from 'fibogrid';

const result = useColumnDrag(onColumnMove);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `onColumnMove` | `(fromIndex: number, toIndex: number) => void` | 移动回调 |

### 返回值（`ColumnDragResult`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `isDragging` | `boolean` | 正在拖拽 |
| `draggedColumn` | `string \| null` | 正在被拖拽的列的字段 |
| `dragOverColumn` | `string \| null` | 光标下方的列的字段 |
| `handleDragStart` | `(field, index) => void` | 开始拖拽 |
| `handleDragOver` | `(field, index) => void` | 光标经过列 |
| `handleDragEnd` | `() => void` | 结束拖拽 |
| `handleDrop` | `(targetIndex) => void` | 放下列 |

---

## useRowDrag

用于行重新排序的拖放。

```typescript
import { useRowDrag } from 'fibogrid';

const result = useRowDrag(onRowMove, onDragStart, onDragEnd, onDragMove);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `onRowMove` | `(fromIndex, toIndex) => void` | 移动回调 |
| `onDragStart` | `(event: RowDragEvent<T>) => void` | 可选：拖拽开始 |
| `onDragEnd` | `(event: RowDragEvent<T>) => void` | 可选：拖拽结束 |
| `onDragMove` | `(event: RowDragEvent<T>) => void` | 可选：拖拽过程中 |

### 返回值（`RowDragResult<T>`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `isDragging` | `boolean` | 正在拖拽 |
| `draggedRow` | `RowNode<T> \| null` | 正在被拖拽的行 |
| `dropTargetRow` | `RowNode<T> \| null` | 放置目标行 |
| `dropPosition` | `'above' \| 'below' \| null` | 放置的相对位置 |
| `handleDragStart` | `(row, event) => void` | 开始拖拽 |
| `handleDragOver` | `(row, event) => void` | 光标经过行 |
| `handleDrop` | `(event) => void` | 放下行 |
| `handleDragEnd` | `() => void` | 结束拖拽 |

---

## useRangeSelection

Excel 风格的单元格范围选择（点击 + 拖动）。

```typescript
const result = useRangeSelection<MeuTipo>();
```

### 返回值（`RangeSelectionResult`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `isSelecting` | `boolean` | 正在选择 |
| `selectionStart` | `{rowId, field} \| null` | 起始单元格 |
| `selectionEnd` | `{rowId, field} \| null` | 结束单元格 |
| `selectedCells` | `Set<string>` | 已选中的单元格（格式 "rowId:field"） |
| `handleCellMouseDown` | `(rowId, field, event) => void` | 在单元格上按下鼠标 |
| `handleCellMouseEnter` | `(rowId, field) => void` | 鼠标进入单元格 |
| `handleMouseUp` | `() => void` | 鼠标松开（结束选择） |
| `clearSelection` | `() => void` | 清除选择 |
| `isCellSelected` | `(rowId, field) => boolean` | 检查单元格是否被选中 |

---

## useRowRangeSelection

行范围选择（Shift+Click 选择多行）。

```typescript
const result = useRowRangeSelection<MeuTipo>();
```

### 返回值（`RowRangeSelectionResult`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `isDraggingRows` | `boolean` | 正在进行范围选择 |
| `handleRowMouseDown` | `(rowIndex, event) => void` | 在行上按下鼠标 |
| `handleRowMouseEnter` | `(rowIndex) => void` | 鼠标进入行 |
| `handleRowMouseUp` | `() => void` | 鼠标松开（结束） |

---

## useKeyboardNavigation

支持自定义快捷键的键盘导航。

```typescript
const result = useKeyboardNavigation<MeuTipo>(props);
```

### 参数（`UseKeyboardNavigationProps<T>`）

| 参数 | 类型 | 说明 |
|------|------|------|
| `containerRef` | `RefObject<HTMLDivElement>` | 表格容器的 Ref |
| `displayedRows` | `RowNode<T>[]` | 显示的行 |
| `columns` | `ProcessedColumn<T>[]` | 已处理的列 |
| `api` | `GridApi<T>` | 表格 API |
| `onStartEdit` | `(rowId, field) => void` | 开始编辑的回调 |
| `onStopEdit` | `(cancel?) => void` | 停止编辑的回调 |
| `isEditing` | `boolean` | 是否处于编辑模式 |
| `shortcuts` | `boolean \| ShortcutDef<T>[]` | 自定义快捷键 |

### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `focusedCell` | `{rowId, field} \| null` | 获得焦点的单元格 |
| `focusCell` | `(rowIndex, colIndex) => void` | 按索引聚焦单元格 |
| `isCellFocused` | `(rowId, field) => boolean` | 检查是否有焦点 |
| `setFocusedCell` | `(cell) => void` | 手动设置焦点 |
| `handleKeyDown` | `(event) => void` | 键盘处理函数 |

---

## useCellSelection

支持填充柄的单个单元格选择。

```typescript
const result = useCellSelection<MeuTipo>(rows, columns);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `rows` | `RowNode<T>[]` | 显示的行 |
| `columns` | `ProcessedColumn<T>[]` | 已处理的列 |

### 返回值（`UseCellSelectionResult`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `selectedRange` | `{start, end} \| null` | 已选中的范围 |
| `isSelecting` | `boolean` | 正在选择 |
| `isCellSelected` | `(rowId, field) => boolean` | 单元格是否被选中 |
| `handleCellMouseDown` | `(rowId, field, event) => void` | 鼠标按下 |
| `handleCellMouseEnter` | `(rowId, field) => void` | 鼠标进入 |
| `handleMouseUp` | `() => void` | 鼠标松开 |
| `clearSelection` | `() => void` | 清除 |
| `getSelectedCells` | `() => {rowId, field, value}[]` | 获取已选中的单元格 |
| `fillHandlePosition` | `{rowId, field} \| null` | 填充柄位置 |
| `isFillHandleDragging` | `boolean` | 填充柄正在被拖动 |
| `fillRange` | `{start, end} \| null` | 填充范围 |

---

## useFillHandle

用于扩展数值的填充柄（拖动选区右下角）。

```typescript
const result = useFillHandle<MeuTipo>(options);
```

### 参数（`UseFillHandleOptions<T>`）

| 参数 | 类型 | 说明 |
|------|------|------|
| `rows` | `RowNode<T>[]` | 显示的行 |
| `columns` | `ProcessedColumn<T>[]` | 已处理的列 |
| `onFill` | `(source, target) => void` | 填充回调 |

### 返回值（`UseFillHandleResult`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `fillRange` | `{start, end} \| null` | 填充范围 |
| `isFilling` | `boolean` | 正在填充 |
| `handleFillStart` | `(rowId, field) => void` | 开始填充 |
| `handleFillMove` | `(rowId, field) => void` | 移动填充 |
| `handleFillEnd` | `() => void` | 结束填充 |
| `getFillHandlePosition` | `() => {x, y} \| null` | 填充柄的可视位置 |

---

## useUndoRedo

具有可配置历史记录的撤销/重做系统。

```typescript
const result = useUndoRedo<MeuTipo>({ maxHistory: 50 });
```

### 参数（`UseUndoRedoOptions<T>`）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxHistory` | `number` | `50` | 历史记录中的最大操作数 |

### 返回值（`UseUndoRedoResult<T>`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `recordChange` | `(change) => void` | 将变更记录到历史中 |
| `undo` | `() => Change \| undefined` | 撤销上一次变更 |
| `redo` | `() => Change \| undefined` | 重做已撤销的变更 |
| `canUndo` | `boolean` | 是否有可撤销的操作 |
| `canRedo` | `boolean` | 是否有可重做的操作 |
| `clearHistory` | `() => void` | 清空全部历史 |

---

## useGrouping

按字段对行进行分组，支持聚合和展开。

```typescript
const result = useGrouping<MeuTipo>(options);
```

### 参数（`UseGroupingOptions<T>`）

| 参数 | 类型 | 说明 |
|------|------|------|
| `rows` | `RowNode<T>[]` | 需要分组的行 |
| `groupByFields` | `string[]` | 用于分组的字段 |
| `splitByField` | `string` | 用于拆分的字段 |
| `aggregations` | `Record<string, AggFunc>` | 聚合函数 |
| `getRowId` | `(data: T) => string` | ID 函数 |
| `overrides` | `Record<string, any>` | 值的覆盖 |

### 返回值（`UseGroupingResult<T>`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `displayRows` | `GroupableRowNode<T>[]` | 可直接显示的行（含分组） |
| `groupedRows` | `GroupableRowNode<T>[]` | 已分组的行（层级结构） |
| `expandedGroups` | `Set<string>` | 已展开分组的 ID |
| `toggleGroupExpand` | `(groupId: string) => void` | 展开/折叠分组 |
| `expandAllGroups` | `() => void` | 展开所有分组 |
| `collapseAllGroups` | `() => void` | 折叠所有分组 |
| `setGroupByFields` | `(fields: string[]) => void` | 更改分组字段 |
| `isGroupRow` | `(node) => boolean` | 检查是否为分组行 |
| `addChildToRow` | `(parentId, data) => void` | 为某行添加子项 |
| `expandedRows` | `Set<string>` | 已展开行的 ID（树形） |
| `toggleRowExpand` | `(rowId: string) => void` | 展开/折叠树形行 |
| `hasChildren` | `boolean` | 是否有行含子项 |

---

## useServerSideData

从服务器加载数据，带有加载和错误状态。

```typescript
const result = useServerSideData<MeuTipo>(enabled, dataSource, request);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `enabled` | `boolean` | 服务端模式是否启用 |
| `dataSource` | `ServerSideDataSource<T>` | 远程数据源 |
| `request` | `ServerSideDataSourceRequest` | 当前请求（page、sort、filter） |

### 返回值（`ServerSideDataState<T>`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `data` | `T[]` | 从服务器接收的数据 |
| `totalRows` | `number` | 服务器上的总行数 |
| `loading` | `boolean` | 正在加载 |
| `error` | `Error \| null` | 上一次请求的错误 |
| `refresh` | `() => void` | 重新加载数据 |
| `updateData` | `(data: T[]) => void` | 在本地更新数据 |

---

## useGridEvents

通过 Registry 为特定表格创建 EventBuilder。

```typescript
import { useGridEvents } from 'fibogrid';

const events = useGridEvents<MeuTipo>('meu-grid-id');
events.onSelectionChanged().listen(handler);
events.onFilterChanged().listen(handler);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `gridId` | `string` | 表格 ID |

### 返回值

`EventBuilder<T>` — 完整详情见 05-api 章节。

---

## useGridEvent

声明式 Hook，用于订阅表格的某个特定事件。卸载时自动清理。

```typescript
import { useGridEvent } from 'fibogrid';

useGridEvent('meu-grid-id', 'selectionChanged', (event) => {
  console.log('Selecao:', event.selectedRows);
});
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `gridId` | `string` | 表格 ID |
| `eventName` | `string` | 事件名称 |
| `handler` | `(event: any) => void` | 事件回调 |

---

## 内部 Hooks（grid-state/）

由 `useGridState` 在内部使用的 Hooks。不直接导出，仅作参考文档。

### useGridColumns

列处理：flex 布局、宽度、固定、排序、可见性。

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `columnOrder` | `string[]` | 列顺序 |
| `setColumnOrder` | `(order) => void` | 重新排序 |
| `columnWidths` | `Record<string, number>` | 按字段的宽度 |
| `setColumnWidths` | `(widths) => void` | 调整大小 |
| `hiddenColumns` | `Set<string>` | 隐藏的列 |
| `setHiddenColumns` | `(hidden) => void` | 隐藏/显示 |
| `pinnedColumns` | `Record<string, 'left'\|'right'>` | 固定的列 |
| `setPinnedColumns` | `(pinned) => void` | 固定/取消固定 |
| `processedColumns` | `ProcessedColumn<T>[]` | 最终处理后的列 |
| `hasCustomRowNumber` | `boolean` | 已定义 rowNumber 列 |
| `hasCustomCheckbox` | `boolean` | 已定义 checkbox 列 |
| `columns` | `ColumnDef<T>[]` | 原始列 |
| `setColumnPinned` | `(field, pinned) => void` | 固定列 |

### useGridRows

创建 RowNodes、应用排序/过滤、管理 overrides 以及服务端数据。

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `rows` | `RowNode<T>[]` | 所有行 |
| `filteredRows` | `RowNode<T>[]` | 过滤之后 |
| `sortedRows` | `RowNode<T>[]` | 排序之后 |
| `displayedRows` | `RowNode<T>[]` | 分页之后 |
| `internalRowData` | `T[]` | 内部数据 |
| `overrides` | `Record<string, Record<string, any>>` | 编辑的 overrides |
| `setOverrides` | `(overrides) => void` | 设置 overrides |
| `historyRef` | `RefObject` | undo/redo 历史的 Ref |
| `serverSideState` | `ServerSideDataState<T>` | 服务端状态 |
| `totalRows` | `number` | 总行数（分页之前） |

### useGridSelection

支持 Shift 和 Ctrl 的单选/多选管理。

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `selection` | `SelectionState` | 选择状态 |
| `setSelection` | `(state) => void` | 设置选择 |
| `selectionRef` | `RefObject<SelectionState>` | 选择的稳定 Ref |
| `selectRow` | `(id, selected?, event?) => void` | 配合 Shift/Ctrl 选择 |
| `selectRows` | `(ids, selected?) => void` | 选择多行 |
| `selectAll` | `() => void` | 全选 |
| `deselectAll` | `() => void` | 取消全选 |

### useGridSortFilter

多列排序、组合过滤和快速过滤。

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `sortModel` | `SortModel[]` | 当前生效的排序模型 |
| `setSortModel` | `(model) => void` | 设置排序 |
| `filterModel` | `FilterModel[]` | 当前生效的过滤模型 |
| `setFilterModel` | `(model, opts?) => void` | 设置过滤器 |
| `quickFilter` | `string` | 快速过滤文本 |
| `setQuickFilter` | `(text) => void` | 设置快速过滤 |

### useGridEditing

带 overrides 的单元格行内编辑，并集成 undo/redo。

### useGridEventSystem

表格内部的事件发布/订阅。用于子 Hooks 之间的通信。

### useGridApi

组装完整的 GridApi<T>，带有安全代理（Ingress/Egress 校验）。

### useClickDetector

点击类型检测：单击、双击、三击、上下文菜单。使用内部计时器来区分连续点击。
