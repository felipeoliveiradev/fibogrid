# 06 - Recursos Avancados

## Grid Registry (Comunicacao Multi-Grid)

Sistema de registro que permite grids comunicarem entre si.

### Setup

```tsx
import { GridRegistryProvider, FiboGrid } from 'fibogrid';

<GridRegistryProvider>
  <FiboGrid gridId="master-grid" rowData={masterData} columnDefs={masterCols} />
  <FiboGrid gridId="detail-grid" rowData={detailData} columnDefs={detailCols} />
</GridRegistryProvider>
```

### Acesso Externo

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

### API do Registry

```typescript
interface GridRegistryContextValue<T> {
  registerGrid: (id: string, api: GridApi<T>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<T> | undefined;
  subscribeToGridEvent: (gridId: string, eventName: string, callback: Function) => () => void;
}
```

---

## Ingress / Egress (Seguranca)

Sistema de permissoes para controlar comunicacao entre grids.

### Conceitos

| Termo | Descricao |
|-------|-----------|
| **Egress** | Permissoes de SAIDA — o que este grid permite que outros facam nele |
| **Ingress** | Permissoes de ENTRADA — o que este grid aceita de grids especificos |

### Configuracao

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

### Permissoes Disponiveis

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

- `'*'` — permite tudo
- `'api.*'` — permite todos os metodos API
- `'manager.*'` — permite todas as operacoes do Manager

### Validacao

```typescript
import { validateIngress } from 'fibogrid';

// Retorna true se acao e permitida
const allowed = validateIngress(ingressRules, 'master-grid', 'api.setFilterModel');
```

Se bloqueado, emite warning no console:
```
[Grid Security] Blocked action 'api.setPage' from 'unknown-grid'. Reason: No ingress rules for this origin.
```

### Conectar com Permissoes

```typescript
const { grid } = useFiboGrid<MeuTipo>('detail-grid');

// Conectar como origem — retorna API com permissoes validadas
const secureApi = grid.connect('master-grid');
secureApi.setFilterModel([...]); // Sera validado contra ingress rules
```

---

## Row Grouping

Agrupar linhas por um ou mais campos com agregacoes.

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

### Funcoes de Agregacao

| Funcao | Descricao |
|--------|-----------|
| `'sum'` | Soma dos valores |
| `'avg'` | Media dos valores |
| `'min'` | Valor minimo |
| `'max'` | Valor maximo |
| `'count'` | Contagem de valores nao-nulos |
| `(values) => any` | Funcao customizada |

### Agregacao Customizada

```typescript
<FiboGrid
  groupAggregations={{
    total: (values) => values.reduce((a, b) => a + b, 0).toFixed(2),
  }}
/>
```

### Agregacao por Coluna

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'salario', headerName: 'Salario', aggFunc: 'sum' },
  { field: 'idade', headerName: 'Idade', aggFunc: 'avg' },
];
```

---

## Split Rows

Dividir linhas visualmente por um campo.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  splitByField="categoria"
/>
```

---

## Tree Data

Dados hierarquicos com filhos expandiveis.

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  treeData
  childRowsField="filhos"
  getChildRows={(parent) => parent.filhos}
/>
```

### Adicionar Filhos Dinamicamente

```typescript
api.addChildToRow('parent-id', [
  { id: 'child-1', nome: 'Filho 1' },
  { id: 'child-2', nome: 'Filho 2' },
]);
```

---

## Server-Side Data

Carregamento de dados do servidor com paginacao, sort e filtros remotos.

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

### Request Enviado

```typescript
interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}
```

### Response Esperado

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

Sistema de desfazer/refazer com historico maximo de 50 operacoes.

```typescript
// Via API
api.undo();

// Via Keyboard (quando shortcuts ativo)
// Ctrl+Z = Undo
```

---

## Range Cell Selection (Excel-Style)

Selecao de celulas por arrasto, similar ao Excel.

```tsx
<FiboGrid
  rangeCellSelection
  rowSelection="multiple"
/>
```

---

## Fill Handle

Arrastar o canto de uma selecao para estender valores.

Funciona automaticamente quando `rangeCellSelection` esta ativo.

---

## Keyboard Shortcuts

Atalhos de teclado built-in e customizados.

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

### Atalhos Built-in

| Tecla | Acao |
|-------|------|
| `Arrow Up/Down` | Navegar entre linhas |
| `Arrow Left/Right` | Navegar entre celulas |
| `Tab` | Proxima celula |
| `Shift+Tab` | Celula anterior |
| `Enter` | Iniciar edicao / confirmar edicao |
| `Escape` | Cancelar edicao |
| `Ctrl+C` | Copiar para clipboard |
| `Ctrl+V` | Colar do clipboard |
| `Ctrl+Z` | Undo |
