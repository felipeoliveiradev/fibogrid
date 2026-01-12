import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { CodeBlock } from '../components/CodeBlock';
import { FiboGrid } from 'fibogrid';
import { ArrowUpDown } from 'lucide-react';

export const Sorting = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Sorting</h1>
                <p className="text-lg text-muted-foreground">
                    Sort by one or multiple columns with automatic direction toggling.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-primary" />
                    Basic Usage
                </h2>
                <p className="text-muted-foreground">
                    Set <code className="text-primary">sortable: true</code> on any column definition.
                </p>
                <ExampleBlock
                    code={`const columns = [
  { field: 'name', sortable: true },
  { field: 'score', sortable: true },
];`}
                    preview={
                        <div className="h-[200px]">
                            <FiboGrid
                                rowData={[
                                    { id: 1, name: 'Alice', score: 95 },
                                    { id: 2, name: 'Bob', score: 82 },
                                    { id: 3, name: 'Charlie', score: 88 },
                                ]}
                                columnDefs={[
                                    { field: 'name', headerName: 'Name', flex: 1, sortable: true },
                                    { field: 'score', headerName: 'Score', width: 100, sortable: true },
                                ]}
                            />
                        </div>
                    }
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Multi-Column Sorting</h2>
                <p className="text-muted-foreground">
                    Hold <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-xs">Shift</kbd> while clicking headers to sort by multiple columns.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Initial Sort State</h2>
                <p className="text-muted-foreground">
                    Control the sorting state programmatically or initially via the API.
                </p>
                <CodeBlock code={`<FiboGrid
  onGridReady={(params) => {
      params.api.setSortModel([
          { field: 'score', direction: 'desc' }, // Primary Sort
          { field: 'name', direction: 'asc' }    // Secondary Sort
      ]);
  }}
/>`} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Custom Comparator</h2>
                <CodeBlock code={`{
  field: 'date',
  sortable: true,
  comparator: (valueA, valueB) => {
      const dateA = new Date(valueA).getTime();
      const dateB = new Date(valueB).getTime();
      return dateA - dateB;
  }
}`} />
            </div>
        </div>
    );
};
