# 06 - 高级功能

## Grid Registry（多表格通信）

允许多个表格相互通信的注册系统。

### 设置

```tsx
import { GridRegistryProvider, FiboGrid } from 'fibogrid';

<GridRegistryProvider>
  <FiboGrid gridId="master-grid" rowData={masterData} columnDefs={masterCols} />
  <FiboGrid gridId="detail-grid" rowData={detailData} columnDefs={detailCols} />
</GridRegistryProvider>
```

### 外部访问

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

## Ingress / Egress（安全）

用于控制表格间通信的权限系统。

### 概念

| 术语 | 说明 |
|------|------|
| **Egress** | 出站（OUTPUT）权限 — 该表格允许其他表格对其执行的操作 |
| **Ingress** | 入站（INPUT）权限 — 该表格接受来自特定表格的操作 |

### 配置

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

### 可用权限

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

### 通配符

- `'*'` — 允许一切
- `'api.*'` — 允许所有 API 方法
- `'manager.*'` — 允许 Manager 的所有操作

### 校验

```typescript
import { validateIngress } from 'fibogrid';

// Retorna true se acao e permitida
const allowed = validateIngress(ingressRules, 'master-grid', 'api.setFilterModel');
```

如果被阻止，会在控制台输出警告：
```
[Grid Security] Blocked action 'api.setPage' from 'unknown-grid'. Reason: No ingress rules for this origin.
```

### 带权限的连接

```typescript
const { grid } = useFiboGrid<MeuTipo>('detail-grid');

// Conectar como origem — retorna API com permissoes validadas
const secureApi = grid.connect('master-grid');
secureApi.setFilterModel([...]); // Sera validado contra ingress rules
```

---

## Row Grouping（行分组）

按一个或多个字段对行进行分组，并支持聚合。

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

### 聚合函数

| 函数 | 说明 |
|------|------|
| `'sum'` | 值的总和 |
| `'avg'` | 值的平均数 |
| `'min'` | 最小值 |
| `'max'` | 最大值 |
| `'count'` | 非空值的数量 |
| `(values) => any` | 自定义函数 |

### 自定义聚合

```typescript
<FiboGrid
  groupAggregations={{
    total: (values) => values.reduce((a, b) => a + b, 0).toFixed(2),
  }}
/>
```

### 按列聚合

```typescript
const colunas: ColumnDef<MeuTipo>[] = [
  { field: 'salario', headerName: 'Salario', aggFunc: 'sum' },
  { field: 'idade', headerName: 'Idade', aggFunc: 'avg' },
];
```

---

## Split Rows（拆分行）

按某个字段在视觉上拆分行。

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  splitByField="categoria"
/>
```

---

## Tree Data（树形数据）

带有可展开子项的层级数据。

```tsx
<FiboGrid
  rowData={dados}
  columnDefs={colunas}
  treeData
  childRowsField="filhos"
  getChildRows={(parent) => parent.filhos}
/>
```

### 动态添加子项

```typescript
api.addChildToRow('parent-id', [
  { id: 'child-1', nome: 'Filho 1' },
  { id: 'child-2', nome: 'Filho 2' },
]);
```

---

## Server-Side Data（服务端数据）

从服务器加载数据，支持远程分页、排序和过滤。

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

### 发送的 Request

```typescript
interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}
```

### 期望的 Response

```typescript
interface ServerSideDataSourceResponse<T> {
  data: T[];
  totalRows: number;
  page: number;
  pageSize: number;
}
```

---

## Undo/Redo（撤销/重做）

撤销/重做系统，历史记录最多 50 个操作。

```typescript
// Via API
api.undo();

// Via Keyboard (quando shortcuts ativo)
// Ctrl+Z = Undo
```

---

## Range Cell Selection（Excel 风格）

通过拖动选择单元格，类似 Excel。

```tsx
<FiboGrid
  rangeCellSelection
  rowSelection="multiple"
/>
```

---

## Fill Handle（填充柄）

拖动选区的角落以扩展数值。

当 `rangeCellSelection` 启用时自动生效。

---

## Keyboard Shortcuts（键盘快捷键）

内置和自定义的键盘快捷键。

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

### 内置快捷键

| 按键 | 操作 |
|------|------|
| `Arrow Up/Down` | 在行之间导航 |
| `Arrow Left/Right` | 在单元格之间导航 |
| `Tab` | 下一个单元格 |
| `Shift+Tab` | 上一个单元格 |
| `Enter` | 开始编辑 / 确认编辑 |
| `Escape` | 取消编辑 |
| `Ctrl+C` | 复制到剪贴板 |
| `Ctrl+V` | 从剪贴板粘贴 |
| `Ctrl+Z` | Undo |
