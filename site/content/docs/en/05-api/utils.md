# 05 - Utility Functions

## Location

```
src/components/FiboGrid/utils/
```

---

## helpers.ts

### generateRowId

Generates or extracts a unique ID for a row.

```typescript
function generateRowId<T>(data: T, index: number, getRowId?: (data: T) => string): string
```

- If `getRowId` is provided, uses it
- Otherwise, uses `data.id` if it exists
- Otherwise, generates an ID based on the index

### createRowNode

Creates a `RowNode<T>` from raw data.

```typescript
function createRowNode<T>(data: T, index: number, getRowId?: (data: T) => string): RowNode<T>
```

Returns: `{ id, data, rowIndex, selected: false }`

### processColumns

Calculates column widths and positions (flex layout).

```typescript
function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[]
```

- Merges `defaultColDef` into each column
- Calculates `flex` proportionally to the remaining space
- Respects `minWidth` and `maxWidth`
- Calculates `left` (accumulated horizontal position)
- Sets the final `computedWidth`

### sortRows

Applies multi-column sorting to the rows.

```typescript
function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ColumnDef<T>[]
): RowNode<T>[]
```

- Supports multiple columns with priority by order
- Uses the column's custom `comparator` if defined
- Falls back to `defaultComparator`

### filterRows

Applies composite filters and the quick filter.

```typescript
function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ColumnDef<T>[],
  quickFilterText?: string
): RowNode<T>[]
```

- All filters are AND (all conditions must be true)
- Quick filter searches across all fields
- Uses the custom `filterComparator` if defined on the column
- Uses the column's `useInternalFilter` if defined

### fastComparator

Fast comparison for primitive types.

```typescript
function fastComparator(a: any, b: any): number
```

### defaultComparator

Default comparison with support for Date, string, and numbers.

```typescript
function defaultComparator(a: any, b: any): number
```

- Treats `null/undefined` as smaller
- Converts `Date` to timestamp
- Strings are compared case-insensitively

### getValueFromPath

Deep property access using dot notation.

```typescript
function getValueFromPath(obj: any, path: string): any
```

```typescript
getValueFromPath({ a: { b: { c: 42 } } }, 'a.b.c'); // 42
getValueFromPath({ items: [1, 2] }, 'items.0');      // 1
```

### setValueAtPath

Sets a deep value using dot notation.

```typescript
function setValueAtPath<T>(obj: T, path: string, value: any): T
```

Returns a new object (immutable).

---

## grouping.ts

### isGroupNode

Type guard to check whether a node is a group.

```typescript
function isGroupNode<T>(node: GroupableRowNode<T>): node is GroupRowNode<T>
```

### groupRowsByFields

Groups rows by one or more fields with aggregations.

```typescript
function groupRowsByFields<T>(
  rows: RowNode<T>[],
  groupFields: string[],
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any)>
): GroupableRowNode<T>[]
```

- Hierarchical (multi-level) grouping
- Calculates aggregations per group
- Each group has `children` with the group's rows

### splitRowsByField

Splits rows by field — creates visual separators without hierarchy.

```typescript
function splitRowsByField<T>(rows: RowNode<T>[], splitField: string): GroupableRowNode<T>[]
```

### addChildRows

Adds children to a parent row (tree data).

```typescript
function addChildRows<T>(
  rows: RowNode<T>[],
  parentId: string,
  childData: T[],
  getRowId?: (data: T) => string
): RowNode<T>[]
```

### flattenGroupedRows

Flattens the group hierarchy taking the expansion state into account.

```typescript
function flattenGroupedRows<T>(
  groupedRows: GroupableRowNode<T>[],
  expandedGroups: Set<string>
): GroupableRowNode<T>[]
```

- Collapsed groups do not include children
- Expanded groups include children recursively

### Grouping Types

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

Checks whether a keyboard event matches a defined shortcut.

