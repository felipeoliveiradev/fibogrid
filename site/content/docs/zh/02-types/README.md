# 02 - 类型系统

## 位置

```
src/components/FiboGrid/types.ts
```

---

## ColumnDef<T>

列定义。控制外观、行为和交互。

```typescript
interface ColumnDef<T = any> {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  editable?: boolean | ((params: CellRendererParams<T>) => boolean);
  draggable?: boolean;
  pinned?: 'left' | 'right' | null;
  pinnedPriority?: number;
  hide?: boolean;
  filterLabel?: string;
  filterType?: FilterType;
  type?: 'data' | 'action' | 'checkbox' | 'rowNumber';
  cellEditor?: CellEditorType;
  cellEditorParams?: Record<string, any>;
  cellEditorRenderer?: (params: CellEditorParams<T>) => React.ReactNode;
  editAction?: (params: CellEditorParams<T>) => void;
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  headerRenderer?: (params: HeaderRendererParams<T>) => React.ReactNode;
  valueFormatter?: (value: any, row: T) => string;
  valueParser?: (value: string) => any;
  valueSetter?: (params: ValueSetterParams<T>) => boolean;
  comparator?: (a: any, b: any) => number;
  filterComparator?: (filterValue: any, cellValue: any) => boolean;
  cellClass?: string | ((params: CellRendererParams<T>) => string);
  headerClass?: string;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  rowDrag?: boolean;
  suppressMenu?: boolean;
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any);
  useInternalFilter?: boolean;
}
```

### 主要属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `field` | `string` | 数据对象中的字段 |
| `headerName` | `string` | 表头文本 |
| `width` | `number` | 固定宽度（px） |
| `flex` | `number` | 用于填充剩余空间的 flex 比例 |
| `sortable` | `boolean` | 允许排序 |
| `filterable` | `boolean` | 允许过滤 |
| `editable` | `boolean \| fn` | 允许编辑（可以是条件式） |
| `pinned` | `'left' \| 'right'` | 将列固定在左侧或右侧 |
| `pinnedPriority` | `number` | 固定列之间的顺序 |
| `type` | `string` | 特殊类型：action、checkbox、rowNumber |
| `cellRenderer` | `fn` | 自定义单元格渲染器 |
| `cellEditor` | `CellEditorType` | 行内编辑器类型 |
| `valueFormatter` | `fn` | 格式化显示值 |
| `aggFunc` | `string \| fn` | 分组时使用的聚合函数 |

---

## 基础类型

```typescript
type SortDirection = 'asc' | 'desc' | null;
type FilterType = 'text' | 'number' | 'date' | 'select' | 'boolean';
type CellEditorType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom' | 'action';
```

---

## RowNode<T>

行的内部表示。

```typescript
interface RowNode<T = any> {
  id: string;
  data: T;
  rowIndex: number;
  selected: boolean;
  expanded?: boolean;
  level?: number;
  parent?: RowNode<T>;
  children?: RowNode<T>[];
  highlighted?: boolean;
}
```

---

## ProcessedColumn<T>

经过内部处理后的列（已计算位置）。

```typescript
interface ProcessedColumn<T = any> extends ColumnDef<T> {
  computedWidth: number;
  left: number;
  index: number;
}
```

---

## SortModel / FilterModel

```typescript
interface SortModel {
  field: string;
  direction: SortDirection;
}

interface FilterModel<T = any> {
  field: string;
  filterType: FilterType;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  meta?: T;
}
```

---

## GridState<T>

表格的完整内部状态。

```typescript
interface GridState<T = any> {
  rows: RowNode<T>[];
  displayedRows: RowNode<T>[];
  columns: ProcessedColumn<T>[];
  sortModel: SortModel[];
  filterModel: FilterModel[];
  selection: SelectionState;
  pagination: PaginationState;
  editingCell: EditingCell | null;
  columnOrder: string[];
  scrollPosition: { top: number; left: number };
}
```

---

## SelectionState

```typescript
interface SelectionState {
  selectedRows: Set<string>;
  lastSelectedIndex: number | null;
  anchorIndex: number | null;
}
```

---

## PaginationState

```typescript
interface PaginationState {
  enabled: boolean;
  pageSize: number;
  currentPage: number;
  totalRows: number;
  totalPages: number;
}

type PaginationMode = 'client' | 'server';
```

---

## EditingCell

```typescript
interface EditingCell {
  rowId: string;
  field: string;
  value: any;
  originalValue: any;
}
```

---

## Server-Side（服务端）

```typescript
interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}

interface ServerSideDataSourceResponse<T = any> {
  data: T[];
  totalRows: number;
  page: number;
  pageSize: number;
}

interface ServerSideDataSource<T = any> {
  getRows: (request: ServerSideDataSourceRequest) => Promise<ServerSideDataSourceResponse<T>>;
}
```

