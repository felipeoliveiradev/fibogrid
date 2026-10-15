# FiboGrid - TypeScript 使用示例

## 安装

```bash
npm install fibogrid
```

```result
added 1 package, and audited the tree
fibogrid@latest ready
```

## 基础 TypeScript 示例

```typescript
import { FiboGrid } from 'fibogrid';
import type { ColumnDef, GridApi } from 'fibogrid';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive';
}

function App() {
  const [gridApi, setGridApi] = useState<GridApi<User> | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      field: 'name',
      headerName: 'Name',
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      width: 250,
    },
    {
      field: 'age',
      headerName: 'Age',
      sortable: true,
      filterType: 'number',
      width: 100,
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: ({ value }) => (
        <span className={value === 'active' ? 'text-green-600' : 'text-red-600'}>
          {value}
        </span>
      ),
    },
  ];

  const data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'inactive' },
  ];

  return (
    <FiboGrid
      rowData={data}
      columnDefs={columns}
      rowSelection="multiple"
      pagination
      paginationPageSize={50}
      height={600}
      onGridReady={({ api }) => setGridApi(api)}
      onRowClicked={(event) => {
        console.log('Clicked row:', event.rowNode.data);
      }}
    />
  );
}
```

## 自定义单元格渲染器高级示例

```typescript
import { FiboGrid } from 'fibogrid';
import type { ColumnDef, CellRendererParams } from 'fibogrid';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

function ProductGrid() {
  const columns: ColumnDef<Product>[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      sortable: true,
      filterable: true,
      pinned: 'left',
    },
    {
      field: 'price',
      headerName: 'Price',
      sortable: true,
      filterType: 'number',
      valueFormatter: (value) => `$${value.toFixed(2)}`,
      cellRenderer: ({ value }: CellRendererParams<Product>) => (
        <span className="font-mono font-bold">${(value as number).toFixed(2)}</span>
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      sortable: true,
      filterType: 'number',
      cellRenderer: ({ value }: CellRendererParams<Product>) => {
        const stock = value as number;
        const color = stock > 50 ? 'green' : stock > 10 ? 'yellow' : 'red';
        return (
          <span className={`text-${color}-600 font-medium`}>
            {stock}
          </span>
        );
      },
    },
    {
      field: 'category',
      headerName: 'Category',
      sortable: true,
      filterable: true,
    },
  ];

  const products: Product[] = [
    { id: '1', name: 'Laptop Pro', price: 1299.99, stock: 45, category: 'Electronics' },
    { id: '2', name: 'Mouse Wireless', price: 29.99, stock: 150, category: 'Accessories' },
  ];

  return (
    <FiboGrid
      rowData={products}
      columnDefs={columns}
      showToolbar
      showStatusBar
      height={500}
    />
  );
}
```

## 服务端分页示例

```typescript
import { FiboGrid } from 'fibogrid';
import type { 
  ColumnDef, 
  ServerSideDataSource, 
  ServerSideDataSourceRequest,
  ServerSideDataSourceResponse 
} from 'fibogrid';

interface APIData {
  id: string;
  title: string;
  description: string;
}

function ServerSideGrid() {
  const dataSource: ServerSideDataSource<APIData> = {
    async getRows(request: ServerSideDataSourceRequest): Promise<ServerSideDataSourceResponse<APIData>> {
      const params = new URLSearchParams({
        page: request.page.toString(),
        pageSize: request.pageSize.toString(),
      });

      // Add sorting
      if (request.sortModel.length > 0) {
        params.append('sortField', request.sortModel[0].field);
        params.append('sortOrder', request.sortModel[0].direction || 'asc');
      }

      // Add search
      if (request.quickFilterText) {
        params.append('search', request.quickFilterText);
      }

      const response = await fetch(`/api/data?${params}`);
      const json = await response.json();

      return {
        data: json.items,
        totalRows: json.total,
        page: json.page,
        pageSize: json.pageSize,
      };
    },
  };

  const columns: ColumnDef<APIData>[] = [
    { field: 'title', headerName: 'Title', sortable: true, filterable: true },
    { field: 'description', headerName: 'Description', width: 300 },
  ];

  return (
    <FiboGrid
      rowData={[]}
      columnDefs={columns}
      pagination
      paginationMode="server"
      paginationPageSize={25}
      serverSideDataSource={dataSource}
    />
  );
}
```

## 列宽与 Flex 布局

FiboGrid 提供了强大的列宽控制工具，包括固定宽度、自动调整大小以及用于填满可用空间的 flex 布局。

### 基础宽度

你可以为列定义固定宽度，或使用默认宽度（150px）。

