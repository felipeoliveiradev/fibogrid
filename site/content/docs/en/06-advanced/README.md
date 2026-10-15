# 06 - Advanced Features

## Grid Registry (Multi-Grid Communication)

Registry system that allows grids to communicate with each other.

### Setup

```tsx
import { GridRegistryProvider, FiboGrid } from 'fibogrid';

<GridRegistryProvider>
  <FiboGrid gridId="master-grid" rowData={masterData} columnDefs={masterCols} />
  <FiboGrid gridId="detail-grid" rowData={detailData} columnDefs={detailCols} />
</GridRegistryProvider>
```

### External Access

```typescript
import { useFiboGrid, useGridRegistry, useGridEvent } from 'fibogrid';

// Main hook
const { grid, events, registry } = useFiboGrid<MeuTipo>('master-grid');

// Access another grid
const detailApi = registry.getGridApi('detail-grid');
detailApi?.setFilterModel([...]);

// Subscribe to events from another grid
useGridEvent('master-grid', 'selectionChanged', (event) => {
  const selected = event.selectedRows[0];
  if (selected) {
    detailApi?.setFilterModel([
      { field: 'masterId', filterType: 'number', value: selected.data.id, operator: 'equals' }
    ]);
  }
});
```

### Registry API

```typescript
interface GridRegistryContextValue<T> {
  registerGrid: (id: string, api: GridApi<T>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<T> | undefined;
  subscribeToGridEvent: (gridId: string, eventName: string, callback: Function) => () => void;
}
```

---

## Ingress / Egress (Security)

Permission system to control communication between grids.

### Concepts

| Term | Description |
|------|-------------|
| **Egress** | OUTBOUND permissions — what this grid allows others to do to it |
| **Ingress** | INBOUND permissions — what this grid accepts from specific grids |

### Configuration

```tsx
<FiboGrid
  gridId="master-grid"
  egress={[
    {
      destiny: 'detail-grid',
      permissions: ['api.getSelectedRows', 'manager.add']
    }
  ]}
/>

<FiboGrid
  gridId="detail-grid"
  ingress={[
    {
      origin: 'master-grid',
      permissions: ['api.setFilterModel', 'api.setSortModel']
    }
  ]}
/>
```

### Available Permissions

```typescript
const GridPermissions = {
  Manager: {
    Reset: 'manager.reset',
    Add: 'manager.add',
    Remove: 'manager.remove',
    Update: 'manager.update',
    ReplaceAll: 'manager.replaceAll',
    ResetEdits: 'manager.resetEdits',
    Execute: 'manager.execute',
    All: 'manager.*'
  },
  API: {
    GetSelectedRows: 'api.getSelectedRows',
    SelectAll: 'api.selectAll',
    DeselectAll: 'api.deselectAll',
    SetPage: 'api.setPage',
    SetFilterModel: 'api.setFilterModel',
    GetFilterModel: 'api.getFilterModel',
    SetSortModel: 'api.setSortModel',
    GetSortModel: 'api.getSortModel',
    All: 'api.*'
  },
  Events: {
    SelectionChanged: 'onSelectionChanged',
    FilterChanged: 'onFilterChanged',
    SortChanged: 'onSortChanged',
    CellValueChanged: 'onCellValueChanged',
    RowClicked: 'onRowClicked',
    All: 'on*'
  }
};
```

### Wildcards

- `'*'` — allows everything
- `'api.*'` — allows all API methods
- `'manager.*'` — allows all Manager operations

### Validation

```typescript
import { validateIngress } from 'fibogrid';

// Returns true if the action is allowed
const allowed = validateIngress(ingressRules, 'master-grid', 'api.setFilterModel');
```

If blocked, a warning is emitted to the console:
```
[Grid Security] Blocked action 'api.setPage' from 'unknown-grid'. Reason: No ingress rules for this origin.
```

### Connecting with Permissions

```typescript
const { grid } = useFiboGrid<MeuTipo>('detail-grid');

// Connect as origin — returns an API with validated permissions
const secureApi = grid.connect('master-grid');
secureApi.setFilterModel([...]); // Will be validated against ingress rules
```

