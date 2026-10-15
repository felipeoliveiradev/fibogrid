# 05 - 工具函数

## 位置

```
src/components/FiboGrid/utils/
```

---

## helpers.ts

### generateRowId

为行生成或提取唯一 ID。

```typescript
function generateRowId<T>(data: T, index: number, getRowId?: (data: T) => string): string
```

- 如果提供了 `getRowId`，则使用它
- 否则，若存在 `data.id` 则使用之
- 否则，基于索引生成 ID

### createRowNode

根据原始数据创建 `RowNode<T>`。

```typescript
function createRowNode<T>(data: T, index: number, getRowId?: (data: T) => string): RowNode<T>
```

返回：`{ id, data, rowIndex, selected: false }`

### processColumns

计算列的宽度和位置（flex 布局）。

```typescript
function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[]
```

- 将 `defaultColDef` 与每一列合并
- 按剩余空间比例计算 `flex`
- 遵循 `minWidth` 和 `maxWidth`
- 计算 `left`（累计的水平位置）
- 确定最终的 `computedWidth`

### sortRows

对行应用多列排序。

```typescript
function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ColumnDef<T>[]
): RowNode<T>[]
```

- 支持多列，优先级按顺序排列
- 如果列定义了自定义 `comparator`，则使用它
- 回退到 `defaultComparator`

### filterRows

应用组合过滤器和快速过滤。

```typescript
function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ColumnDef<T>[],
  quickFilterText?: string
): RowNode<T>[]
```

- 所有过滤器均为 AND（所有条件必须同时为真）
- 快速过滤会在所有字段中搜索
- 如果列定义了自定义 `filterComparator`，则使用它
- 如果列定义了 `useInternalFilter`，则使用它

### fastComparator

针对原始类型的快速比较。

```typescript
function fastComparator(a: any, b: any): number
```

### defaultComparator

默认比较，支持 Date、字符串和数字。

```typescript
function defaultComparator(a: any, b: any): number
```

- 将 `null/undefined` 视为较小值
- 将 `Date` 转换为时间戳
- 字符串比较不区分大小写

### getValueFromPath

使用点号表示法深度访问属性。

```typescript
function getValueFromPath(obj: any, path: string): any
```

```typescript
getValueFromPath({ a: { b: { c: 42 } } }, 'a.b.c'); // 42
getValueFromPath({ items: [1, 2] }, 'items.0');      // 1
```

### setValueAtPath

使用点号表示法深度设置值。

```typescript
function setValueAtPath<T>(obj: T, path: string, value: any): T
```

返回新对象（不可变）。

---

## grouping.ts

### isGroupNode

用于判断节点是否为分组的类型守卫（type guard）。

```typescript
function isGroupNode<T>(node: GroupableRowNode<T>): node is GroupRowNode<T>
```

### groupRowsByFields

按一个或多个字段对行进行分组，并支持聚合。

```typescript
function groupRowsByFields<T>(
  rows: RowNode<T>[],
  groupFields: string[],
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any)>
): GroupableRowNode<T>[]
```

- 层级分组（多级）
- 按分组计算聚合
- 每个分组的 `children` 包含该组的行

### splitRowsByField

按字段拆分行 — 创建无层级的视觉分隔。

```typescript
function splitRowsByField<T>(rows: RowNode<T>[], splitField: string): GroupableRowNode<T>[]
```

### addChildRows

为父行添加子项（树形数据）。

```typescript
function addChildRows<T>(
  rows: RowNode<T>[],
  parentId: string,
  childData: T[],
  getRowId?: (data: T) => string
): RowNode<T>[]
```

### flattenGroupedRows

根据展开状态将分组层级扁平化。

```typescript
function flattenGroupedRows<T>(
  groupedRows: GroupableRowNode<T>[],
  expandedGroups: Set<string>
): GroupableRowNode<T>[]
```

- 已折叠的分组不包含子项
- 已展开的分组递归包含子项

### Grouping 类型

```typescript
interface GroupRowNode<T> {
  id: string;
  groupField: string;
  groupValue: any;
  children: GroupableRowNode<T>[];
  aggregations: Record<string, any>;
  level: number;
  expanded: boolean;
  rowCount: number;
}

interface RegularRowNode<T> extends RowNode<T> {
  level: number;
}

type GroupableRowNode<T> = GroupRowNode<T> | RegularRowNode<T>;
```

---

## shortcuts.ts

### isShortcutMatch