```typescript
const columns: ColumnDef<Row>[] = [
  { field: 'id', width: 80 },        // Fixed 80px
  { field: 'name', width: 200 },     // Fixed 200px
  { field: 'description' }           // Default 150px
];
```

### Flex 布局（自动填充）

要让列自动填满表格中剩余的空白空间，请使用 `flex` 属性。表格会在所有 flex 列之间按比例分配可用空间。

```typescript
const columns: ColumnDef<Row>[] = [
  { field: 'id', width: 80 },        // Fixed width
  { field: 'title', flex: 1 },       // Takes 1 part of remaining space
  { field: 'status', flex: 1 },      // Takes 1 part (equal to title)
  { field: 'description', flex: 2 }  // Takes 2 parts (twice as wide as title)
];
```

### 全局默认值

你可以使用 `defaultColDef` 将设置应用于**所有**列，以避免重复。例如，让所有列都具有弹性并填满表格：

```typescript
<FiboGrid
  rowData={data}
  columnDefs={columns}
  defaultColDef={{
    flex: 1,           // All columns will share space equally
    minWidth: 100,     // Prevents columns from becoming too narrow
    sortable: true,    // Enable sorting for everything
    filterable: true   // Enable filtering for everything
  }}
/>
```

## 使用 Grid API

```typescript
import { FiboGrid } from 'fibogrid';
import type { ColumnDef, GridApi } from 'fibogrid';
import { useRef } from 'react';

interface Row {
  id: string;
  name: string;
}

function GridWithAPI() {
  const apiRef = useRef<GridApi<Row> | null>(null);

  const columns: ColumnDef<Row>[] = [
    { field: 'name', headerName: 'Name' },
  ];

  const data: Row[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  const handleExport = () => {
    if (apiRef.current) {
      const selectedRows = apiRef.current.getSelectedRows();
      console.log('Selected rows:', selectedRows);
      
      const displayedRows = apiRef.current.getDisplayedRows();
      console.log('Total displayed rows:', displayedRows.length);
    }
  };

  return (
    <>
      <button onClick={handleExport}>Export Selected</button>
      <FiboGrid
        rowData={data}
        columnDefs={columns}
        rowSelection="multiple"
        onGridReady={({ api }) => {
          apiRef.current = api;
        }}
      />
    </>
  );
}
```

## 跨表格通信（Grid Registry）

FiboGrid 提供了内置的注册表系统，允许表格之间相互通信。这对于主从（Master-Detail）视图或同步表格非常有用。

### 设置

使用 `GridRegistryProvider` 包裹你的应用或表格容器：

```tsx
import { GridRegistryProvider, FiboGrid, useGridRegistry } from 'fibogrid';

function App() {
  return (
    <GridRegistryProvider>
      <LinkedGrids />
    </GridRegistryProvider>
  );
}
```

### 访问其他表格（Master-Detail 示例）

使用 `useGridRegistry`，通过 `gridId` 访问任何已注册表格的 API：

```tsx
function LinkedGrids() {
  const { getGridApi } = useGridRegistry();

  const handleMasterSelect = (event) => {
    // Get the Detail Grid API by ID
    const detailApi = getGridApi('detail-grid');
    
    if (detailApi && event.selected) {
       // Filter detail grid based on master selection
       detailApi.setFilterModel([
         { 
           field: 'categoryId', 
           filterType: 'text', 
           operator: 'equals', 
           value: event.rowNode.data.id 
         }
       ]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Master Grid */}
      <FiboGrid
        gridId="master-grid"
        rowData={categories}
        columnDefs={categoryCols}
        rowSelection="single"
        onRowSelected={handleMasterSelect}
      />
      
      {/* Detail Grid */}
      <FiboGrid
        gridId="detail-grid"
        rowData={items}
        columnDefs={itemCols}
      />
    </div>
  );
}
```

## 类型定义

所有类型均已完整导出并可使用：

```typescript
import type {
  // Main component props
  FiboGridProps,
  
  // Column types
  ColumnDef,
  ProcessedColumn,
  
  // Event types
  CellClickedEvent,
  CellDoubleClickedEvent,
  CellValueChangedEvent,
  RowClickedEvent,
  RowDoubleClickedEvent,
  
  // Row types
  RowNode,
  
  // API
  GridApi,
  
  // Cell renderer params
  CellRendererParams,
  HeaderRendererParams,
  
  // Server-side types
  ServerSideDataSource,
  ServerSideDataSourceRequest,
  ServerSideDataSourceResponse,
  
  // Other types
  SortModel,
  FilterModel,
  PaginationState,
} from 'fibogrid';
```

## 说明

- 当你为 `ColumnDef<T>` 提供泛型类型时，所有类型都会根据你的数据自动推断
- 该库完全支持 tree-shaking
- 包含 source maps，以获得更好的调试体验