---

## 渲染参数

```typescript
interface CellRendererParams<T = any> {
  value: any;
  data: T;
  rowIndex: number;
  colDef: ColumnDef<T>;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
  rowNode: RowNode<T>;
  selectedRows?: T[];
}

interface CellEditorParams<T = any> extends CellRendererParams<T> {
  update: (value: any) => void;
  stopEditing: (cancel?: boolean) => void;
}

interface HeaderRendererParams<T = any> {
  colDef: ColumnDef<T>;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
}

interface ValueSetterParams<T = any> {
  oldValue: any;
  newValue: any;
  data: T;
  column: ProcessedColumn<T>;
  api: GridApi<T>;
}

interface RowClassParams<T = any> {
  data: T;
  rowIndex: number;
  rowNode: RowNode<T>;
  api: GridApi<T>;
}
```

---

## 事件

```typescript
interface SelectionChangedEvent<T> {
  selectedRows: RowNode<T>[];
  oldSelectedRows?: RowNode<T>[];
  api: GridApi<T>;
}

interface CellClickedEvent<T> {
  rowNode: RowNode<T>;
  column: ProcessedColumn<T>;
  value: any;
  event: React.MouseEvent;
  api: GridApi<T>;
}

interface CellValueChangedEvent<T> {
  rowNode: RowNode<T>;
  column: ProcessedColumn<T>;
  oldValue: any;
  newValue: any;
  api: GridApi<T>;
}

interface RowClickedEvent<T> {
  rowNode: RowNode<T>;
  event: React.MouseEvent;
  api: GridApi<T>;
}

interface RowDragEvent<T> {
  rowNode: RowNode<T>;
  overNode?: RowNode<T>;
  overIndex?: number;
  api: GridApi<T>;
}

interface SortChangedEvent {
  sortModel: SortModel[];
  oldSortModel?: SortModel[];
}

interface FilterChangedEvent {
  filterModel: FilterModel[];
  oldFilterModel?: FilterModel[];
}

interface ColumnResizedEvent<T> {
  column: ProcessedColumn<T>;
  newWidth: number;
  oldWidth?: number;
}

interface ColumnMovedEvent<T> {
  column: ProcessedColumn<T>;
  fromIndex: number;
  toIndex: number;
}

interface PaginationChangedEvent {
  currentPage: number;
  oldCurrentPage?: number;
  pageSize: number;
  oldPageSize?: number;
  totalPages: number;
  totalRows: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface GridReadyEvent<T> {
  api: GridApi<T>;
}

interface RowClickFallbackEvent<T> {
  clickType: 'single' | 'double' | 'triple' | 'menu' | number;
  rowData: T;
  allRowsData: T[];
  rowNode: RowNode<T>;
  event: React.MouseEvent;
  api: GridApi<T>;
  cell?: {
    column: ProcessedColumn<T>;
    value: any;
    isEditable: boolean;
  };
}
```

---

## Keyboard Shortcuts（键盘快捷键）

```typescript
interface KeyboardEventParams<T = any> {
  event: React.KeyboardEvent | KeyboardEvent;
  api: GridApi<T>;
  focusRow: (index: number) => void;
  focusCell: (rowIndex: number, colIndex: number) => void;
  currentState: {
    rowIndex: number;
    colIndex: number;
    focusedCell: { rowId: string; field: string } | null;
  };
}

interface ShortcutDef<T = any> {
  id: string;
  keys: string | string[];
  action: (params: KeyboardEventParams<T>) => void;
  description?: string;
  preventDefault?: boolean;
}
```

---

## Context Menu（上下文菜单）

```typescript
interface ContextMenuItem {
  name?: string;
  action?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  subMenu?: ContextMenuItem[];
  separator?: boolean;
  cssClasses?: string[];
}
```

---

## 安全（Ingress/Egress）

```typescript
interface GridEgress {
  destiny: string;
  permissions: string[];
}

interface GridIngress {
  origin: string;
  permissions: string[];
}
```

---

## 布局

```typescript
type HeaderLayoutItem =
  | 'search' | 'active-filters' | 'filter-button' | 'density-button'
  | 'export-button' | 'columns-button' | 'copy-button' | 'refresh-button'
  | 'custom-actions' | 'spacer';

type FooterLayoutItem =
  | 'pagination' | 'pagination-page-size' | 'pagination-info'
  | 'pagination-controls' | 'status-bar' | 'status-info'
  | 'status-selected' | 'status-aggregations' | 'spacer';

type ZIndexType = {
  popover?: number;
  select?: number;
  modal?: number;
}
```
