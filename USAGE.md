# FiboGrid - TypeScript Usage Examples

## Installation

```bash
npm install fibogrid
```

## Basic TypeScript Example

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

## Advanced Example with Custom Cell Renderer

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

## Server-Side Pagination Example

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

## Using Grid API

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

## Type Definitions

All types are fully exported and available:

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

## Notes

- All types are automatically inferred from your data when you provide a generic type to `ColumnDef<T>`
- The library is fully tree-shakeable
- Source maps are included for better debugging experience
