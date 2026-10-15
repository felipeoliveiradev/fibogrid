# 10 - Exemplos

## 1. Grid Basico

```tsx
import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles.css';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
}

const colunas: ColumnDef<Produto>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'nome', headerName: 'Nome', flex: 1, sortable: true },
  { field: 'preco', headerName: 'Preco', width: 120, valueFormatter: (v) => `R$ ${v.toFixed(2)}` },
  { field: 'categoria', headerName: 'Categoria', width: 150, filterable: true },
];

<FiboGrid<Produto>
  rowData={produtos}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
/>
```

---

## 2. Grid com Toolbar, Paginacao e Status Bar

```tsx
<FiboGrid<Produto>
  rowData={produtos}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  defaultColDef={{ sortable: true, filterable: true, resizable: true }}
  pagination
  paginationPageSize={20}
  paginationPageSizeOptions={[10, 20, 50, 100]}
  showToolbar
  showStatusBar
  theme="light"
  lang={ptBR}
/>
```

---

## 3. Grid com Edicao Inline

```tsx
const colunas: ColumnDef<Produto>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'nome', headerName: 'Nome', flex: 1, editable: true, cellEditor: 'text' },
  { field: 'preco', headerName: 'Preco', width: 120, editable: true, cellEditor: 'number' },
  {
    field: 'categoria',
    headerName: 'Categoria',
    width: 150,
    editable: true,
    cellEditor: 'select',
    cellEditorParams: { options: ['Eletronico', 'Roupa', 'Alimento'] },
  },
  { field: 'ativo', headerName: 'Ativo', width: 100, editable: true, cellEditor: 'checkbox' },
];

<FiboGrid<Produto>
  rowData={produtos}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  onCellValueChanged={({ rowNode, column, oldValue, newValue }) => {
    console.log(`Celula editada: ${column.field} de "${oldValue}" para "${newValue}"`);
    // Salvar no backend
    api.put(`/produtos/${rowNode.data.id}`, { [column.field]: newValue });
  }}
/>
```

---

## 4. Grid com Selecao Multiple e Acoes

```tsx
const apiRef = useRef<GridApi<Produto>>();

const colunas: ColumnDef<Produto>[] = [
  { type: 'checkbox', checkboxSelection: true, headerCheckboxSelection: true, width: 50 },
  { field: 'nome', headerName: 'Nome', flex: 1 },
  { field: 'preco', headerName: 'Preco', width: 120 },
  {
    field: 'acoes',
    headerName: '',
    type: 'action',
    width: 80,
    cellRenderer: ({ data }) => (
      <button onClick={() => handleDelete(data.id)}>Remover</button>
    ),
  },
];

function handleDeleteSelected() {
  const selected = apiRef.current?.getSelectedRows() ?? [];
  apiRef.current?.updateRowData({
    remove: selected.map(r => r.data),
  });
}

<FiboGrid<Produto>
  rowData={produtos}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  rowSelection="multiple"
  onGridReady={(e) => { apiRef.current = e.api; }}
/>
<button onClick={handleDeleteSelected}>Remover Selecionados</button>
```

---

## 5. Master-Detail com Grid Registry

```tsx
import { GridRegistryProvider, FiboGrid, useGridEvent } from 'fibogrid';

function MasterDetail() {
  const [detailData, setDetailData] = useState<Detalhe[]>([]);

  return (
    <GridRegistryProvider>
      <h2>Pedidos</h2>
      <FiboGrid<Pedido>
        gridId="pedidos"
        rowData={pedidos}
        columnDefs={pedidoColunas}
        getRowId={(row) => String(row.id)}
        rowSelection="single"
        onSelectionChanged={({ selectedRows }) => {
          if (selectedRows.length > 0) {
            const pedidoId = selectedRows[0].data.id;
            fetchDetalhes(pedidoId).then(setDetailData);
          }
        }}
      />

      <h2>Itens do Pedido</h2>
      <FiboGrid<Detalhe>
        gridId="detalhes"
        rowData={detailData}
        columnDefs={detalheColunas}
        getRowId={(row) => String(row.id)}
        ingress={[
          { origin: 'pedidos', permissions: ['api.*'] }
        ]}
      />
    </GridRegistryProvider>
  );
}
```

---

## 6. Server-Side Pagination

```tsx
const dataSource: ServerSideDataSource<Produto> = {
  async getRows(request) {
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: request.page,
        pageSize: request.pageSize,
        sort: request.sortModel,
        filters: request.filterModel,
        search: request.quickFilterText,
      }),
    });
    const json = await res.json();
    return {
      data: json.data,
      totalRows: json.meta.total,
      page: json.meta.current_page,
      pageSize: json.meta.per_page,
    };
  },
};

<FiboGrid<Produto>
  rowData={[]}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  paginationMode="server"
  serverSideDataSource={dataSource}
  pagination
  paginationPageSize={50}
  showToolbar
  showStatusBar
/>
```

