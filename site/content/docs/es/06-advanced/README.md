# 06 - Recursos avanzados

## Grid Registry (comunicación multi-grid)

Sistema de registro que permite que los grids se comuniquen entre sí.

### Setup

```tsx
import { GridRegistryProvider, FiboGrid } from 'fibogrid';

<GridRegistryProvider>
  <FiboGrid gridId="master-grid" rowData={masterData} columnDefs={masterCols} />
  <FiboGrid gridId="detail-grid" rowData={detailData} columnDefs={detailCols} />
</GridRegistryProvider>
```

### Acceso externo

```typescript
import { useFiboGrid, useGridRegistry, useGridEvent } from 'fibogrid';

// Hook principal
const { grid, events, registry } = useFiboGrid<MeuTipo>('master-grid');

// Acessar outro grid
const detailApi = registry.getGridApi('detail-grid');
detailApi?.setFilterModel([...]);

// Subscrever a eventos de outro grid
useGridEvent('master-grid', 'selectionChanged', (event) => {
  const selected = event.selectedRows[0];
  if (selected) {
    detailApi?.setFilterModel([
      { field: 'masterId', filterType: 'number', value: selected.data.id, operator: 'equals' }
    ]);
  }
});
```

### API del Registry

```typescript
interface GridRegistryContextValue<T> {
  registerGrid: (id: string, api: GridApi<T>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<T> | undefined;
  subscribeToGridEvent: (gridId: string, eventName: string, callback: Function) => () => void;
}
```

---

## Ingress / Egress (seguridad)

Sistema de permisos para controlar la comunicación entre grids.

### Conceptos

| Término | Descripción |
|-------|-----------|
| **Egress** | Permisos de SALIDA — lo que este grid permite que otros hagan en él |
| **Ingress** | Permisos de ENTRADA — lo que este grid acepta de grids específicos |

### Configuración

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

### Permisos disponibles

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

- `'*'` — permite todo
- `'api.*'` — permite todos los métodos de la API
- `'manager.*'` — permite todas las operaciones del Manager

### Validación

```typescript
import { validateIngress } from 'fibogrid';

// Retorna true se acao e permitida
const allowed = validateIngress(ingressRules, 'master-grid', 'api.setFilterModel');
```

Si está bloqueado, emite un warning en la consola:
```
[Grid Security] Blocked action 'api.setPage' from 'unknown-grid'. Reason: No ingress rules for this origin.
```

### Conectar con permisos

```typescript
const { grid } = useFiboGrid<MeuTipo>('detail-grid');

// Conectar como origem — retorna API com permissoes validadas
const secureApi = grid.connect('master-grid');
secureApi.setFilterModel([...]); // Sera validado contra ingress rules
```

---

## Row Grouping

Agrupar filas por uno o más campos con agregaciones.

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

### Funciones de agregación

| Función | Descripción |
|--------|-----------|
| `'sum'` | Suma de los valores |
| `'avg'` | Media de los valores |
| `'min'` | Valor mínimo |
| `'max'` | Valor máximo |
| `'count'` | Conteo de valores no nulos |
| `(values) => any` | Función personalizada |

### Agregación personalizada

```typescript
<FiboGrid
  groupAggregations={{
    total: (values) => values.reduce((a, b) => a + b, 0).toFixed(2),
  }}
/>
```

### Agregación por columna

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'salario', headerName: 'Salario', aggFunc: 'sum' },
  { field: 'idade', headerName: 'Idade', aggFunc: 'avg' },
];
```

---

## Split Rows

Dividir filas visualmente por un campo.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  splitByField="categoria"
/>
```

---

## Tree Data

Datos jerárquicos con hijos expandibles.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  treeData
  childRowsField="filhos"
  getChildRows={(parent) => parent.filhos}
/>
```

### Añadir hijos dinámicamente

```typescript
api.addChildToRow('parent-id', [
  { id: 'child-1', nome: 'Filho 1' },
  { id: 'child-2', nome: 'Filho 2' },
]);
```

---

## Server-Side Data

Carga de datos del servidor con paginación, sort y filtros remotos.

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

### Request enviado

```typescript
interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}
```

### Response esperado

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

Sistema de deshacer/rehacer con un historial máximo de 50 operaciones.

```typescript
// Via API
api.undo();

// Via Keyboard (quando shortcuts ativo)
// Ctrl+Z = Undo
```

---

## Range Cell Selection (estilo Excel)

Selección de celdas por arrastre, similar a Excel.

```tsx
<FiboGrid
  rangeCellSelection
  rowSelection="multiple"
/>
```

---

## Fill Handle

Arrastrar la esquina de una selección para extender valores.

Funciona automáticamente cuando `rangeCellSelection` está activo.

---

## Keyboard Shortcuts

Atajos de teclado built-in y personalizados.

```tsx
// Ativar atalhos built-in
<FiboGrid shortcuts />

// Atalhos customizados
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

### Atajos built-in

| Tecla | Acción |
|-------|------|
| `Arrow Up/Down` | Navegar entre filas |
| `Arrow Left/Right` | Navegar entre celdas |
| `Tab` | Siguiente celda |
| `Shift+Tab` | Celda anterior |
| `Enter` | Iniciar edición / confirmar edición |
| `Escape` | Cancelar edición |
| `Ctrl+C` | Copiar al clipboard |
| `Ctrl+V` | Pegar desde el clipboard |
| `Ctrl+Z` | Undo |
