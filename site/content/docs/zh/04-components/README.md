# 04 - 组件

## 位置

```
src/components/FiboGrid/components/
```

## 索引

| 文件 | 内容 |
|------|------|
| [README.md](./README.md) | FiboGrid、GridToolbar、GridStatusBar、ColumnMenu、GroupRow、ColumnPanel、FilterPanel |
| [special-renderers.md](./special-renderers.md) | RowNumberRenderer、CheckboxCellRenderer、CheckboxHeaderRenderer、GridContext |

---

## FiboGrid<T>

主组件。接收数据、列和配置。

```tsx
import { FiboGrid } from 'fibogrid';

<FiboGrid<MeuTipo>
  rowData={dados}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  pagination
  paginationPageSize={20}
  rowSelection="multiple"
  showToolbar
  showStatusBar
  theme="light"
  onGridReady={(e) => console.log('Grid pronto:', e.api)}
/>
```

### 主要 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rowData` | `T[]` | 必填 | 数据数组 |
| `columnDefs` | `ColumnDef<T>[]` | 必填 | 列定义 |
| `getRowId` | `(data: T) => string` | 自动 | 生成行唯一 ID 的函数 |
| `gridId` | `string` | 自动 | 在 GridRegistry 中注册所用的 ID |
| `pagination` | `boolean` | `false` | 启用分页 |
| `paginationPageSize` | `number` | `10` | 每页条数 |
| `paginationPageSizeOptions` | `number[]` | `[10,20,50]` | 每页条数选项 |
| `paginationMode` | `'client' \| 'server'` | `'client'` | 分页模式 |
| `serverSideDataSource` | `ServerSideDataSource<T>` | — | 服务端数据源 |
| `rowSelection` | `'single' \| 'multiple'` | — | 选择类型 |
| `rangeCellSelection` | `boolean` | `false` | Excel 风格选择 |
| `rowDragEnabled` | `boolean` | `false` | 行拖拽 |
| `defaultColDef` | `Partial<ColumnDef<T>>` | — | 所有列的默认值 |
| `rowHeight` | `number` | `40` | 行高（px） |
| `headerHeight` | `number` | `44` | 表头高度 |
| `height` | `number \| string` | — | 表格高度 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 主题 |
| `loading` | `boolean` | `false` | 显示加载覆盖层 |
| `quickFilterText` | `string` | — | 快速过滤文本 |
| `showToolbar` | `boolean` | `false` | 显示工具栏 |
| `showStatusBar` | `boolean` | `false` | 显示状态栏 |
| `contextMenu` | `boolean` | `false` | 上下文菜单（右键） |
| `groupByFields` | `string[]` | — | 用于分组的字段 |
| `groupAggregations` | `Record<string, AggFunc>` | — | 按字段的聚合 |
| `treeData` | `boolean` | `false` | 层级数据 |
| `lang` | `FiboGridLocale` | `enUS` | 语言 |
| `shortcuts` | `boolean \| ShortcutDef[]` | `false` | 键盘快捷键 |
| `configs` | `FiboGridConfigs` | — | 高级布局配置 |
| `egress` | `GridEgress[]` | — | 出站权限 |
| `ingress` | `GridIngress[]` | — | 入站权限 |

### 事件 Props

