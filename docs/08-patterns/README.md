# 08 - Padroes de Uso

## Estrutura de Colunas

### Coluna Basica

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'nome', headerName: 'Nome', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'idade', headerName: 'Idade', width: 100 },
];
```

### Coluna com Renderer Customizado

```typescript
{
  field: 'status',
  headerName: 'Status',
  cellRenderer: ({ value }) => (
    <span className={value === 'ativo' ? 'text-green-500' : 'text-red-500'}>
      {value}
    </span>
  ),
}
```

### Coluna com Editor

```typescript
{
  field: 'nome',
  headerName: 'Nome',
  editable: true,
  cellEditor: 'text',
}

{
  field: 'categoria',
  headerName: 'Categoria',
  editable: true,
  cellEditor: 'select',
  cellEditorParams: {
    options: ['A', 'B', 'C'],
  },
}
```

### Coluna com Formatacao

```typescript
{
  field: 'preco',
  headerName: 'Preco',
  valueFormatter: (value) => `R$ ${value.toFixed(2)}`,
  valueParser: (value) => parseFloat(value.replace('R$', '').trim()),
}
```

### Coluna de Acao

```typescript
{
  field: 'acoes',
  headerName: 'Acoes',
  type: 'action',
  width: 120,
  suppressMenu: true,
  cellRenderer: ({ data, api }) => (
    <div className="flex gap-2">
      <button onClick={() => handleEdit(data)}>Editar</button>
      <button onClick={() => api.updateRowData({ remove: [data] })}>Remover</button>
    </div>
  ),
}
```

### Coluna Fixa (Pinned)

```typescript
{ field: 'id', headerName: 'ID', pinned: 'left', width: 80, pinnedPriority: 1 },
{ field: 'acoes', headerName: '', pinned: 'right', width: 100, pinnedPriority: 1 },
```

### Coluna com Checkbox

```typescript
{
  field: 'selecao',
  type: 'checkbox',
  checkboxSelection: true,
  headerCheckboxSelection: true,
  width: 50,
}
```

---

## Padrao de Row ID

Sempre fornecer `getRowId` para performance e consistencia.

```tsx
// Com campo id
<FiboGrid getRowId={(row) => String(row.id)} />

// Com campo composto
<FiboGrid getRowId={(row) => `${row.tipo}-${row.codigo}`} />
```

---

## Padrao de Selecao

### Single

```tsx
<FiboGrid
  rowSelection="single"
  onSelectionChanged={({ selectedRows }) => {
    setSelected(selectedRows[0]?.data ?? null);
  }}
/>
```

### Multiple

```tsx
<FiboGrid
  rowSelection="multiple"
  onSelectionChanged={({ selectedRows }) => {
    setSelectedIds(selectedRows.map(r => r.id));
  }}