```typescript
function isShortcutMatch(event: KeyboardEvent | React.KeyboardEvent, shortcut: ShortcutDef): boolean
```

- Supports combinations: `Ctrl+A`, `Meta+A`, `Shift+Tab`
- Supports multiple combinations per shortcut: `['Ctrl+A', 'Meta+A']`
- Case-insensitive

### defaultShortcuts

10 built-in shortcuts enabled when `shortcuts={true}`.

```typescript
const defaultShortcuts: ShortcutDef[] = [
  { id: 'nav-up',      keys: 'ArrowUp',    action: navigate to the row above },
  { id: 'nav-down',    keys: 'ArrowDown',  action: navigate to the row below },
  { id: 'nav-left',    keys: 'ArrowLeft',  action: navigate to the left cell },
  { id: 'nav-right',   keys: 'ArrowRight', action: navigate to the right cell },
  { id: 'nav-tab',     keys: 'Tab',        action: next cell },
  { id: 'nav-tab-rev', keys: 'Shift+Tab',  action: previous cell },
  { id: 'edit-enter',  keys: ['Enter', 'F2'], action: start/confirm editing },
  { id: 'select-all',  keys: ['Ctrl+A', 'Meta+A'], action: select all },
  { id: 'copy',        keys: ['Ctrl+C', 'Meta+C'], action: copy to clipboard },
  { id: 'paste',       keys: ['Ctrl+V', 'Meta+V'], action: paste from clipboard },
  { id: 'undo',        keys: ['Ctrl+Z', 'Meta+Z'], action: undo },
];
```

---

## excelExport.ts

### exportToExcel

Basic Excel (.xlsx) export.

```typescript
function exportToExcel<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params?: ExportParams
): void
```

### exportToExcelWithStyles

Excel export with optional styles.

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

See the `05-api/README.md` section for the complete EventBuilder documentation.

---

## permissionValidator.ts

### validateIngress

Validates whether an action is allowed by ingress rules.

```typescript
function validateIngress(
  ingress: GridIngress[] | undefined,
  origin: string,
  action: string
): boolean
```

### Validation Logic

1. If `ingress` is not defined → allows everything
2. If `ingress` is defined but empty → blocks everything (Deny All)
3. Looks for a rule for the `origin`
4. Checks wildcards: `'*'`, `'api.*'`, `'manager.*'`
5. Checks the specific permission
6. If blocked → emits `console.warn` with details

---

## CSS (Styles)

### Location

```
src/components/FiboGrid/styles/
```

### Files

| File | Size | Description |
|------|------|-------------|
| `core.css` | ~17KB | Base layout: grid, cells, rows, headers, scroll, pinned, resize |
| `theme.css` | ~80KB | Complete CSS variables: light mode + dark mode + all states |
| `theme-mapping.css` | ~2.6KB | Mapping of CSS variables to components |
| `lib.css` | ~1KB | Imports and entry point for the lib build |
| `index.css` | ~1KB | Entry point for the demo app |

### Main CSS Variables (80+)

Organized by category:

- **Base colors**: bg, surface, text, text-secondary, text-muted, primary, border
- **Cells**: cell-bg, cell-border, cell-padding, cell-text
- **Rows**: row-hover, row-selected, row-stripe, row-height
- **Headers**: header-bg, header-text, header-height, header-border
- **Buttons**: button-bg, button-hover, button-active, button-text
- **Inputs**: input-bg, input-border, input-focus, input-text
- **Scrollbar**: scrollbar-track, scrollbar-thumb, scrollbar-width
- **Shadows**: shadow-sm, shadow-md, shadow-lg
- **Z-index**: popover, select, modal, overlay, header, pinned
- **Pinned**: pinned-bg, pinned-shadow, pinned-border
- **Drag**: drag-bg, drag-border, drag-indicator
- **Filters**: filter-bg, filter-active, filter-badge
- **Pagination**: pagination-bg, pagination-active, pagination-disabled
