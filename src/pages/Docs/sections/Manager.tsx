import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Workflow, Database, Settings, GitMerge } from 'lucide-react';

export const Manager = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Grid Manager API</h1>
                <p className="text-lg text-muted-foreground">
                    A transactional, fluent API for handling complex data updates, state changes, and row manipulations efficiently.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-primary" />
                    Conceptual Overview
                </h2>
                <p className="text-muted-foreground">
                    The Manager API allows you to queue multiple operations (add, update, remove, etc.) and execute them in a single batch. This prevents unnecessary re-renders and ensures atomicity.
                </p>
                <CodeBlock
                    code={`gridApi.manager()
  .add(newItems)
  .update(modifiedItems)
  .remove(deletedIds)
  .execute();`}
                />
            </div>

            {/* Core CRUD */}
            <div className="space-y-6">
                <h2 className="text-2xl font-display font-semibold">Validation & Update Methods</h2>
                <ApiTable items={[
                    {
                        name: 'add(rows: T[])',
                        type: 'ManagerBuilder',
                        description: 'Adds new rows. If IDs conflict, behavior depends on `mergeUnique` setting.'
                    },
                    {
                        name: 'upAdd(rows: T[])',
                        type: 'ManagerBuilder',
                        description: 'Upsert (Update or Add). If ID exists, updates it. If not, adds it.'
                    },
                    {
                        name: 'update(rows: T[])',
                        type: 'ManagerBuilder',
                        description: 'Updates existing rows. Rows not found are ignored.'
                    },
                    {
                        name: 'remove(ids: string[])',
                        type: 'ManagerBuilder',
                        description: 'Removes rows by their IDs.'
                    },
                    {
                        name: 'replaceAll(rows: T[], key?)',
                        type: 'ManagerBuilder',
                        description: 'Atomic Reset + Add. Clears all pending changes and replaces dataset. Pass `compareKey` for smart diffing against current IDs.'
                    },
                    {
                        name: 'reset()',
                        type: 'ManagerBuilder',
                        description: 'Internal: Marks the transaction as a "Reset" operation. Wipes all data before applying other ops in the chain.'
                    },
                ]} />
            </div>

            {/* Advanced Configuration */}
            <div className="space-y-6">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Advanced Configuration
                </h2>
                <p className="text-muted-foreground mb-4">Chain these methods <strong>before</strong> your CRUD operations to change behavior.</p>

                <ApiTable items={[
                    {
                        name: 'key(keyName: string)',
                        type: 'ManagerBuilder',
                        description: 'Override the default ID field for this transaction only.'
                    },
                    {
                        name: 'mergeUnique(enable?: boolean)',
                        type: 'ManagerBuilder',
                        description: 'If true, `add()` will merge data into existing rows instead of duplicating or erroring.'
                    },
                ]} />

                <CodeBlock
                    code={`// Custom ID Field Example
gridApi.manager()
   .key('sku_code') // Use 'sku_code' instead of 'id' for matching
   .update([{ sku_code: 'A123', price: 99 }])
   .execute();

// Merge Strategy Example
gridApi.manager()
   .mergeUnique(true)
   .add([{ id: 1, dynamicField: 'Value' }]) 
   // ^ If row 1 exists, it merges 'dynamicField' into it
   .execute();`}
                />
            </div>

            {/* Complex Operations */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <GitMerge className="h-5 w-5 text-primary" />
                    Complex Operations
                </h2>

                <h3 className="text-lg font-medium mt-4">Row Splitting</h3>
                <p className="text-sm text-muted-foreground">Useful for breaking a single task into sub-tasks or variants.</p>
                <CodeBlock
                    code={`// Logic:
// 1. Clones the target row
// 2. Generates new ID: "\${rowId}-split-\${timestamp}"
// 3. If asChild=true, adds to children array
// 4. Else, splices into array after parent
gridApi.manager()
   .split('row-123', { asChild: true })
   .execute();`}
                />

                <h3 className="text-lg font-medium mt-6">Selection Payload</h3>
                <p className="text-sm text-muted-foreground">Attach specific metadata to the selection state, useful for passing context to action bars.</p>
                <CodeBlock
                    code={`gridApi.manager()
   .setSelectionData({ 
       lastAction: 'approved', 
       approver: 'admin' 
   })
   .execute();`}
                />
            </div>
        </div>
    );
};
