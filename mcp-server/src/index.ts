#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to fibogrid root (assuming mcp-server is in fibogrid/mcp-server)
const FIBOGRID_ROOT = path.resolve(__dirname, '../..');

interface FiboGridResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}

class FiboGridMCPServer {
    private server: Server;
    private resources: Map<string, FiboGridResource> = new Map();

    constructor() {
        this.server = new Server(
            {
                name: 'fibogrid-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            }
        );

        this.setupResources();
        this.setupHandlers();
    }

    private setupResources() {
        // Documentation resources
        this.resources.set('fibogrid://readme', {
            uri: 'fibogrid://readme',
            name: 'FiboGrid README',
            description: 'Main README with features, installation, and quick start guide',
            mimeType: 'text/markdown',
        });

        this.resources.set('fibogrid://usage', {
            uri: 'fibogrid://usage',
            name: 'FiboGrid Usage Guide',
            description: 'Comprehensive TypeScript usage examples and patterns',
            mimeType: 'text/markdown',
        });

        this.resources.set('fibogrid://theming', {
            uri: 'fibogrid://theming',
            name: 'FiboGrid Theming Guide',
            description: 'Theming and customization documentation',
            mimeType: 'text/markdown',
        });

        this.resources.set('fibogrid://changelog', {
            uri: 'fibogrid://changelog',
            name: 'FiboGrid Changelog',
            description: 'Version history and changes',
            mimeType: 'text/markdown',
        });

        // API Reference
        this.resources.set('fibogrid://api/types', {
            uri: 'fibogrid://api/types',
            name: 'FiboGrid Type Definitions',
            description: 'All exported TypeScript types and interfaces',
            mimeType: 'text/plain',
        });

        this.resources.set('fibogrid://api/hooks', {
            uri: 'fibogrid://api/hooks',
            name: 'FiboGrid Hooks',
            description: 'Available React hooks for grid control',
            mimeType: 'text/plain',
        });

        this.resources.set('fibogrid://api/components', {
            uri: 'fibogrid://api/components',
            name: 'FiboGrid Components',
            description: 'Exported components and their usage',
            mimeType: 'text/plain',
        });

        // Examples
        this.resources.set('fibogrid://examples/basic', {
            uri: 'fibogrid://examples/basic',
            name: 'Basic Grid Example',
            description: 'Simple grid setup with TypeScript',
            mimeType: 'text/plain',
        });

        this.resources.set('fibogrid://examples/server-side', {
            uri: 'fibogrid://examples/server-side',
            name: 'Server-Side Example',
            description: 'Server-side pagination, sorting, and filtering',
            mimeType: 'text/plain',
        });

        this.resources.set('fibogrid://examples/custom-renderer', {
            uri: 'fibogrid://examples/custom-renderer',
            name: 'Custom Cell Renderer Example',
            description: 'Custom cell rendering with TypeScript',
            mimeType: 'text/plain',
        });
    }

    private setupHandlers() {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: Array.from(this.resources.values()),
            };
        });

        // Read resource content
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;
            const resource = this.resources.get(uri);

            if (!resource) {
                throw new Error(`Resource not found: ${uri}`);
            }

            const content = await this.getResourceContent(uri);

            return {
                contents: [
                    {
                        uri: resource.uri,
                        mimeType: resource.mimeType,
                        text: content,
                    },
                ],
            };
        });

        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'search_fibogrid_docs',
                        description: 'Search FiboGrid documentation for specific topics or features',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'Search query (e.g., "pagination", "cell renderer", "sorting")',
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'get_column_def_example',
                        description: 'Get a ColumnDef example with specific features',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                features: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Features to include (e.g., ["sortable", "filterable", "editable", "pinned"])',
                                },
                                fieldType: {
                                    type: 'string',
                                    description: 'Data type of the field (string, number, date, boolean)',
                                },
                            },
                            required: ['features'],
                        },
                    },
                    {
                        name: 'generate_grid_config',
                        description: 'Generate a complete FiboGrid configuration based on requirements',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                dataType: {
                                    type: 'string',
                                    description: 'TypeScript interface name for the data',
                                },
                                features: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Features needed (pagination, sorting, filtering, row-selection, etc.)',
                                },
                                serverSide: {
                                    type: 'boolean',
                                    description: 'Whether to use server-side data source',
                                },
                            },
                            required: ['dataType', 'features'],
                        },
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            if (!args) {
                throw new Error('Missing arguments');
            }

            switch (name) {
                case 'search_fibogrid_docs':
                    return await this.searchDocs(args.query as string);

                case 'get_column_def_example':
                    return await this.getColumnDefExample(
                        args.features as string[],
                        args.fieldType as string
                    );

                case 'generate_grid_config':
                    return await this.generateGridConfig(
                        args.dataType as string,
                        args.features as string[],
                        args.serverSide as boolean
                    );

                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }

    private async getResourceContent(uri: string): Promise<string> {
        switch (uri) {
            case 'fibogrid://readme':
                return await fs.readFile(path.join(FIBOGRID_ROOT, 'README.md'), 'utf-8');

            case 'fibogrid://usage':
                return await fs.readFile(path.join(FIBOGRID_ROOT, 'docs/guides/usage.md'), 'utf-8');

            case 'fibogrid://theming':
                return await fs.readFile(path.join(FIBOGRID_ROOT, 'docs/guides/theming.md'), 'utf-8');

            case 'fibogrid://changelog':
                return await fs.readFile(path.join(FIBOGRID_ROOT, 'CHANGELOG.md'), 'utf-8');

            case 'fibogrid://api/types':
                return this.getTypesReference();

            case 'fibogrid://api/hooks':
                return this.getHooksReference();

            case 'fibogrid://api/components':
                return this.getComponentsReference();

            case 'fibogrid://examples/basic':
                return this.getBasicExample();

            case 'fibogrid://examples/server-side':
                return this.getServerSideExample();

            case 'fibogrid://examples/custom-renderer':
                return this.getCustomRendererExample();

            default:
                throw new Error(`Unknown resource: ${uri}`);
        }
    }

    private getTypesReference(): string {
        return `# FiboGrid Type Definitions

## Core Types

### FiboGridProps<T>
Main component props for FiboGrid.

\`\`\`typescript
interface FiboGridProps<T> {
  // Data
  rowData: T[];
  columnDefs: ColumnDef<T>[];
  getRowId?: (data: T) => string;
  
  // Dimensions
  height?: number | string;
  width?: number | string;
  rowHeight?: number;
  
  // Features
  pagination?: boolean;
  paginationMode?: 'client' | 'server';
  paginationPageSize?: number;
  rowSelection?: 'single' | 'multiple';
  
  // Server-side
  serverSideDataSource?: ServerSideDataSource<T>;
  
  // UI
  showToolbar?: boolean;
  showStatusBar?: boolean;
  theme?: 'light' | 'dark';
  locale?: FiboGridLocale;
  
  // Events
  onGridReady?: (event: GridReadyEvent<T>) => void;
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  onCellClicked?: (event: CellClickedEvent<T>) => void;
  onSelectionChanged?: (event: SelectionChangedEvent<T>) => void;
}
\`\`\`

### ColumnDef<T>
Column definition with all available options.

\`\`\`typescript
interface ColumnDef<T> {
  field: keyof T | string;
  headerName?: string;
  width?: number;
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
  
  // Features
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'boolean';
  editable?: boolean;
  resizable?: boolean;
  pinned?: 'left' | 'right';
  hide?: boolean;
  
  // Rendering
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  headerRenderer?: (params: HeaderRendererParams<T>) => React.ReactNode;
  valueFormatter?: (value: any) => string;
  valueGetter?: (data: T) => any;
  
  // Editing
  cellEditor?: 'text' | 'number' | 'date' | 'select' | 'custom';
  cellEditorParams?: any;
  
  // Grouping
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}
\`\`\`

### GridApi<T>
API for programmatic grid control.

\`\`\`typescript
interface GridApi<T> {
  // Selection
  getSelectedRows(): RowNode<T>[];
  setSelectedRows(rowIds: string[]): void;
  deselectAll(): void;
  
  // Data
  getDisplayedRows(): RowNode<T>[];
  getAllRows(): RowNode<T>[];
  updateRowData(data: T[]): void;
  
  // Filtering
  setFilterModel(filters: FilterModel[]): void;
  getFilterModel(): FilterModel[];
  
  // Sorting
  setSortModel(sorts: SortModel[]): void;
  getSortModel(): SortModel[];
  
  // Export
  exportToCsv(params?: ExportParams): void;
  exportToExcel(params?: ExportParams): void;
  
  // Refresh
  refresh(): void;
}
\`\`\`

## Event Types

### CellClickedEvent<T>
\`\`\`typescript
interface CellClickedEvent<T> {
  rowNode: RowNode<T>;
  column: ProcessedColumn<T>;
  value: any;
  event: React.MouseEvent;
}
\`\`\`

### RowClickedEvent<T>
\`\`\`typescript
interface RowClickedEvent<T> {
  rowNode: RowNode<T>;
  event: React.MouseEvent;
}
\`\`\`

## Server-Side Types

### ServerSideDataSource<T>
\`\`\`typescript
interface ServerSideDataSource<T> {
  getRows(request: ServerSideDataSourceRequest): Promise<ServerSideDataSourceResponse<T>>;
}
\`\`\`

### ServerSideDataSourceRequest
\`\`\`typescript
interface ServerSideDataSourceRequest {
  page: number;
  pageSize: number;
  sortModel: SortModel[];
  filterModel: FilterModel[];
  quickFilterText?: string;
}
\`\`\`
`;
    }

    private getHooksReference(): string {
        return `# FiboGrid Hooks

## useFiboGrid
Access grid API from anywhere in your component tree.

\`\`\`typescript
import { useFiboGrid } from 'fibogrid';

function MyComponent() {
  const gridApi = useFiboGrid('my-grid-id');
  
  const handleExport = () => {
    gridApi?.exportToCsv();
  };
  
  return <button onClick={handleExport}>Export</button>;
}
\`\`\`

## useGridEvent
Subscribe to grid events from anywhere.

\`\`\`typescript
import { useGridEvent } from 'fibogrid';

function MyComponent() {
  useGridEvent('my-grid-id', 'rowSelected', (event) => {
    console.log('Row selected:', event.rowNode.data);
  });
  
  return <div>Listening to grid events...</div>;
}
\`\`\`

## useGridRegistry
Access the grid registry to manage multiple grids.

\`\`\`typescript
import { useGridRegistry } from 'fibogrid';

function MyComponent() {
  const { getGridApi, getAllGrids } = useGridRegistry();
  
  const syncGrids = () => {
    const masterApi = getGridApi('master-grid');
    const detailApi = getGridApi('detail-grid');
    
    if (masterApi && detailApi) {
      const selected = masterApi.getSelectedRows();
      // Do something with both grids
    }
  };
  
  return <button onClick={syncGrids}>Sync Grids</button>;
}
\`\`\`
`;
    }

    private getComponentsReference(): string {
        return `# FiboGrid Components

## FiboGrid
Main grid component.

\`\`\`typescript
import { FiboGrid } from 'fibogrid';
import type { ColumnDef } from 'fibogrid';

<FiboGrid<MyDataType>
  rowData={data}
  columnDefs={columns}
  pagination
  rowSelection="multiple"
/>
\`\`\`

## GridProvider
Context provider for grid state.

\`\`\`typescript
import { GridProvider, useGridContext } from 'fibogrid';

<GridProvider>
  <MyGridComponent />
</GridProvider>
\`\`\`

## GridRegistryProvider
Provider for managing multiple grids.

\`\`\`typescript
import { GridRegistryProvider } from 'fibogrid';

<GridRegistryProvider>
  <MasterGrid />
  <DetailGrid />
</GridRegistryProvider>
\`\`\`

## GridToolbar
Customizable toolbar component.

\`\`\`typescript
import { GridToolbar } from 'fibogrid';

<GridToolbar
  showExport
  showColumnPanel
  showFilterPanel
  customButtons={[
    { label: 'Custom Action', onClick: () => {} }
  ]}
/>
\`\`\`

## GridStatusBar
Status bar showing grid information.

\`\`\`typescript
import { GridStatusBar } from 'fibogrid';

<GridStatusBar
  showRowCount
  showSelectedCount
  showFilteredCount
/>
\`\`\`
`;
    }

    private getBasicExample(): string {
        return `import { FiboGrid } from 'fibogrid';
import type { ColumnDef } from 'fibogrid';
import 'fibogrid/styles.css';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const columns: ColumnDef<User>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'email', headerName: 'Email', sortable: true, width: 250 },
  { field: 'age', headerName: 'Age', sortable: true, filterType: 'number' },
];

const data: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
];

export function BasicGrid() {
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
}`;
    }

    private getServerSideExample(): string {
        return `import { FiboGrid } from 'fibogrid';
import type { ColumnDef, ServerSideDataSource } from 'fibogrid';

interface APIData {
  id: string;
  title: string;
  description: string;
}

const dataSource: ServerSideDataSource<APIData> = {
  async getRows(request) {
    const params = new URLSearchParams({
      page: request.page.toString(),
      pageSize: request.pageSize.toString(),
    });

    if (request.sortModel.length > 0) {
      params.append('sortField', request.sortModel[0].field);
      params.append('sortOrder', request.sortModel[0].direction || 'asc');
    }

    const response = await fetch(\`/api/data?\${params}\`);
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

export function ServerSideGrid() {
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
}`;
    }

    private getCustomRendererExample(): string {
        return `import { FiboGrid } from 'fibogrid';
import type { ColumnDef, CellRendererParams } from 'fibogrid';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

const columns: ColumnDef<Product>[] = [
  {
    field: 'name',
    headerName: 'Product',
    sortable: true,
    filterable: true,
  },
  {
    field: 'price',
    headerName: 'Price',
    sortable: true,
    filterType: 'number',
    cellRenderer: ({ value }: CellRendererParams<Product>) => (
      <span className="font-mono font-bold">
        \${(value as number).toFixed(2)}
      </span>
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
        <span className={\`text-\${color}-600 font-medium\`}>
          {stock}
        </span>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: ({ value }: CellRendererParams<Product>) => (
      <span className={value === 'active' ? 'text-green-600' : 'text-red-600'}>
        {value}
      </span>
    ),
  },
];

export function ProductGrid() {
  const products: Product[] = [
    { id: '1', name: 'Laptop Pro', price: 1299.99, stock: 45, status: 'active' },
    { id: '2', name: 'Mouse Wireless', price: 29.99, stock: 150, status: 'active' },
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
}`;
    }

    private async searchDocs(query: string): Promise<{ content: Array<{ type: string; text: string }> }> {
        const lowerQuery = query.toLowerCase();
        const results: string[] = [];

        // Search in README
        const readme = await fs.readFile(path.join(FIBOGRID_ROOT, 'README.md'), 'utf-8');
        const readmeLines = readme.split('\n');
        for (let i = 0; i < readmeLines.length; i++) {
            if (readmeLines[i].toLowerCase().includes(lowerQuery)) {
                const context = readmeLines.slice(Math.max(0, i - 2), Math.min(readmeLines.length, i + 3)).join('\n');
                results.push(`**README.md (line ${i + 1}):**\n${context}\n`);
            }
        }

        // Search in USAGE
        const usage = await fs.readFile(path.join(FIBOGRID_ROOT, 'docs/guides/usage.md'), 'utf-8');
        const usageLines = usage.split('\n');
        for (let i = 0; i < usageLines.length; i++) {
            if (usageLines[i].toLowerCase().includes(lowerQuery)) {
                const context = usageLines.slice(Math.max(0, i - 2), Math.min(usageLines.length, i + 3)).join('\n');
                results.push(`**docs/guides/usage.md (line ${i + 1}):**\n${context}\n`);
            }
        }

        if (results.length === 0) {
            results.push(`No results found for "${query}". Try searching for: pagination, filtering, sorting, cell renderer, server-side, etc.`);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: `# Search Results for "${query}"\n\n${results.join('\n---\n\n')}`,
                },
            ],
        };
    }

    private async getColumnDefExample(
        features: string[],
        fieldType: string = 'string'
    ): Promise<{ content: Array<{ type: string; text: string }> }> {
        const featureSet = new Set(features.map(f => f.toLowerCase()));

        let example = `import type { ColumnDef } from 'fibogrid';\n\nconst column: ColumnDef<YourDataType> = {\n  field: 'yourField',\n  headerName: 'Your Field',\n`;

        if (featureSet.has('sortable')) {
            example += `  sortable: true,\n`;
        }

        if (featureSet.has('filterable')) {
            example += `  filterable: true,\n`;
            if (fieldType === 'number') {
                example += `  filterType: 'number',\n`;
            } else if (fieldType === 'date') {
                example += `  filterType: 'date',\n`;
            }
        }

        if (featureSet.has('editable')) {
            example += `  editable: true,\n`;
        }

        if (featureSet.has('pinned')) {
            example += `  pinned: 'left', // or 'right'\n`;
        }

        if (featureSet.has('width')) {
            example += `  width: 200,\n`;
        }

        if (featureSet.has('flex')) {
            example += `  flex: 1,\n`;
        }

        if (featureSet.has('custom-renderer')) {
            example += `  cellRenderer: ({ value }) => (\n    <span className="custom-cell">{value}</span>\n  ),\n`;
        }

        example += `};`;

        return {
            content: [
                {
                    type: 'text',
                    text: example,
                },
            ],
        };
    }

    private async generateGridConfig(
        dataType: string,
        features: string[],
        serverSide: boolean = false
    ): Promise<{ content: Array<{ type: string; text: string }> }> {
        const featureSet = new Set(features.map(f => f.toLowerCase()));

        let config = `import { FiboGrid } from 'fibogrid';\nimport type { ColumnDef`;

        if (serverSide) {
            config += `, ServerSideDataSource`;
        }

        config += ` } from 'fibogrid';\nimport 'fibogrid/styles.css';\n\n`;
        config += `interface ${dataType} {\n  id: string;\n  // Add your fields here\n}\n\n`;
        config += `const columns: ColumnDef<${dataType}>[] = [\n  // Define your columns here\n];\n\n`;

        if (serverSide) {
            config += `const dataSource: ServerSideDataSource<${dataType}> = {\n`;
            config += `  async getRows(request) {\n`;
            config += `    const response = await fetch('/api/data');\n`;
            config += `    const json = await response.json();\n`;
            config += `    return {\n`;
            config += `      data: json.items,\n`;
            config += `      totalRows: json.total,\n`;
            config += `      page: json.page,\n`;
            config += `      pageSize: json.pageSize,\n`;
            config += `    };\n`;
            config += `  },\n`;
            config += `};\n\n`;
        }

        config += `export function MyGrid() {\n`;
        config += `  return (\n`;
        config += `    <FiboGrid<${dataType}>\n`;
        config += `      rowData={${serverSide ? '[]' : 'data'}}\n`;
        config += `      columnDefs={columns}\n`;

        if (featureSet.has('pagination')) {
            config += `      pagination\n`;
            if (serverSide) {
                config += `      paginationMode="server"\n`;
                config += `      serverSideDataSource={dataSource}\n`;
            }
            config += `      paginationPageSize={50}\n`;
        }

        if (featureSet.has('row-selection')) {
            config += `      rowSelection="multiple"\n`;
        }

        if (featureSet.has('toolbar')) {
            config += `      showToolbar\n`;
        }

        if (featureSet.has('status-bar')) {
            config += `      showStatusBar\n`;
        }

        config += `      height={600}\n`;
        config += `    />\n`;
        config += `  );\n`;
        config += `}`;

        return {
            content: [
                {
                    type: 'text',
                    text: config,
                },
            ],
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('FiboGrid MCP Server running on stdio');
    }
}

const server = new FiboGridMCPServer();
server.run().catch(console.error);
