import { FiboGrid, ColumnDef } from 'fibogrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Eye, Download, Trash2, TrendingDown } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock } from '../components/ExampleBlock';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active', price: 1500, category: 'Art' },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active', price: 2200, category: 'Sculpture' },
    { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending', price: 1800, category: 'Art' },
];

const basicColumns: ColumnDef<any>[] = [
    { field: 'name', headerName: 'Name', sortable: true, width: 140 },
    { field: 'email', headerName: 'Email', sortable: true, width: 180 },
    { field: 'status', headerName: 'Status', width: 100 },
];

const sortableColumns: ColumnDef<any>[] = [
    { field: 'name', headerName: 'Name', sortable: true, width: 140 },
    { field: 'price', headerName: 'Price', sortable: true, width: 100 },
    { field: 'category', headerName: 'Category', sortable: true, width: 120 },
];

const editableColumns: ColumnDef<any>[] = [
    { field: 'name', headerName: 'Name', editable: true, cellEditor: 'text', width: 140 },
    { field: 'price', headerName: 'Price', editable: true, cellEditor: 'number', width: 100 },
    { field: 'status', headerName: 'Status', editable: true, cellEditor: 'select', cellEditorParams: { values: ['Active', 'Pending', 'Inactive'] }, width: 120 },
];

export const Features = ({ activeSection }: { activeSection: string }) => {
    return (
        <>
            {activeSection === 'sorting' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Sorting</h1>

                    <p className="text-lg text-muted-foreground font-body">
                        Enable sorting on columns by setting <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">sortable: true</code>.
                        Click column headers to cycle through ascending, descending, and no sort.
                    </p>

                    <ExampleBlock
                        title="Multi-Column Sort"
                        description="Click column headers to sort. Hold Shift and click to add secondary sorts."
                        code={`const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'price', headerName: 'Price', sortable: true },
  { field: 'category', headerName: 'Category', sortable: true },
];

<FiboGrid
  rowData={data}
  columnDefs={columns}
  onSortChanged={(event) => {
    console.log('Sort model:', event.sortModel);
  }}
/>`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={sortableColumns}
                                getRowId={(row) => row.id}
                            />
                        }
                    />
                </div>
            )}

            {activeSection === 'selection' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Row Selection</h1>

                    <ExampleBlock
                        title="Selection Modes"
                        description="Click rows to select them. Use 'single' for one row at a time, or 'multiple' for multi-select with checkboxes."
                        code={`// Single selection
<FiboGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="single"
  onRowSelected={(event) => {
    console.log('Selected:', event.rowNode.data);
  }}
/>

// Multiple selection
<FiboGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="multiple"
  onSelectionChanged={(event) => {
    console.log('Selected rows:', event.selectedRows);
  }}
/>

// Access selected rows via API
const selectedRows = gridApi.getSelectedRows();`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={basicColumns}
                                getRowId={(row) => row.id}
                                rowSelection="multiple"
                            />
                        }
                    />
                </div>
            )}

            {activeSection === 'editing' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Inline Editing</h1>

                    <ExampleBlock
                        title="Cell Editors"
                        description="Double-click any cell to edit. FiboGrid supports text, number, select, and checkbox editors."
                        code={`const columns: ColumnDef[] = [
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
];

<FiboGrid
  rowData={data}
  columnDefs={columns}
  onCellValueChanged={(event) => {
    console.log('Changed:', event.oldValue, '->', event.newValue);
  }}
/>`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={editableColumns}
                                getRowId={(row) => row.id}
                            />
                        }
                    />
                </div>
            )}

            {activeSection === 'drag-drop' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Drag & Drop</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Row Dragging</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock code={`<FiboGrid
  rowData={data}
  columnDefs={columns}
  rowDragEnabled={true}
  rowDragManaged={true}
  onRowDragEnd={(event) => {
    console.log('Moved:', event.rowNode.data);
    console.log('To index:', event.overIndex);
  }}
/>`} />
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Column Reordering</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock code={`// Enable column drag in column definitions
const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', draggable: true },
  { field: 'email', headerName: 'Email', draggable: true },
];

<FiboGrid
  columnDefs={columns}
  onColumnMoved={(event) => {
    console.log('Column moved:', event.column.field);
  }}
/>`} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'export' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Export</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Export to CSV/Excel</CardTitle>
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
import { exportToExcel } from 'fibogrid/utils/excelExport';

exportToExcel(rows, columns, {
  fileName: 'export.xlsx',
  sheetName: 'Data'
});`} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'context-menu' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Context Menu</h1>

                    <p className="text-lg text-muted-foreground font-body">
                        FiboGrid comes with a built-in context menu that can be fully customized. Right-click on any cell to open.
                        It supports multi-level menus, icons, and dynamic actions based on the row context.
                    </p>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Selection Behavior</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 font-body">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Standard Click:</strong> Selects the row and opens menu. If multiple rows were selected, keeps selection.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Multi-Select Mode:</strong> Right-click acts as a toggle (adds/removes row) without clearing other selections. No modifier keys needed.</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <ExampleBlock
                        title="Custom Context Menu"
                        description="Use the getContextMenuItems prop to define your menu items. You receive data about the clicked cell/row and all selected rows."
                        code={`<FiboGrid
  rowData={data}
  columnDefs={columns}
  rowSelection="multiple"
  getContextMenuItems={(params) => {
    // params contains:
    // - value: clicked cell value
    // - data: clicked row data
    // - column: clicked column def
    // - selectedRows: array of all selected row data
    // - api: grid API

    return [
      {
        name: 'View Details',
        action: () => console.log('View', params.data),
        icon: <Eye className="h-4 w-4" />
      },
      {
        name: 'Sell Stock',
        action: () => console.log('Selling', params.data),
        // Dynamic disabled logic
        disabled: params.data.price < 50,
        icon: <TrendingDown className="h-4 w-4" />
      },
      { separator: true },
      {
        name: \`Export \${params.selectedRows.length} Items\`,
        action: () => exportData(params.selectedRows),
        disabled: params.selectedRows.length === 0,
        icon: <Download className="h-4 w-4" />
      },
      {
        name: 'Delete',
        action: () => deleteRows(params.selectedRows),
        icon: <Trash2 className="h-4 w-4" />,
        cssClasses: ['text-red-500']
      }
    ];
  }}
/>`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={basicColumns}
                                getRowId={(row) => row.id}
                                rowSelection="multiple"
                                getContextMenuItems={(params) => [
                                    {
                                        name: 'View Details',
                                        action: () => alert(`Viewing details for ${params.data.name}`),
                                        icon: <Eye className="h-4 w-4" />
                                    },
                                    {
                                        name: 'Sell Stock',
                                        // @ts-ignore
                                        disabled: params.data.price < 1500, // Example logic
                                        action: () => alert('Selling stock!'),
                                        // @ts-ignore
                                        icon: <div className="h-4 w-4 bg-red-500 rounded-full" />
                                    },
                                    {
                                        separator: true,
                                        name: '',
                                        action: function (): void {
                                            throw new Error('Function not implemented.');
                                        }
                                    },
                                    {
                                        name: `Export ${params?.selectedRows?.length || 0} Items`,
                                        action: () => alert(`Exporting ${params.selectedRows?.length} items:\n${params.selectedRows?.map((r: any) => r.name).join(', ')}`),
                                        disabled: !params.selectedRows || params.selectedRows.length === 0,
                                        icon: <Download className="h-4 w-4" />
                                    }
                                ]}
                            />
                        }
                    />
                </div>
            )}
        </>
    );
};
