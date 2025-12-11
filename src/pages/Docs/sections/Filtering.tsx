import { FiboGrid } from 'fibogrid';
import { ExampleBlock } from '../components/ExampleBlock';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active', price: 1500 },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active', price: 2200 },
    { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending', price: 1800 },
];

const filterColumns = [
    { field: 'name', headerName: 'Name', filterable: true, filterType: 'text', width: 140 },
    { field: 'price', headerName: 'Price', filterable: true, filterType: 'number', width: 100 },
    { field: 'status', headerName: 'Status', filterable: true, filterType: 'select', width: 120 },
];

export const Filtering = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Filtering</h1>

            <ExampleBlock
                title="Filter Types"
                description="Hover over column headers and click the filter icon to open the filter menu. FiboGrid supports text, number, date, and select filters."
                code={`const columns: ColumnDef[] = [
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
    field: 'status', 
    headerName: 'Status', 
    filterable: true,
    filterType: 'select'  // Shows checkbox list of all unique values
  },
];`}
                preview={
                    <FiboGrid
                        rowData={sampleData}
                        columnDefs={filterColumns as any}
                        getRowId={(row) => row.id}
                        configs={{
                            header: { filterRow: true }
                        }}
                    />
                }
            />

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Filter Row</h2>
                <p className="text-muted-foreground font-body">
                    By default, FiboGrid displays a filter row directly below the column headers for quick filtering.
                    You can disable this globally via <code className="font-mono bg-primary/10 px-1 rounded">configs.header.filterRow</code> or per-column by setting <code className="font-mono bg-primary/10 px-1 rounded">filterable: false</code>.
                </p>
            </div>
        </div>
    );
};