---

## Row Grouping

Group rows by one or more fields with aggregations.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  groupByFields={['departamento', 'equipa']}
  groupAggregations={{
    salario: 'sum',
    idade: 'avg',
    bonus: 'count',
  }}
/>
```

### Aggregation Functions

| Function | Description |
|----------|-------------|
| `'sum'` | Sum of values |
| `'avg'` | Average of values |
| `'min'` | Minimum value |
| `'max'` | Maximum value |
| `'count'` | Count of non-null values |
| `(values) => any` | Custom function |

### Custom Aggregation

```typescript
<FiboGrid
  groupAggregations={{
    total: (values) => values.reduce((a, b) => a + b, 0).toFixed(2),
  }}
/>
```

### Per-Column Aggregation

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'salario', headerName: 'Salario', aggFunc: 'sum' },
  { field: 'idade', headerName: 'Idade', aggFunc: 'avg' },
];
```

---

## Split Rows

Visually split rows by a field.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  splitByField="categoria"
/>
```

---

## Tree Data

Hierarchical data with expandable children.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  treeData
  childRowsField="filhos"
  getChildRows={(parent) => parent.filhos}
/>
```

### Adding Children Dynamically

```typescript
api.addChildToRow('parent-id', [
  { id: 'child-1', nome: 'Filho 1' },
  { id: 'child-2', nome: 'Filho 2' },
]);
```

---

## Server-Side Data

Loads data from the server with remote pagination, sorting, and filters.

```tsx
const dataSource: ServerSideDataSource<MeuTipo> = {
  async getRows(request) {
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify({
        page: request.page,
        pageSize: request.pageSize,
        sort: request.sortModel,
        filters: request.filterModel,
        search: request.quickFilterText,
      }),
    });
    const result = await response.json();
    return {
      data: result.items,
      totalRows: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },
};

<FiboGrid
  rowData={[]}
  columnDefs={colunas}
  paginationMode="server"
  serverSideDataSource={dataSource}
  pagination
  paginationPageSize={50}
/>
```

### Request Sent

```typescript
interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}
```

### Expected Response

```typescript
interface ServerSideDataSourceResponse<T> {
  data: T[];
  totalRows: number;
  page: number;
  pageSize: number;
}
```

---

## Undo/Redo

Undo/redo system with a maximum history of 50 operations.

```typescript
// Via API
api.undo();

// Via keyboard (when shortcuts are enabled)
// Ctrl+Z = Undo
```

---

## Range Cell Selection (Excel-Style)

Cell selection by dragging, similar to Excel.

```tsx
<FiboGrid
  rangeCellSelection
  rowSelection="multiple"
/>
```

---

## Fill Handle

Drag the corner of a selection to extend values.

Works automatically when `rangeCellSelection` is active.

---

## Keyboard Shortcuts

Built-in and custom keyboard shortcuts.

```tsx
// Enable built-in shortcuts
<FiboGrid shortcuts />

// Custom shortcuts
<FiboGrid
  shortcuts={[
    {
      id: 'delete-selected',
      keys: 'Delete',
      description: 'Remover linhas selecionadas',
      action: ({ api }) => {
        const selected = api.getSelectedRows();
        api.updateRowData({ remove: selected.map(r => r.data) });
      },
    },
    {
      id: 'select-all',
      keys: ['Ctrl+A', 'Meta+A'],
      action: ({ api }) => api.selectAll(),
      preventDefault: true,
    },
  ]}
/>
```

### Built-in Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Up/Down` | Navigate between rows |
| `Arrow Left/Right` | Navigate between cells |
| `Tab` | Next cell |
| `Shift+Tab` | Previous cell |
| `Enter` | Start editing / confirm editing |
| `Escape` | Cancel editing |
| `Ctrl+C` | Copy to clipboard |
| `Ctrl+V` | Paste from clipboard |
| `Ctrl+Z` | Undo |