---

## 7. Agrupamento com Agregacoes

```tsx
<FiboGrid<Funcionario>
  rowData={funcionarios}
  columnDefs={[
    { field: 'departamento', headerName: 'Departamento' },
    { field: 'equipa', headerName: 'Equipa' },
    { field: 'nome', headerName: 'Nome', flex: 1 },
    { field: 'salario', headerName: 'Salario', aggFunc: 'sum', valueFormatter: (v) => `R$ ${v.toFixed(2)}` },
    { field: 'idade', headerName: 'Idade', aggFunc: 'avg' },
  ]}
  getRowId={(row) => String(row.id)}
  groupByFields={['departamento', 'equipa']}
  groupAggregations={{
    salario: 'sum',
    idade: 'avg',
  }}
/>
```

---

## 8. Fluent API Builder

```tsx
const apiRef = useRef<GridApi<Produto>>();

function aplicarFiltroCompleto() {
  apiRef.current?.params()
    .removeAllFilter()
    .setFilterModel([
      { field: 'categoria', filterType: 'text', value: 'Eletronico', operator: 'equals' },
      { field: 'preco', filterType: 'number', value: 100, operator: 'greaterThan' },
    ])
    .setSortModel([{ field: 'preco', direction: 'desc' }])
    .setPage(0)
    .execute();
}

function adicionarProduto() {
  apiRef.current?.manager()
    .key('id')
    .mergeUnique()
    .add([{ id: 999, nome: 'Novo Produto', preco: 50, categoria: 'Teste' }])
    .execute();
}

function atualizarSelecionados() {
  apiRef.current?.manager()
    .setSelectionData({ ativo: true })
    .execute();
}
```

---

## 9. EventBuilder com Subscricoes

```tsx
import { useEventValue, useFiboGrid } from 'fibogrid';

function PainelMonitor() {
  const { events } = useFiboGrid<Produto>('meu-grid');

  // Hook — valor atualizado automaticamente
  const selectedCount = useEventValue(events.onSelectionChanged().getCount(), 0);
  const currentPage = useEventValue(events.onPaginationChanged().getCurrentPage(), 1);

  // Listen manual
  useEffect(() => {
    const unsub = events.onCellValueChanged().listen((event) => {
      toast(`${event.column.field} alterado para ${event.newValue}`);
    });
    return unsub;
  }, [events]);

  return (
    <div>
      <span>{selectedCount} selecionados</span>
      <span>Pagina {currentPage}</span>
    </div>
  );
}
```

---

## 10. Grid com Temas e Atalhos

```tsx
import { FiboGrid, ptBR } from 'fibogrid';

<FiboGrid<Produto>
  rowData={produtos}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  theme="dark"
  lang={ptBR}
  shortcuts={[
    {
      id: 'export-csv',
      keys: ['Ctrl+E', 'Meta+E'],
      description: 'Exportar para CSV',
      action: ({ api }) => api.exportToCsv({ fileName: 'produtos.csv' }),
      preventDefault: true,
    },
    {
      id: 'select-all',
      keys: ['Ctrl+A', 'Meta+A'],
      action: ({ api }) => api.selectAll(),
      preventDefault: true,
    },
  ]}
  configs={{
    header: {
      layout: ['search', 'spacer', 'density-button', 'export-button', 'columns-button'],
    },
    center: { stripes: true, borders: true },
    footer: {
      layout: ['status-info', 'status-selected', 'spacer', 'pagination'],
    },
  }}
/>
```

---

## 11. Context Menu Customizado

```tsx
<FiboGrid<Produto>
  rowData={produtos}
  columnDefs={colunas}
  getRowId={(row) => String(row.id)}
  contextMenu
  getContextMenuItems={({ data, api }) => [
    { name: 'Editar', action: () => handleEdit(data), icon: <Edit size={14} /> },
    { name: 'Duplicar', action: () => api.manager().add([{ ...data, id: Date.now() }]).execute() },
    { separator: true },
    { name: 'Remover', action: () => api.updateRowData({ remove: [data] }), cssClasses: ['text-red-500'] },
    {
      name: 'Exportar',
      subMenu: [
        { name: 'CSV', action: () => api.exportToCsv() },
        { name: 'Clipboard', action: () => api.copyToClipboard() },
      ],
    },
  ]}
/>
```
