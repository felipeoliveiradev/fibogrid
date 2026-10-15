# 04 - Components

## Location

```
src/components/FiboGrid/components/
```

## Index

| File | Contents |
|------|----------|
| [README.md](./README.md) | FiboGrid, GridToolbar, GridStatusBar, ColumnMenu, GroupRow, ColumnPanel, FilterPanel |
| [special-renderers.md](./special-renderers.md) | RowNumberRenderer, CheckboxCellRenderer, CheckboxHeaderRenderer, GridContext |

---

## FiboGrid<T>

Main component. Receives data, columns, and settings.

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

### Main Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rowData` | `T[]` | required | Data array |
| `columnDefs` | `ColumnDef<T>[]` | required | Column definitions |
| `getRowId` | `(data: T) => string` | auto | Function that returns the unique row ID |
| `gridId` | `string` | auto | ID for registration in the GridRegistry |
| `pagination` | `boolean` | `false` | Enable pagination |
| `paginationPageSize` | `number` | `10` | Items per page |
| `paginationPageSizeOptions` | `number[]` | `[10,20,50]` | Page size options |
| `paginationMode` | `'client' \| 'server'` | `'client'` | Pagination mode |
| `serverSideDataSource` | `ServerSideDataSource<T>` | — | Data source for server-side |
| `rowSelection` | `'single' \| 'multiple'` | — | Selection type |
| `rangeCellSelection` | `boolean` | `false` | Excel-style selection |
| `rowDragEnabled` | `boolean` | `false` | Row drag |
| `defaultColDef` | `Partial<ColumnDef<T>>` | — | Defaults for all columns |
| `rowHeight` | `number` | `40` | Row height in px |
| `headerHeight` | `number` | `44` | Header height |
| `height` | `number \| string` | — | Grid height |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Theme |
| `loading` | `boolean` | `false` | Show loading overlay |
| `quickFilterText` | `string` | — | Quick filter text |
| `showToolbar` | `boolean` | `false` | Show toolbar |
| `showStatusBar` | `boolean` | `false` | Show status bar |
| `contextMenu` | `boolean` | `false` | Context menu (right-click) |
| `groupByFields` | `string[]` | — | Fields to group by |
| `groupAggregations` | `Record<string, AggFunc>` | — | Aggregations per field |
| `treeData` | `boolean` | `false` | Hierarchical data |
| `lang` | `FiboGridLocale` | `enUS` | Language |
| `shortcuts` | `boolean \| ShortcutDef[]` | `false` | Keyboard shortcuts |
| `configs` | `FiboGridConfigs` | — | Advanced layout configuration |
| `egress` | `GridEgress[]` | — | Outbound permissions |
| `ingress` | `GridIngress[]` | — | Inbound permissions |

### Event Props

| Prop | Type |
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

Toolbar with search, filters, export, and column management.

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

### Features

- Quick search (quick filter)
- Filter button with active filter counter
- Column toggle (show/hide)
- Export button (CSV/Excel)
- Copy to clipboard button
- Density toggle (compact/normal/comfortable)
- Custom actions via `configs.header.customActions`

---

## GridStatusBar

Status bar in the footer with aggregated information.

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

### Displayed Information

- Total rows
- Selected rows
- Aggregations (sum, average, min, max, count)

---

## ColumnMenu

Per-column context menu (click on the header).

```tsx
import { ColumnMenu } from 'fibogrid';
```

### Options

- Sort ascending/descending
- Pin column (left/right/none)
- Auto-fit width
- Filter column
- Hide column

---

## GroupRow

Group row when `groupByFields` is active.

```tsx
import { GroupRow } from 'fibogrid';
```

### Features

- Expand/collapse group
- Display child count
- Show aggregation values

---

## ColumnPanel

Side panel for managing column visibility and order.

```tsx
import { ColumnPanel } from 'fibogrid';
```

---

## FilterPanel

Advanced filter panel with support for multiple conditions.

```tsx
import { FilterPanel } from 'fibogrid';
```

### Supported Filter Types

| Type | Operators |
|------|-----------|
| `text` | contains, equals, startsWith, endsWith |
| `number` | equals, greaterThan, lessThan, between |
| `date` | equals, after, before, between |
| `select` | multiple value selection |
| `boolean` | true / false |

---

## Internal Components

| Component | Description |
|-----------|-------------|
| `GridHeader` | Headers with sort indicators and resize handles |
| `GridRow` | Row with selection, hover, drag, custom class |
| `GridCell` | Cell with renderer, editor, formatting |
| `GridFooter` | Footer container |
| `GridPagination` | Page navigation controls |
| `GridOverlay` | Loading and "no data" overlay |
| `ContextMenu` | Right-click menu with sub-menus |
| `FilterPopover` | Filter value selection popover |
| `VirtualFilterList` | Virtualized list of values in the filter |
| `SpecialRenderers` | Built-in renderers (checkbox, rowNumber, action) |
