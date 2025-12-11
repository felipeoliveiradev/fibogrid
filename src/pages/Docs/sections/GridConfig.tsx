import { FiboGrid, ColumnDef } from 'fibogrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock } from '../components/ExampleBlock';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active', category: 'Art' },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active', category: 'Sculpture' },
    { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending', category: 'Art' },
];

const statusColumns: ColumnDef<any>[] = [
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email', width: 180 },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: ({ value }: { value: string }) => {
            const colors: Record<string, string> = {
                Active: 'bg-green-600/20 text-green-700 dark:text-green-400',
                Pending: 'bg-amber-600/20 text-amber-700 dark:text-amber-400',
                Inactive: 'bg-red-600/20 text-red-700 dark:text-red-400',
            };
            return (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[value] || ''}`}>
                    {value}
                </span>
            );
        }
    },
];

const pinnedColumns: ColumnDef<any>[] = [
    { field: 'id', headerName: 'ID', pinned: 'left', width: 60 },
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'status', headerName: 'Status', pinned: 'right', width: 100 },
];

export const GridConfig = ({ activeSection }: { activeSection: string }) => {
    return (
        <>
            {activeSection === 'columns' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Column Definitions</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">ColumnDef Interface</CardTitle>
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
  pinnedPriority?: number;          // Sort order for pinned columns
  hide?: boolean;                   // Hide column
  type?: 'data' | 'action' | 'checkbox' | 'rowNumber'; // Special types
  
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

                    <ExampleBlock
                        title="Custom Cell Renderer"
                        description="Use cellRenderer to create custom cell content with status badges, icons, or any React component."
                        code={`const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'email', headerName: 'Email' },
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: ({ value }) => {
      const colors = {
        Active: 'bg-green-600/20 text-green-700',
        Pending: 'bg-amber-600/20 text-amber-700',
        Inactive: 'bg-red-600/20 text-red-700',
      };
      return (
        <span className={\`px-2 py-0.5 rounded text-xs \${colors[value]}\`}>
          {value}
        </span>
      );
    },
  },
];`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={statusColumns}
                                getRowId={(row) => row.id}
                            />
                        }
                    />
                </div>
            )}

            {activeSection === 'pinning' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Column Pinning</h1>

                    <ExampleBlock
                        title="Pin Columns"
                        description="Pinned columns stay fixed while scrolling horizontally. ID is pinned left, Status is pinned right."
                        code={`const columns: ColumnDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    pinned: 'left'  // Pin to left side
  },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { 
    field: 'status', 
    headerName: 'Status', 
    pinned: 'right'  // Pin to right side
  },
];

// Or pin programmatically via API
gridApi.setColumnPinned('id', 'left');
gridApi.setColumnPinned('actions', 'right');
gridApi.setColumnPinned('id', 'left');
gridApi.setColumnPinned('actions', 'right');
gridApi.setColumnPinned('email', null);  // Unpin

// Use pinnedPriority to control order (lower number = higher priority/closer to edge)
// columns = [
//   { field: 'a', pinned: 'left', pinnedPriority: 1 }, // Leftmost
//   { field: 'b', pinned: 'left', pinnedPriority: 2 }  // After 'a'
// ];`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={pinnedColumns}
                                getRowId={(row) => row.id}
                            />
                        }
                    />

                    <ExampleBlock
                        title="Custom Layout Columns"
                        description="You can define Row Numbers and Checkboxes as regular columns to control their position and styling using 'field: number' or 'field: checkbox' (or type). You can also use 'pinnedPriority' to ensure specific pinned columns are always closest to the content."
                        code={`const columns: ColumnDef[] = [
  // 1. Custom Row Number Column (Pinned Left, Priority 1 = Leftmost)
  { 
    field: 'number', 
    headerName: '#', 
    pinned: 'left',
    pinnedPriority: 1, 
    width: 60 
  },
  // 2. Custom Checkbox Column (Pinned Left, Priority 2 = After Row Number)
  { 
    field: 'checkbox', 
    headerName: '', 
    pinned: 'left',
    pinnedPriority: 2,
    width: 50 
  },
  // 3. Regular Data Columns
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
];
// Note: When using custom columns, the built-in side bars (configs.center.rowNumbers) are automatically disabled.`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={[
                                    { field: 'number', headerName: '#', pinned: 'left', pinnedPriority: 1, width: 60 },
                                    { field: 'checkbox', headerName: '', pinned: 'left', pinnedPriority: 2, width: 50 },
                                    { field: 'name', headerName: 'Name', width: 140 },
                                    { field: 'email', headerName: 'Email' },
                                    { field: 'status', headerName: 'Status', width: 100 },
                                ]}
                                getRowId={(row) => row.id}
                                rowSelection="multiple"
                            />
                        }
                    />
                </div>
            )}

            {activeSection === 'grouping' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Row Grouping</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Group By Fields</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-muted-foreground">
                                Group rows by one or more fields with optional aggregations.
                            </p>
                            <CodeBlock code={`<FiboGrid
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

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Hierarchical Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-muted-foreground">
                                Support for tree data with expandable parent-child relationships.
                            </p>
                            <CodeBlock code={`<FiboGrid
  rowData={data}
  columnDefs={columns}
  treeData={true}
  childRowsField="children"
  // or use a function
  getChildRows={(parent) => fetchChildren(parent.id)}
/>`} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'layout' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Custom Layouts</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Flexible Header & Footer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-muted-foreground">
                                Customize the arrangement of toolbar items and footer elements using the `configs` prop.
                                define arrays of keys to reorder components or add spacers.
                            </p>
                            <CodeBlock code={`<FiboGrid
  // ...
  configs={{
    header: {
      // Reorder toolbar: Search first, spacer pushes actions to right
      layout: ['search', 'spacer', 'actions', 'export-button']
    },
    footer: {
      // Single line footer: Status info on left, Pagination on right
      layout: ['status-info', 'spacer', 'pagination-controls']
    }
  }}
/>`} />
                        </CardContent>
                    </Card>

                    <ExampleBlock
                        title="Granular Footer Layout"
                        description="Merge the Status Bar and Pagination into a single line or create complex layouts using granular keys like 'pagination-page-size', 'status-selected', etc."
                        code={`const customFooterLayout = [
  'status-info', 
  'status-selected', 
  'spacer', 
  'pagination-page-size', 
  'pagination-controls'
];

// ... inside FiboGrid props
configs={{
  footer: {
    layout: customFooterLayout
  }
}}`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={statusColumns}
                                pagination={true}
                                paginationPageSize={5}
                                configs={{
                                    footer: {
                                        layout: ['status-info', 'spacer', 'pagination-controls']
                                    }
                                }}
                            />
                        }
                    />
                </div>
            )}
        </>
    );
};
