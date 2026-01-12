import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { CodeBlock } from '../components/CodeBlock';
import { FiboGrid } from 'fibogrid';
import { Edit3 } from 'lucide-react';

export const Editing = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Editing</h1>
                <p className="text-lg text-muted-foreground">
                    Inline editing with built-in editors or your own custom components.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    How to Enable
                </h2>
                <p className="text-muted-foreground">
                    Simply set <code className="text-primary">editable: true</code> on a column definition. By default, it uses a text editor.
                </p>
                <ExampleBlock
                    code={`const columns = [
  { field: 'name', editable: true },
  { 
    field: 'role', 
    editable: true,
    cellEditor: 'select',
    cellEditorParams: {
        values: ['Admin', 'Manager', 'User']
    }
  }
];`}
                    preview={
                        <div className="h-[200px]">
                            <FiboGrid
                                rowData={[
                                    { id: 1, name: 'Double Click Me', role: 'User' },
                                    { id: 2, name: 'I am editable', role: 'Admin' },
                                ]}
                                columnDefs={[
                                    { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                    {
                                        field: 'role',
                                        headerName: 'Role',
                                        width: 150,
                                        editable: true,
                                        cellEditor: 'select',
                                        cellEditorParams: {
                                            values: ['Admin', 'Manager', 'User']
                                        }
                                    },
                                ]}
                            />
                        </div>
                    }
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Handling Changes</h2>
                <p className="text-muted-foreground">
                    Listen to the <code className="text-primary">onCellValueChanged</code> event to capture updates and persist them to your backend.
                </p>
                <CodeBlock
                    code={`<FiboGrid
  onCellValueChanged={(event) => {
      const { data, oldValue, newValue, field } = event;
      
      console.log(\`Updated row \${data.id}: \${field} changed from \${oldValue} to \${newValue}\`);
      
      // Example: Save to API
      api.updateUser(data.id, { [field]: newValue });
  }}
/>`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Editor Types</h2>
                <ApiTable items={[
                    { name: 'text', type: 'string', description: 'Standard text input (default).' },
                    { name: 'number', type: 'string', description: 'Numeric input.' },
                    { name: 'select', type: 'string', description: 'Dropdown menu. Requires `cellEditorParams.values`.' },
                    { name: 'checkbox', type: 'string', description: 'Checkbox for boolean values.' },
                    { name: 'date', type: 'string', description: 'Date picker input.' },
                ]} />
            </div>
        </div>
    );
};
