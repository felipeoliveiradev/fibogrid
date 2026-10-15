# 08 - Usage Patterns

## Column Structure

### Basic Column

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'nome', headerName: 'Nome', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'idade', headerName: 'Idade', width: 100 },
];
```

### Column with Custom Renderer

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

### Column with Editor

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

### Column with Formatting

```typescript
{
  field: 'preco',
  headerName: 'Preco',
  valueFormatter: (value) => `R$ ${value.toFixed(2)}`,
  valueParser: (value) => parseFloat(value.replace('R$', '').trim()),
}
```

### Action Column

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

### Pinned Column

```typescript
{ field: 'id', headerName: 'ID', pinned: 'left', width: 80, pinnedPriority: 1 },
{ field: 'acoes', headerName: '', pinned: 'right', width: 100, pinnedPriority: 1 },
```

### Column with Checkbox

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

## Row ID Pattern

Always provide `getRowId` for performance and consistency.

```tsx
// With an id field
<FiboGrid getRowId={(row) => String(row.id)} />

// With a composite field
<FiboGrid getRowId={(row) => `${row.tipo}-${row.codigo}`} />
```

---

## Selection Pattern

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

## Programmatic Filter Pattern

```typescript
// Via direct API
api.setFilterModel([
  { field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' },
  { field: 'idade', filterType: 'number', value: 18, operator: 'greaterThan' },
]);

// Via builder (atomic)
api.params()
  .setFilterModel([
    { field: 'status', filterType: 'text', value: 'ativo', operator: 'equals' },
  ])
  .setSortModel([{ field: 'nome', direction: 'asc' }])
  .setPage(0)
  .execute();

// Merge with existing filters
api.setFilterModel(
  [{ field: 'novo', filterType: 'text', value: 'x', operator: 'contains' }],
  { behavior: 'merge' }
);

// Remove a specific filter
api.params().removeFilter('status').execute();

// Clear all
api.params().removeAllFilter().execute();
```

---

## Inline Editing Pattern

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

### Conditional Editing

```typescript
{
  field: 'nome',
  editable: ({ data }) => data.status !== 'bloqueado',
  cellEditor: 'text',
}
```

---

## Export Pattern

```typescript
// CSV
api.exportToCsv({ fileName: 'dados.csv' });

// CSV with selected rows only
api.exportToCsv({ fileName: 'selecionados.csv', onlySelected: true });

// CSV with specific columns
api.exportToCsv({ columnKeys: ['nome', 'email'] });

// Excel
import { exportToExcel } from 'fibogrid';
exportToExcel(rows, columns, { fileName: 'relatorio.xlsx' });

// Clipboard
await api.copyToClipboard(true); // with headers
```

---

## Master-Detail Pattern

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

## Dynamic Data Pattern

### Add rows

```typescript
api.manager().add([novoDado]).execute();
// or at the top
api.manager().upAdd([novoDado]).execute();
```

### Update rows

```typescript
api.manager().update([dadoAtualizado]).execute();
// or a specific cell
api.manager().updateCell('row-1', 'nome', 'Novo Nome').execute();
```

### Remove rows

```typescript
api.manager().remove(['row-1', 'row-2']).execute();
```

### Replace everything

```typescript
api.manager().replaceAll(novosDados).execute();
```

### Unique merge

```typescript
api.manager()
  .key('id')
  .mergeUnique()
  .add(dadosNovos) // Only adds if the ID does not exist
  .execute();
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| `gridId` | kebab-case | `'produtos-lista'` |
| `field` | camelCase | `'nomeCompleto'` |
| `headerName` | Readable text | `'Nome Completo'` |
| API ref | `apiRef` or `gridApiRef` | `const apiRef = useRef<GridApi>()` |
| Generic types | PascalCase | `FiboGrid<Produto>` |

---

## Mandatory Rules

- **ALWAYS** provide `getRowId` when the data has natural IDs
- **NEVER** mutate `rowData` directly — use `api.setRowData()` or `api.manager()`
- **PREFER** `api.params()...execute()` for multiple simultaneous operations
- **USE** `defaultColDef` to avoid repeating common properties
- **IMPORT** `'fibogrid/styles.css'` in the application entry point
