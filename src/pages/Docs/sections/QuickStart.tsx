import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock } from '../components/ExampleBlock';
import { FiboGrid } from 'fibogrid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export const QuickStart = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Quick Start</h1>
                <p className="text-lg text-muted-foreground">
                    Your first grid in 3 simple steps.
                </p>
            </div>

            <div className="space-y-8">
                {/* Step 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-mono">1</div>
                        <h2 className="text-2xl font-display font-semibold">Define Data</h2>
                    </div>
                    <p className="text-muted-foreground pl-11">
                        Create a simple array of objects.
                    </p>
                    <CodeBlock
                        code={`const rowData = [
  { id: '1', make: 'Toyota', model: 'Celica', price: 35000 },
  { id: '2', make: 'Ford', model: 'Mondeo', price: 32000 },
  { id: '3', make: 'Porsche', model: 'Boxster', price: 72000 }
];`}
                        className="ml-11"
                    />
                </div>

                {/* Step 2 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-mono">2</div>
                        <h2 className="text-2xl font-display font-semibold">Define Columns</h2>
                    </div>
                    <p className="text-muted-foreground pl-11">
                        Map fields to columns. Use <code className="text-primary">flex: 1</code> to fill available space.
                    </p>
                    <CodeBlock
                        code={`const columnDefs = [
  { field: 'make', headerName: 'Make', flex: 1 },
  { field: 'model', headerName: 'Model', flex: 1 },
  { field: 'price', headerName: 'Price', width: 120, valueFormatter: (v) => \`\$\${v}\` }
];`}
                        className="ml-11"
                    />
                </div>

                {/* Step 3 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-mono">3</div>
                        <h2 className="text-2xl font-display font-semibold">Render Grid</h2>
                    </div>
                    <p className="text-muted-foreground pl-11">
                        The component takes <code className="text-primary">rowData</code> and <code className="text-primary">columnDefs</code> as props.
                    </p>

                    <div className="pl-11">
                        <ExampleBlock
                            code={`import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles/index.css';

const MyGrid = () => {
   const rowData = [...]; // from step 1
   const columns = [...]; // from step 2

   return (
     <div style={{ height: 400, width: '100%' }}>
        <FiboGrid
            rowData={rowData}
            columnDefs={columns}
            getRowId={(row) => row.id} // Important for performance!
        />
     </div>
   );
};`}
                            preview={
                                <div className="h-[250px]">
                                    <FiboGrid
                                        rowData={[
                                            { id: '1', make: 'Toyota', model: 'Celica', price: 35000 },
                                            { id: '2', make: 'Ford', model: 'Mondeo', price: 32000 },
                                            { id: '3', make: 'Porsche', model: 'Boxster', price: 72000 }
                                        ]}
                                        columnDefs={[
                                            { field: 'make', headerName: 'Make', flex: 1 },
                                            { field: 'model', headerName: 'Model', flex: 1 },
                                            { field: 'price', headerName: 'Price', width: 120, valueFormatter: (v: any) => `$${v?.toLocaleString()}` }
                                        ]}
                                    />
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Next Steps</AlertTitle>
                <AlertDescription>
                    Now that you have the basics, learn how to configure <button onClick={() => { }} className="text-primary underline">Columns</button> or add <button className="text-primary underline">Pagination</button>.
                </AlertDescription>
            </Alert>
        </div>
    );
};
