import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { ExampleBlock } from '../components/ExampleBlock';
import { FiboGrid } from 'fibogrid';
import { Palette } from 'lucide-react';

export const Styling = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Styling & Theming</h1>
                <p className="text-lg text-muted-foreground">
                    FiboGrid is designed to look great out of the box, but it is fully customizable via CSS Variables and Tailwind classes.
                </p>
            </div>

            {/* CSS Variables */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    CSS Variables
                </h2>
                <p className="text-muted-foreground">
                    Override these variables in your CSS to change the look of the grid globally or locally.
                </p>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="p-0">
                        <CodeBlock
                            code={`:root {
  /* Colors */
  --fibogrid-primary: #eab308;
  --fibogrid-primary-foreground: #ffffff;
  --fibogrid-border: rgba(0, 0, 0, 0.1);
  --fibogrid-row-hover: rgba(234, 179, 8, 0.05);
  --fibogrid-row-selected: rgba(234, 179, 8, 0.15);

  /* Dimensions */
  --fibogrid-header-height: 48px;
  --fibogrid-row-height: 40px;
  
  /* Typography */
  --fibogrid-font-family: inherit;
  --fibogrid-font-size: 0.875rem;
}`}
                            language="css"
                            className="border-none m-0 rounded-none bg-transparent"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Conditional Styling */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Conditional Styling</h2>
                <p className="text-muted-foreground">
                    Style rows or cells based on their data.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-2">Row Classes</h3>
                <ExampleBlock
                    code={`<FiboGrid
  getRowClass={(params) => {
      if (params.data.priority === 'High') return 'bg-red-50 dark:bg-red-900/10';
      if (params.data.status === 'Completed') return 'opacity-50 line-through';
      return '';
  }}
/>`}
                    preview={
                        <div className="h-[200px]">
                            <FiboGrid
                                rowData={[
                                    { id: 1, task: 'Critical Fix', priority: 'High', status: 'Pending' },
                                    { id: 2, task: 'Normal Feature', priority: 'Medium', status: 'Pending' },
                                    { id: 3, task: 'Old Task', priority: 'Low', status: 'Completed' },
                                ]}
                                columnDefs={[
                                    { field: 'task', headerName: 'Task', flex: 1 },
                                    { field: 'priority', headerName: 'Priority', width: 100 },
                                ]}
                                getRowId={d => d.id}
                                getRowClass={(params) => {
                                    if (params.data.priority === 'High') return 'bg-red-500/10 text-red-600 font-bold';
                                    if (params.data.status === 'Completed') return 'opacity-50 line-through';
                                    return '';
                                }}
                            />
                        </div>
                    }
                />

                <h3 className="text-lg font-medium mt-6 mb-2">Cell Class Rules</h3>
                <CodeBlock
                    code={`const columns = [
  {
    field: 'amount',
    cellClassRules: {
      // Apply 'text-green-500' if value > 0
      'text-green-500': (params) => params.value > 0,
      // Apply 'text-red-500' if value < 0
      'text-red-500': (params) => params.value < 0,
    }
  }
]`}
                />
            </div>
        </div>
    );
};
