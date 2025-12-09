# FiboGrid

[![npm version](https://img.shields.io/npm/v/fibogrid.svg)](https://www.npmjs.com/package/fibogrid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

High-performance React data grid component inspired by mathematical elegance and the golden ratio.

**[Documentation](https://felipeoliveiradev.github.io/fibogrid)** | **[Demo](https://felipeoliveiradev.github.io/fibogrid/demo)** | **[Examples](https://felipeoliveiradev.github.io/fibogrid/docs)**

## ✨ Features

- ⚡ **Blazing Fast** - Virtual scrolling optimized for 100k+ rows at 60fps
- 🎨 **Modern Design** - Built with Tailwind CSS and shadcn/ui components
- 📊 **Advanced Sorting** - Multi-column sorting with priority order
- 🔍 **Excel-style Filtering** - Powerful filtering with multiple conditions
- 📌 **Column Pinning** - Pin columns left or right with solid backgrounds
- ✏️ **Inline Editing** - Edit cells directly with various editor types
- 📦 **Row Grouping** - Group rows with aggregations (sum, avg, min, max, count)
- 🎯 **Range Selection** - Select and copy cell ranges like Excel
- 🔄 **Drag & Drop** - Reorder rows and columns via drag
- 📤 **Export** - Export to CSV and Excel formats
- 🌓 **Dark Mode** - Full dark mode support
- 🔗 **Linked Grids** - Sync state between multiple grids
- 🌐 **Server-side Mode** - Pagination, sorting, and filtering on the server
- ♿ **Accessible** - Full keyboard navigation support
- 📱 **TypeScript** - Fully typed with TypeScript

## 📦 Installation

```bash
npm install fibogrid
```

```bash
yard add fibogrid
```

```bash
pnpm add fibogrid
```

## 🚀 Quick Start

```tsx
import { FiboGrid } from 'fibogrid';
import type { ColumnDef } from 'fibogrid';
import 'fibogrid/styles';

interface Row {
  id: string;
  name: string;
  email: string;
  age: number;
}

const columns: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'email', headerName: 'Email', sortable: true, width: 250 },
  { field: 'age', headerName: 'Age', sortable: true, filterType: 'number' },
];

const data: Row[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
];

function App() {
  return (
    <FiboGrid
      rowData={data}
      columnDefs={columns}
      rowSelection="multiple"
      pagination
      paginationPageSize={50}
      height={600}
    />
  );
}
```

## 📚 Documentation

For full documentation, visit [https://felipeoliveiradev.github.io/fibogrid](https://felipeoliveiradev.github.io/fibogrid)

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rowData` | `T[]` | required | Array of data objects |
| `columnDefs` | `ColumnDef<T>[]` | required | Column definitions |
| `getRowId` | `(data: T) => string` | auto | Function to get unique row ID |
| `height` | `number \| string` | `600` | Grid height |
| `rowHeight` | `number` | `40` | Height of each row |
| `pagination` | `boolean` | `false` | Enable pagination |
| `paginationPageSize` | `number` | `100` | Rows per page |
| `rowSelection` | `'single' \| 'multiple'` | - | Enable row selection |
| `showToolbar` | `boolean` | `true` | Show top toolbar |
| `showStatusBar` | `boolean` | `true` | Show bottom status bar |

### Column Definition

```tsx
interface ColumnDef<T> {
  field: string;
  headerName?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date';
  editable?: boolean;
  pinned?: 'left' | 'right';
  hide?: boolean;
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  valueFormatter?: (value: any) => string;
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}
```

## 🎯 Advanced Examples

### Server-side Pagination

```tsx
const dataSource: ServerSideDataSource<Row> = {
  async getRows(request) {
    const response = await fetch(`/api/data?page=${request.page}&pageSize=${request.pageSize}`);
    const json = await response.json();
    return {
      data: json.items,
      totalRows: json.total,
      page: json.page,
      pageSize: json.pageSize,
    };
  },
};

<FiboGrid
  rowData={[]}
  columnDefs={columns}
  pagination
  paginationMode="server"
  serverSideDataSource={dataSource}
/>
```

### Row Grouping

```tsx
<FiboGrid
  rowData={data}
  columnDefs={columns}
  groupByFields={['department', 'team']}
  groupAggregations={{
    salary: 'sum',
    age: 'avg',
  }}
/>
```

### Custom Cell Renderer

```tsx
const columns: ColumnDef<Row>[] = [
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: ({ value }) => {
      const colors = {
        active: 'bg-green-500',
        inactive: 'bg-red-500',
      };
      return (
        <span className={`px-2 py-1 rounded ${colors[value]}`}>
          {value}
        </span>
      );
    },
  },
];
```

## 🛠 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build library
npm run build:lib

# Build documentation site
npm run build
```

## 📄 License

MIT © Felipe Oliveira

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Documentation](https://felipeoliveiradev.github.io/fibogrid)
- [NPM Package](https://www.npmjs.com/package/fibogrid)
- [GitHub Repository](https://github.com/felipeoliveiradev/fibogrid)
- [Issue Tracker](https://github.com/felipeoliveiradev/fibogrid/issues)