检查键盘事件是否与已定义的快捷键匹配。

```typescript
function isShortcutMatch(event: KeyboardEvent | React.KeyboardEvent, shortcut: ShortcutDef): boolean
```

- 支持组合键：`Ctrl+A`、`Meta+A`、`Shift+Tab`
- 支持单个快捷键对应多个组合：`['Ctrl+A', 'Meta+A']`
- 不区分大小写

### defaultShortcuts

当 `shortcuts={true}` 时启用的 10 个内置快捷键。

```typescript
const defaultShortcuts: ShortcutDef[] = [
  { id: 'nav-up',      keys: 'ArrowUp',    action: navegar linha acima },
  { id: 'nav-down',    keys: 'ArrowDown',  action: navegar linha abaixo },
  { id: 'nav-left',    keys: 'ArrowLeft',  action: navegar celula esquerda },
  { id: 'nav-right',   keys: 'ArrowRight', action: navegar celula direita },
  { id: 'nav-tab',     keys: 'Tab',        action: proxima celula },
  { id: 'nav-tab-rev', keys: 'Shift+Tab',  action: celula anterior },
  { id: 'edit-enter',  keys: ['Enter', 'F2'], action: iniciar/confirmar edicao },
  { id: 'select-all',  keys: ['Ctrl+A', 'Meta+A'], action: selecionar tudo },
  { id: 'copy',        keys: ['Ctrl+C', 'Meta+C'], action: copiar para clipboard },
  { id: 'paste',       keys: ['Ctrl+V', 'Meta+V'], action: colar do clipboard },
  { id: 'undo',        keys: ['Ctrl+Z', 'Meta+Z'], action: desfazer },
];
```

---

## excelExport.ts

### exportToExcel

基础的 Excel（.xlsx）导出。

```typescript
function exportToExcel<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExportParams
): void
```

### exportToExcelWithStyles

带可选样式的 Excel 导出。

```typescript
function exportToExcelWithStyles<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExcelExportParams
): void
```

### ExcelExportParams

```typescript
interface ExcelExportParams extends ExportParams {
  sheetName?: string;
  headerStyle?: Record<string, any>;
  cellStyle?: Record<string, any>;
}
```

---

## EventBuilder.ts

EventBuilder 的完整文档请参见 `05-api/README.md` 章节。

---

## permissionValidator.ts

### validateIngress

根据 ingress 规则校验某个操作是否被允许。

```typescript
function validateIngress(
  ingress: GridIngress[] | undefined,
  origin: string,
  action: string
): boolean
```

### 校验逻辑

1. 如果未定义 `ingress` → 允许一切
2. 如果已定义 `ingress` 但为空 → 阻止一切（Deny All）
3. 查找对应 `origin` 的规则
4. 检查通配符：`'*'`、`'api.*'`、`'manager.*'`
5. 检查具体权限
6. 如果被阻止 → 输出带详细信息的 `console.warn`

---

## CSS（样式）

### 位置

```
src/components/FiboGrid/styles/
```

### 文件

| 文件 | 大小 | 说明 |
|------|------|------|
| `core.css` | ~17KB | 基础布局：grid、单元格、行、表头、滚动、固定列、调整大小 |
| `theme.css` | ~80KB | 完整的 CSS 变量：浅色模式 + 深色模式 + 所有状态 |
| `theme-mapping.css` | ~2.6KB | CSS 变量到组件的映射 |
| `lib.css` | ~1KB | 库构建的导入与入口 |
| `index.css` | ~1KB | 演示应用的入口 |

### 主要 CSS 变量（80+）

按类别组织：

- **基础颜色**：bg、surface、text、text-secondary、text-muted、primary、border
- **单元格**：cell-bg、cell-border、cell-padding、cell-text
- **行**：row-hover、row-selected、row-stripe、row-height
- **表头**：header-bg、header-text、header-height、header-border
- **按钮**：button-bg、button-hover、button-active、button-text
- **输入框**：input-bg、input-border、input-focus、input-text
- **滚动条**：scrollbar-track、scrollbar-thumb、scrollbar-width
- **阴影**：shadow-sm、shadow-md、shadow-lg
- **Z-index**：popover、select、modal、overlay、header、pinned
- **固定列**：pinned-bg、pinned-shadow、pinned-border
- **拖拽**：drag-bg、drag-border、drag-indicator
- **过滤器**：filter-bg、filter-active、filter-badge
- **分页**：pagination-bg、pagination-active、pagination-disabled
