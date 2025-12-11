import { FiboGrid } from 'fibogrid';
import { ExampleBlock } from '../components/ExampleBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '../components/CodeBlock';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active' },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active' },
];

const columns = [
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email' },
    { field: 'status', headerName: 'Status', width: 100 },
];

export const VisualCustomization = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Visual Customization</h1>

            <p className="text-lg text-muted-foreground font-body">
                The <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">configs</code> prop provides granular control over the visibility of UI elements in the header, center (body), and footer of the grid.
            </p>

            <ExampleBlock
                title="Custom Configuration"
                description="Hide specific buttons, enable the filter row, and customize the layout."
                code={`<FiboGrid
  rowData={data}
  columnDefs={columns}
  configs={{
    header: {
      show: true,
      search: true,
      filterRow: true,  // Show inputs below headers
      exportButton: false, // Hide specific buttons
      columnsButton: false,
    },
    center: {
      rowNumbers: true, // Show row numbers column
      stripes: true,    // Enable zebra striping
      borders: false,   // Remove outer borders
    },
    footer: {
      pagination: true,
      information: false, // Hide status bar info
    }
  }}
/>`}
                preview={
                    <FiboGrid
                        rowData={sampleData}
                        columnDefs={columns}
                        getRowId={(row) => row.id}
                        configs={{
                            header: {
                                show: true,
                                search: true,
                                filterRow: true,
                                exportButton: false,
                                columnsButton: false,
                            },
                            center: {
                                rowNumbers: true,
                                stripes: true,
                                borders: false,
                            },
                            footer: {
                                pagination: true,
                                information: false,
                            }
                        }}
                    />
                }
            />

            <Card className="paper-aged border-primary/10">
                <CardHeader>
                    <CardTitle className="font-display text-xl">Configs Interface</CardTitle>
                </CardHeader>
                <CardContent>
                    <CodeBlock code={`interface FiboGridConfigs {
  header?: {
    show?: boolean;          // Toggle entire header
    search?: boolean;        // Search input
    filterRow?: boolean;     // Per-column filter inputs
    filterButton?: boolean;  // Filter tags toggle
    densityButton?: boolean; // Density toggle
    exportButton?: boolean;  // Export button
    columnsButton?: boolean; // Columns visibility toggle
    copyButton?: boolean;    // Copy to clipboard
    refreshButton?: boolean; // Refresh data
    customActions?: React.ReactNode; // Custom components
  };
  center?: {
    rowNumbers?: boolean;      // # column
    checkboxSelection?: boolean; // Checkbox column
    stripes?: boolean;         // Zebra striping
    borders?: boolean;         // Outer borders
  };
  footer?: {
    show?: boolean;          // Toggle entire footer
    pagination?: boolean;    // Pagination controls
    information?: boolean;   // Selected/Total count
  };
}`} />
                </CardContent>
            </Card>
        </div>
    );
};