/>
```

---

## Padrao de Filtro Programatico

```typescript
// Via API direta
api.setFilterModel([
  { field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' },
  { field: 'idade', filterType: 'number', value: 18, operator: 'greaterThan' },
]);

// Via builder (atomico)
api.params()
  .setFilterModel([
    { field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' },
  ])
  .setSortModel([{ field: 'nome', direction: 'asc' }])
  .setPage(0)
  .execute();

// Merge com filtros existentes
api.setFilterModel(
  [{ field: 'novo', filterType: 'text', value: 'x', operator: 'contains' }],
  { behavior: 'merge' }
);

// Remover filtro especifico
api.params().removeFilter('status').execute();

// Limpar todos
api.params().removeAllFilter().execute();
```

---

## Padrao de Edicao Inline

```tsx
<FiboGrid
  columnDefs={[
    { field: 'nome', editable: true, cellEditor: 'text' },
    { field: 'preco', editable: true, cellEditor: 'number' },
    {
      field: 'data',
      editable: true,
      cellEditor: 'date',
    },
    {
      field: 'tipo',
      editable: true,
      cellEditor: 'select',
      cellEditorParams: { options: ['A', 'B'] },
    },
    {
      field: 'ativo',
      editable: true,
      cellEditor: 'checkbox',
    },
    {
      field: 'descricao',
      editable: true,
      cellEditor: 'custom',
      cellEditorRenderer: ({ value, update, stopEditing }) => (
        <textarea
          defaultValue={value}
          onBlur={(e) => {
            update(e.target.value);
            stopEditing();
          }}
        />
      ),
    },
  ]}
  onCellValueChanged={({ rowNode, column, oldValue, newValue }) => {
    console.log(`${column.field}: ${oldValue} → ${newValue}`);
  }}
/>
```

### Edicao Condicional

```typescript
{
  field: 'nome',
  editable: ({ data }) => data.status !== 'bloqueado',
  cellEditor: 'text',
}
```

---

## Padrao de Export

```typescript
// CSV
api.exportToCsv({ fileName: 'dados.csv' });

// CSV apenas selecionados
api.exportToCsv({ fileName: 'selecionados.csv', onlySelected: true });

// CSV colunas especificas
api.exportToCsv({ columnKeys: ['nome', 'email'] });

// Excel
import { exportToExcel } from 'fibogrid';
exportToExcel(rows, columns, { fileName: 'relatorio.xlsx' });

// Clipboard
await api.copyToClipboard(true); // com headers
```

---

## Padrao Master-Detail

```tsx
function MasterDetail() {
  return (
    <GridRegistryProvider>
      <FiboGrid
        gridId="master"
        rowData={masterData}
        columnDefs={masterCols}
        rowSelection="single"
        onSelectionChanged={({ selectedRows, api }) => {
          const detailApi = api.connect('detail');
          if (selectedRows.length > 0) {
            detailApi.setFilterModel([
              { field: 'parentId', filterType: 'number', value: selectedRows[0].data.id, operator: 'equals' }
            ]);
          }
        }}
      />
      <FiboGrid
        gridId="detail"
        rowData={detailData}
        columnDefs={detailCols}
        ingress={[
          { origin: 'master', permissions: ['api.setFilterModel'] }
        ]}
      />
    </GridRegistryProvider>
  );
}
```

---

## Padrao de Dados Dinamicos

### Adicionar linhas

```typescript
api.manager().add([novoDado]).execute();
// ou no topo
api.manager().upAdd([novoDado]).execute();
```

### Atualizar linhas

```typescript
api.manager().update([dadoAtualizado]).execute();
// ou celula especifica
api.manager().updateCell('row-1', 'nome', 'Novo Nome').execute();
```

### Remover linhas

```typescript
api.manager().remove(['row-1', 'row-2']).execute();
```

### Substituir tudo

```typescript
api.manager().replaceAll(novosDados).execute();
```

### Merge unico

```typescript
api.manager()
  .key('id')
  .mergeUnique()
  .add(dadosNovos) // Apenas adiciona se ID nao existir
  .execute();
```

---

## Convencoes de Nome

| Elemento | Convencao | Exemplo |
|----------|-----------|---------|
| `gridId` | kebab-case | `'produtos-lista'` |
| `field` | camelCase | `'nomeCompleto'` |
| `headerName` | Texto legivel | `'Nome Completo'` |
| Ref de API | `apiRef` ou `gridApiRef` | `const apiRef = useRef<GridApi>()` |
| Tipos generico | PascalCase | `FiboGrid<Produto>` |

---

## Regras Obrigatorias

- **SEMPRE** fornecer `getRowId` quando os dados tem IDs naturais
- **NUNCA** mutar `rowData` diretamente — usar `api.setRowData()` ou `api.manager()`
- **PREFERIR** `api.params()...execute()` para multiplas operacoes simultaneas
- **USAR** `defaultColDef` para evitar repeticao de propriedades comuns
- **IMPORTAR** `'fibogrid/styles.css'` no entry point da aplicacao
