# 07 - Configuration

## FiboGridConfigs

Advanced grid layout configuration via the `configs` prop.

```tsx
<FiboGrid
  configs={{
    compact: true,
    zIndex: { popover: 50, select: 40, modal: 100 },
    header: {
      show: true,
      layout: ['search', 'spacer', 'filter-button', 'export-button', 'columns-button'],
      search: true,
      filterButton: true,
      densityButton: true,
      exportButton: true,
      columnsButton: true,
      copyButton: true,
      refreshButton: false,
      filterRow: false,
      customActions: <MeuBotao />,
    },
    center: {
      rowNumbers: true,
      checkboxSelection: true,
      stripes: true,
      borders: true,
    },
    footer: {
      show: true,
      layout: ['pagination', 'spacer', 'status-bar'],
      pagination: true,
      information: true,
    },
  }}
/>
```

### Header Layout Items

| Item | Description |
|------|-------------|
| `search` | Quick search field |
| `active-filters` | Chips with active filters |
| `filter-button` | Button to open the filter panel |
| `density-button` | Compact/normal/comfortable toggle |
| `export-button` | CSV/Excel export |
| `columns-button` | Column management panel |
| `copy-button` | Copy to clipboard |
| `refresh-button` | Refresh button |
| `custom-actions` | Custom actions (ReactNode) |
| `spacer` | Flexible spacer |

### Footer Layout Items

| Item | Description |
|------|-------------|
| `pagination` | Full pagination controls |
| `pagination-page-size` | Page size selector |
| `pagination-info` | "1-20 of 100" text |
| `pagination-controls` | Prev/next buttons |
| `status-bar` | Full status bar |
| `status-info` | Row count |
| `status-selected` | Selected count |
| `status-aggregations` | Aggregation values |
| `spacer` | Flexible spacer |

---

## Default Column Definition

Define default properties for all columns.

```tsx
<FiboGrid
  defaultColDef={{
    sortable: true,
    filterable: true,
    resizable: true,
    minWidth: 100,
  }}
  columnDefs={[
    { field: 'nome', headerName: 'Nome' },           // inherits sortable, filterable, resizable
    { field: 'id', headerName: 'ID', sortable: false }, // override: not sortable
  ]}
/>
```

---

## Themes

### Via Prop

```tsx
<FiboGrid theme="light" />  // or "dark" or "auto"
```

### CSS Variables (Light)

```css
.fibogrid {
  --fibogrid-bg: #ffffff;
  --fibogrid-surface: #fafafa;
  --fibogrid-text: #1a1a1a;
  --fibogrid-text-secondary: #666666;
  --fibogrid-text-muted: #999999;
  --fibogrid-primary: hsl(40, 65%, 45%);
  --fibogrid-primary-hover: hsl(40, 65%, 55%);
  --fibogrid-primary-text: #ffffff;
  --fibogrid-border: #e0e0e0;
  --fibogrid-border-cell: #f0f0f0;
  --fibogrid-row-hover: #f5f5f5;
  --fibogrid-row-selected: hsl(40, 65%, 95%);
  --fibogrid-row-stripe: #fafafa;
  --fibogrid-header-bg: #f8f8f8;
  --fibogrid-header-text: #333333;
}
```

### CSS Variables (Dark)

```css
.fibogrid[data-theme="dark"] {
  --fibogrid-bg: #1a1a2e;
  --fibogrid-surface: #16213e;
  --fibogrid-text: #e8e8e8;
  --fibogrid-text-secondary: #a0a0a0;
  --fibogrid-primary: hsl(40, 65%, 55%);
  --fibogrid-border: #2a2a4a;
  --fibogrid-row-hover: #1e2a4a;
  --fibogrid-row-selected: hsl(40, 65%, 20%);
  --fibogrid-header-bg: #0f1a35;
}
```

### Dimension Variables

```css
.fibogrid {
  --fibogrid-row-height: 40px;
  --fibogrid-header-height: 44px;
  --fibogrid-cell-padding: 12px;
  --fibogrid-font-size: 14px;
  --fibogrid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Predefined Themes

| Class | Description |
|-------|-------------|
| `fibogrid-compact` | Dense layout (smaller row-height) |
| `fibogrid-comfortable` | Spacious layout |
| `fibogrid-material` | Material Design style |
| `fibogrid-minimal` | Minimalist design |

### Customization

```css
/* Override via CSS */
.meu-grid .fibogrid {
  --fibogrid-primary: #3b82f6;
  --fibogrid-row-height: 36px;
  --fibogrid-font-size: 13px;
}
```

---

## Z-Index

Control the layers of overlays and popovers.

```tsx
<FiboGrid
  configs={{
    zIndex: {
      popover: 50,
      select: 40,
      modal: 100,
    },
  }}
/>
```

---

## Density

Toggle between densities via the toolbar or programmatically.

| Density | Row Height | Description |
|---------|-----------|-------------|
| `compact` | ~32px | More data visible |
| `normal` | ~40px | Default |
| `comfortable` | ~52px | More breathing room |

---

## Pagination

### Client-Side

```tsx
<FiboGrid
  pagination
  paginationPageSize={20}
  paginationPageSizeOptions={[10, 20, 50, 100]}
/>
```

### Server-Side

```tsx
<FiboGrid
  pagination
  paginationMode="server"
  paginationPageSize={50}
  serverSideDataSource={dataSource}
/>
```

---

## Overlays

### Loading

```tsx
<FiboGrid
  loading={isLoading}
  loadingOverlayComponent={<MeuSpinner />}
/>
```

### No Data

```tsx
<FiboGrid
  rowData={[]}
  noRowsOverlayComponent={<p>Nenhum resultado encontrado</p>}
/>
```

---

## Virtualized Value Filter

For columns with many unique values, enable virtualization in the filter.

```tsx
<FiboGrid
  enableFilterValueVirtualization
  filterValues={{
    status: ['ativo', 'inativo', 'pendente'],
    tipo: ['A', 'B', 'C'],
  }}
/>
```