| Prop | 类型 |
|------|------|
| `onGridReady` | `(event: GridReadyEvent<T>) => void` |
| `onSelectionChanged` | `(event: SelectionChangedEvent<T>) => void` |
| `onRowClicked` | `(event: RowClickedEvent<T>) => void` |
| `onRowDoubleClicked` | `(event: RowDoubleClickedEvent<T>) => void` |
| `onRowClickFallback` | `(event: RowClickFallbackEvent<T>) => void` |
| `onCellClicked` | `(event: CellClickedEvent<T>) => void` |
| `onCellDoubleClicked` | `(event: CellDoubleClickedEvent<T>) => void` |
| `onCellValueChanged` | `(event: CellValueChangedEvent<T>) => void` |
| `onSortChanged` | `(event: SortChangedEvent) => void` |
| `onFilterChanged` | `(event: FilterChangedEvent) => void` |
| `onPaginationChanged` | `(event: PaginationChangedEvent) => void` |
| `onColumnResized` | `(event: ColumnResizedEvent<T>) => void` |
| `onColumnMoved` | `(event: ColumnMovedEvent<T>) => void` |
| `onRowDragStart` | `(event: RowDragEvent<T>) => void` |
| `onRowDragEnd` | `(event: RowDragEvent<T>) => void` |
| `onRowDragMove` | `(event: RowDragEvent<T>) => void` |
| `onGlobalFilterChange` | `(event: GlobalFilterChangedEvent<T>) => void` |
| `onFilterRemoved` | `(event: FilterRemovedEvent<T>) => void` |

---

## GridToolbar

带有搜索、过滤、导出和列管理的工具栏。

```tsx
import { GridToolbar } from 'fibogrid';

<GridToolbar
  api={gridApi}
  columns={columns}
  filterModel={filterModel}
  quickFilter={quickFilter}
  onQuickFilterChange={setQuickFilter}
  configs={configs.header}
  lang={lang}
/>
```

### 功能

- 快速搜索（quick filter）
- 带有活动过滤器计数的过滤按钮
- 列切换（显示/隐藏）
- 导出按钮（CSV/Excel）
- 复制到剪贴板按钮
- 密度切换（compact/normal/comfortable）
- 通过 `configs.header.customActions` 添加自定义操作

---

## GridStatusBar

位于底部的状态栏，显示汇总信息。

```tsx
import { GridStatusBar } from 'fibogrid';

<GridStatusBar
  displayedRowCount={100}
  totalRowCount={500}
  selectedCount={5}
  aggregations={aggregations}
  lang={lang}
/>
```

### 显示的信息

- 总行数
- 已选中行数
- 聚合（求和、平均、最小、最大、计数）

---

## ColumnMenu

每列的上下文菜单（点击表头）。

```tsx
import { ColumnMenu } from 'fibogrid';
```

### 选项

- 升序/降序排序
- 固定列（左侧/右侧/不固定）
- 自动调整宽度
- 过滤该列
- 隐藏该列

---

## GroupRow

启用 `groupByFields` 时的分组行。

```tsx
import { GroupRow } from 'fibogrid';
```

### 功能

- 展开/折叠分组
- 显示子项数量
- 显示聚合值

---

## ColumnPanel

用于管理列可见性和顺序的侧边面板。

```tsx
import { ColumnPanel } from 'fibogrid';
```

---

## FilterPanel

支持多条件的高级过滤面板。

```tsx
import { FilterPanel } from 'fibogrid';
```

### 支持的过滤器类型

| 类型 | 运算符 |
|------|--------|
| `text` | contains, equals, startsWith, endsWith |
| `number` | equals, greaterThan, lessThan, between |
| `date` | equals, after, before, between |
| `select` | 多值选择 |
| `boolean` | true / false |

---

## 内部组件

| 组件 | 说明 |
|------|------|
| `GridHeader` | 带排序指示器和调整大小手柄的表头 |
| `GridRow` | 支持选择、悬停、拖拽和自定义 class 的行 |
| `GridCell` | 带 renderer、editor 和格式化的单元格 |
| `GridFooter` | 页脚容器 |
| `GridPagination` | 分页导航控件 |
| `GridOverlay` | 加载和"无数据"覆盖层 |
| `ContextMenu` | 带子菜单的右键菜单 |
| `FilterPopover` | 过滤值选择弹出层 |
| `VirtualFilterList` | 过滤器中的值虚拟化列表 |
| `SpecialRenderers` | 内置 Renderers（checkbox、rowNumber、action） |
