# 08 - 使用模式

## 列结构

### 基础列

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'nome', headerName: 'Nome', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'idade', headerName: 'Idade', width: 100 },
];
```

### 带自定义 Renderer 的列

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

### 带编辑器的列

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

### 带格式化的列

```typescript
{
  field: 'preco',
  headerName: 'Preco',
  valueFormatter: (value) => `R$ ${value.toFixed(2)}`,
  valueParser: (value) => parseFloat(value.replace('R$', '').trim()),
}
```

### 操作列

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

### 固定列（Pinned）

```typescript
{ field: 'id', headerName: 'ID', pinned: 'left', width: 80, pinnedPriority: 1 },
{ field: 'acoes', headerName: '', pinned: 'right', width: 100, pinnedPriority: 1 },
```

### 带复选框的列

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

## Row ID 模式

为了性能和一致性，始终提供 `getRowId`。

```tsx
// Com campo id
<FiboGrid getRowId={(row) => String(row.id)} />

// Com campo composto
<FiboGrid getRowId={(row) => `${row.tipo}-${row.codigo}`} />
```

---

## 选择模式

### 单选

```tsx
<FiboGrid
  rowSelection="single"
  onSelectionChanged={({ selectedRows }) => {
    setSelected(selectedRows[0]?.data ?? null);
  }}
/>
```

### 多选

```tsx
<FiboGrid
  rowSelection="multiple"
  onSelectionChanged={({ selectedRows }) => {
    setSelectedIds(selectedRows.map(r => r.id));
  }}
/>
```

---

## 编程式过滤模式

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

## 行内编辑模式

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

### 条件编辑

```typescript
{
  field: 'nome',
  editable: ({ data }) => data.status !== 'bloqueado',
  cellEditor: 'text',
}
```

---

## 导出模式

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

## Master-Detail 模式

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

## 动态数据模式

### 添加行

```typescript
api.manager().add([novoDado]).execute();
// ou no topo
api.manager().upAdd([novoDado]).execute();
```

### 更新行

```typescript
api.manager().update([dadoAtualizado]).execute();
// ou celula especifica
api.manager().updateCell('row-1', 'nome', 'Novo Nome').execute();
```

### 删除行

```typescript
api.manager().remove(['row-1', 'row-2']).execute();
```

### 全部替换

```typescript
api.manager().replaceAll(novosDados).execute();
```

### 唯一 Merge

```typescript
api.manager()
  .key('id')
  .mergeUnique()
  .add(dadosNovos) // Apenas adiciona se ID nao existir
  .execute();
```

---

## 命名约定

| 元素 | 约定 | 示例 |
|------|------|------|
| `gridId` | kebab-case | `'produtos-lista'` |
| `field` | camelCase | `'nomeCompleto'` |
| `headerName` | 可读文本 | `'Nome Completo'` |
| API 的 Ref | `apiRef` 或 `gridApiRef` | `const apiRef = useRef<GridApi>()` |
| 泛型类型 | PascalCase | `FiboGrid<Produto>` |

---

## 强制规则

- 当数据具有天然 ID 时，**始终**提供 `getRowId`
- **绝不**直接修改 `rowData` — 使用 `api.setRowData()` 或 `api.manager()`
- 对于多个同时进行的操作，**优先使用** `api.params()...execute()`
- **使用** `defaultColDef` 避免重复公共属性
- **务必**在应用入口导入 `'fibogrid/styles.css'`
