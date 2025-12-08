import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table2, ArrowLeft, Copy, Check, BookOpen, Code, Zap, Settings, Layers, Filter, ArrowUpDown, Pin, Edit3, Download, Move } from 'lucide-react';

const CodeBlock = ({ code, language = 'tsx' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const sections = [
  { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
  { id: 'basic-usage', title: 'Basic Usage', icon: Code },
  { id: 'columns', title: 'Column Definitions', icon: Layers },
  { id: 'sorting', title: 'Sorting', icon: ArrowUpDown },
  { id: 'filtering', title: 'Filtering', icon: Filter },
  { id: 'selection', title: 'Row Selection', icon: Settings },
  { id: 'editing', title: 'Inline Editing', icon: Edit3 },
  { id: 'pinning', title: 'Column Pinning', icon: Pin },
  { id: 'grouping', title: 'Row Grouping', icon: Layers },
  { id: 'drag-drop', title: 'Drag & Drop', icon: Move },
  { id: 'export', title: 'Export', icon: Download },
  { id: 'performance', title: 'Performance', icon: Zap },
  { id: 'api', title: 'Grid API', icon: Settings },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Table2 className="h-6 w-6 text-primary" />
              <span className="font-bold">LovGrid</span>
            </Link>
            <Badge variant="outline">Documentation</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/demo">Live Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <ScrollArea className="h-full pr-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {activeSection === 'getting-started' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
                      <p className="text-lg text-muted-foreground">
                        LovGrid is a high-performance React data grid component with features comparable to AG Grid.
                      </p>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Start</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>Import the DataGrid component and pass your data:</p>
                        <CodeBlock code={`import { DataGrid } from '@/components/DataGrid';
import { ColumnDef } from '@/components/DataGrid/types';

const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'email', headerName: 'Email', sortable: true },
  { field: 'status', headerName: 'Status' },
];

const data = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
];

function MyGrid() {
  return (
    <DataGrid
      rowData={data}
      columnDefs={columns}
      getRowId={(row) => row.id}
      rowSelection="multiple"
      height={500}
    />
  );
}`} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Core Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Virtual scrolling for 100k+ rows
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Multi-column sorting
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Advanced filtering with Excel-style UI
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Column pinning (left/right)
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Row grouping with aggregations
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Inline cell editing
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            CSV/Excel export
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Real-time data updates
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'basic-usage' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Basic Usage</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>DataGrid Props</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-4">Prop</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">rowData</td>
                                <td className="py-2 px-4 font-mono">T[]</td>
                                <td className="py-2 px-4">-</td>
                                <td className="py-2 px-4">Array of data objects</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">columnDefs</td>
                                <td className="py-2 px-4 font-mono">ColumnDef[]</td>
                                <td className="py-2 px-4">-</td>
                                <td className="py-2 px-4">Column definitions</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">getRowId</td>
                                <td className="py-2 px-4 font-mono">(data) =&gt; string</td>
                                <td className="py-2 px-4">-</td>
                                <td className="py-2 px-4">Function to get unique row ID</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">height</td>
                                <td className="py-2 px-4 font-mono">number | string</td>
                                <td className="py-2 px-4">'100%'</td>
                                <td className="py-2 px-4">Grid height</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">rowSelection</td>
                                <td className="py-2 px-4 font-mono">'single' | 'multiple'</td>
                                <td className="py-2 px-4">-</td>
                                <td className="py-2 px-4">Enable row selection</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">pagination</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4">false</td>
                                <td className="py-2 px-4">Enable pagination</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4 font-mono text-primary">rowHeight</td>
                                <td className="py-2 px-4 font-mono">number</td>
                                <td className="py-2 px-4">40</td>
                                <td className="py-2 px-4">Height of each row in pixels</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'columns' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Column Definitions</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>ColumnDef Interface</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`interface ColumnDef<T = any> {
  field: string;                    // Data field key
  headerName: string;               // Column header text
  width?: number;                   // Fixed width in pixels
  minWidth?: number;                // Minimum width
  maxWidth?: number;                // Maximum width
  flex?: number;                    // Flex grow factor
  sortable?: boolean;               // Enable sorting
  filterable?: boolean;             // Enable filtering
  resizable?: boolean;              // Enable resize
  editable?: boolean;               // Enable inline editing
  pinned?: 'left' | 'right';        // Pin column
  hide?: boolean;                   // Hide column
  
  // Custom renderers
  cellRenderer?: (params) => React.ReactNode;
  headerRenderer?: (params) => React.ReactNode;
  valueFormatter?: (value, row) => string;
  
  // Editing
  cellEditor?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  cellEditorParams?: { values?: string[] };
  
  // Aggregations
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}`} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Cell Renderer</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`const columns: ColumnDef[] = [
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: (params) => {
      const colors = {
        Active: 'bg-green-500/20 text-green-400',
        Pending: 'bg-yellow-500/20 text-yellow-400',
        Inactive: 'bg-red-500/20 text-red-400',
      };
      return (
        <span className={\`px-2 py-0.5 rounded text-xs \${colors[params.value]}\`}>
          {params.value}
        </span>
      );
    },
  },
];`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'sorting' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Sorting</h1>
                    
                    <p className="text-muted-foreground">
                      Enable sorting on columns by setting <code className="text-primary">sortable: true</code>.
                      Click column headers to cycle through ascending, descending, and no sort.
                    </p>

                    <Card>
                      <CardHeader>
                        <CardTitle>Multi-Column Sort</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`// Enable sorting on specific columns
const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'price', headerName: 'Price', sortable: true },
  { field: 'date', headerName: 'Date', sortable: true },
];

// Control sort programmatically
<DataGrid
  rowData={data}
  columnDefs={columns}
  onSortChanged={(event) => {
    console.log('Sort model:', event.sortModel);
  }}
/>`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'filtering' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Filtering</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Filter Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`const columns: ColumnDef[] = [
  { 
    field: 'name', 
    headerName: 'Name', 
    filterable: true,
    filterType: 'text'  // text, number, date, select, boolean
  },
  { 
    field: 'price', 
    headerName: 'Price', 
    filterable: true,
    filterType: 'number'
  },
  { 
    field: 'category', 
    headerName: 'Category', 
    filterable: true,
    filterType: 'select'  // Shows checkbox list
  },
];`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'selection' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Row Selection</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Selection Modes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`// Single selection
<DataGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="single"
  onRowSelected={(event) => {
    console.log('Selected:', event.rowNode.data);
  }}
/>

// Multiple selection
<DataGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="multiple"
  onSelectionChanged={(event) => {
    console.log('Selected rows:', event.selectedRows);
  }}
/>

// Access selected rows via API
const selectedRows = gridApi.getSelectedRows();`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'editing' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Inline Editing</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Cell Editors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`const columns: ColumnDef[] = [
  { 
    field: 'name', 
    headerName: 'Name', 
    editable: true,
    cellEditor: 'text'
  },
  { 
    field: 'price', 
    headerName: 'Price', 
    editable: true,
    cellEditor: 'number'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    editable: true,
    cellEditor: 'select',
    cellEditorParams: {
      values: ['Active', 'Pending', 'Inactive']
    }
  },
  { 
    field: 'isActive', 
    headerName: 'Active', 
    editable: true,
    cellEditor: 'checkbox'
  },
];

<DataGrid
  rowData={data}
  columnDefs={columns}
  onCellValueChanged={(event) => {
    console.log('Changed:', event.oldValue, '->', event.newValue);
  }}
/>`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'pinning' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Column Pinning</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Pin Columns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`const columns: ColumnDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    pinned: 'left'  // Pin to left side
  },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { 
    field: 'actions', 
    headerName: 'Actions', 
    pinned: 'right'  // Pin to right side
  },
];

// Or pin programmatically via API
gridApi.setColumnPinned('id', 'left');
gridApi.setColumnPinned('actions', 'right');
gridApi.setColumnPinned('email', null);  // Unpin`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'grouping' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Row Grouping</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Group By Fields</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`<DataGrid
  rowData={data}
  columnDefs={columns}
  groupByFields={['category', 'status']}
  groupAggregations={{
    price: 'sum',
    quantity: 'avg',
    items: 'count'
  }}
/>`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'drag-drop' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Drag & Drop</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Row Dragging</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`<DataGrid
  rowData={data}
  columnDefs={columns}
  rowDragEnabled={true}
  rowDragManaged={true}
  onRowDragEnd={(event) => {
    console.log('Moved:', event.rowNode.data);
  }}
/>`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'export' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Export</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Export to CSV/Excel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`// Export to CSV
gridApi.exportToCsv({
  fileName: 'export.csv',
  onlySelected: false,
  skipHeader: false,
});

// Copy to clipboard
await gridApi.copyToClipboard(true);  // Include headers

// For Excel export, use the Excel utility:
import { exportToExcel } from '@/components/DataGrid/utils/excelExport';

exportToExcel(rows, columns, {
  fileName: 'export.xlsx',
  sheetName: 'Data'
});`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'performance' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Performance</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Optimizing for Large Datasets</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>LovGrid is optimized for 100k+ rows out of the box:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Virtual scrolling renders only visible rows</li>
                          <li>RAF-throttled scroll handlers for 60fps</li>
                          <li>Memoized row components with smart comparison</li>
                          <li>Efficient state updates with refs</li>
                        </ul>
                        <CodeBlock code={`// Best practices for large datasets:

// 1. Use stable getRowId function
const getRowId = useCallback((row) => row.id, []);

// 2. Memoize column definitions
const columns = useMemo(() => [...], []);

// 3. Use pagination for very large datasets
<DataGrid
  rowData={largeData}
  columnDefs={columns}
  pagination={true}
  paginationPageSize={100}
/>

// 4. Consider debouncing filter changes
// The grid handles this internally`} />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'api' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Grid API</h1>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Accessing the API</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock code={`const [gridApi, setGridApi] = useState<GridApi | null>(null);

<DataGrid
  rowData={data}
  columnDefs={columns}
  onGridReady={(event) => {
    setGridApi(event.api);
  }}
/>`} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Methods</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Data Methods</h4>
                          <CodeBlock code={`gridApi.getRowData()           // Get all row data
gridApi.getDisplayedRows()      // Get visible rows
gridApi.getRowNode(id)          // Get row by ID
gridApi.forEachNode(callback)   // Iterate all rows`} />
                          
                          <h4 className="font-semibold">Selection Methods</h4>
                          <CodeBlock code={`gridApi.getSelectedRows()       // Get selected rows
gridApi.selectAll()             // Select all
gridApi.deselectAll()           // Deselect all
gridApi.selectRow(id, true)     // Select specific row`} />
                          
                          <h4 className="font-semibold">Column Methods</h4>
                          <CodeBlock code={`gridApi.setColumnVisible(field, visible)
gridApi.setColumnPinned(field, 'left' | 'right' | null)
gridApi.resizeColumn(field, width)
gridApi.moveColumn(fromIndex, toIndex)`} />
                          
                          <h4 className="font-semibold">Sort & Filter</h4>
                          <CodeBlock code={`gridApi.setSortModel([{ field: 'name', direction: 'asc' }])
gridApi.getSortModel()
gridApi.setFilterModel([...])
gridApi.getFilterModel()
gridApi.setQuickFilter('search text')`} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
}