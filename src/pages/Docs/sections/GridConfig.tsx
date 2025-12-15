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
  field: string;                    
  headerName: string;               
  width?: number;                   
  minWidth?: number;                
  maxWidth?: number;                
  flex?: number;                    
  sortable?: boolean;               
  filterable?: boolean;             
  resizable?: boolean;              
  editable?: boolean;               
  pinned?: 'left' | 'right';        
  pinnedPriority?: number;          
  hide?: boolean;                   
  type?: 'data' | 'action' | 'checkbox' | 'rowNumber'; 
  
  
  cellRenderer?: (params) => React.ReactNode;
  headerRenderer?: (params) => React.ReactNode;
  valueFormatter?: (value, row) => string;
  
  
  cellEditor?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  cellEditorParams?: { values?: string[] };
  
  
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
    pinned: 'left'  
  },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { 
    field: 'status', 
    headerName: 'Status', 
    pinned: 'right'  
  },
];

// Programmatic control
gridApi.setColumnPinned('id', 'left');
gridApi.setColumnPinned('actions', 'right');
gridApi.setColumnPinned('email', null);`}
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
                        code={`const columns:ColumnDef[] = [

                    {
                        field: 'number',
                    headerName: '#',
                    pinned: 'left',
                    pinnedPriority: 1,
                    width: 60 
  },

                    {
                        field: 'checkbox',
                    headerName: '',
                    pinned: 'left',
                    pinnedPriority: 2,
                    width: 50 
  },

                    {field: 'name', headerName: 'Name', width: 200 },
                    {field: 'email', headerName: 'Email', width: 250 },
];`}
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
  
  configs={{
    header: {
      
      layout: ['search', 'spacer', 'actions', 'export-button']
    },
    footer: {
      
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
