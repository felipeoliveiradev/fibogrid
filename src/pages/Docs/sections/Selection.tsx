import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { CodeBlock } from '../components/CodeBlock';
import { FiboGrid } from 'fibogrid';
import { CheckSquare } from 'lucide-react';

export const Selection = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Row Selection</h1>
                <p className="text-lg text-muted-foreground">
                    Allow users to select single or multiple rows for actions.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    Configuration
                </h2>
                <ApiTable items={[
                    { name: 'rowSelection', type: "'single' | 'multiple'", description: 'Selection mode.' },
                    { name: 'checkboxSelection', type: 'boolean', description: 'Show checkboxes in rows (column prop).' },
                    { name: 'headerCheckboxSelection', type: 'boolean', description: 'Show select-all checkbox in header (column prop).' },
                ]} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Example</h2>
                <ExampleBlock
                    code={`const columns = [
  { 
    field: 'name', 
    headerName: 'Name', 
    checkboxSelection: true,         // Checkbox in row
    headerCheckboxSelection: true    // Checkbox in header
  },
  { field: 'role', headerName: 'Role' }
];

<FiboGrid
  rowData={users}
  columnDefs={columns}
  rowSelection="multiple"
  onSelectionChanged={(event) => {
      console.log('Selected:', event.api.getSelectedRows());
  }}
/>`}
                    preview={
                        <div className="h-[200px]">
                            <FiboGrid
                                rowData={[
                                    { id: 1, name: 'John Doe', role: 'Admin' },
                                    { id: 2, name: 'Jane Smith', role: 'User' },
                                    { id: 3, name: 'Bob Johnson', role: 'User' },
                                ]}
                                columnDefs={[
                                    { field: 'name', headerName: 'Name', flex: 1, checkboxSelection: true, headerCheckboxSelection: true },
                                    { field: 'role', headerName: 'Role', width: 100 },
                                ]}
                                rowSelection="multiple"
                            />
                        </div>
                    }
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">API Methods</h2>
                <CodeBlock code={`// Get selected
const selected = gridApi.getSelectedRows();

// Select all
gridApi.selectAll();

// Select specific by ID
gridApi.selectRow('user-123', true);`} />
            </div>
        </div>
    );
};
