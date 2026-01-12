import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Command, Layers, Zap } from 'lucide-react';

export const ParamsBuilder = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Params Builder Pattern</h1>
                <p className="text-lg text-muted-foreground">
                    The fluent API for batching multiple grid operations into a single atomic transaction.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Command className="h-5 w-5 text-primary" />
                    Why Use Params Builder?
                </h2>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-muted-foreground">
                            Instead of calling multiple API methods that each trigger a re-render:
                        </p>
                        <CodeBlock
                            code={`// ❌ BAD: 4 separate re-renders
gridApi.setFilterModel([...]);
gridApi.setSortModel([...]);
gridApi.setPage(0);
gridApi.selectAll();`}
                        />
                        <p className="text-muted-foreground">
                            Use the params builder to batch them into one:
                        </p>
                        <CodeBlock
                            code={`// ✅ GOOD: 1 atomic re-render
gridApi.params()
   .setFilterModel([...])
   .setSortModel([...])
   .setPage(0)
   .selectAll()
   .execute();`}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Execution Order
                </h2>
                <p className="text-muted-foreground">
                    Operations are executed in a specific order regardless of how you chain them:
                </p>
                <Card className="bg-muted/30 p-4 border-2 border-dashed border-primary/20">
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li><strong>Reset State</strong> (if <code>resetState()</code> was called)</li>
                        <li><strong>Reset Edits</strong> (clears cell overrides)</li>
                        <li><strong>Reset Cells/Rows</strong> (specific resets)</li>
                        <li><strong>Filters</strong> (applied in order)</li>
                        <li><strong>Quick Filter</strong></li>
                        <li><strong>Sorting</strong></li>
                        <li><strong>Pagination</strong></li>
                        <li><strong>Selection</strong></li>
                        <li><strong>Data Updates</strong> (replaceAll, updates, removes, adds)</li>
                    </ol>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Available Methods</h2>
                <ApiTable items={[
                    { name: 'setFilterModel(model, options?)', type: 'Builder', description: 'Set filters. Use `{behavior: "merge"}` to merge with existing.' },
                    { name: 'removeFilter(field)', type: 'Builder', description: 'Remove a specific column filter.' },
                    { name: 'removeAllFilter()', type: 'Builder', description: 'Clear all filters.' },
                    { name: 'setQuickFilter(text)', type: 'Builder', description: 'Set global search text.' },
                    { name: 'removeQuickFilter()', type: 'Builder', description: 'Clear global search.' },
                    { name: 'setSortModel(model)', type: 'Builder', description: 'Set sort configuration.' },
                    { name: 'removeSort(field)', type: 'Builder', description: 'Remove sort from a column.' },
                    { name: 'removeAllSort()', type: 'Builder', description: 'Clear all sorting.' },
                    { name: 'setPage(page)', type: 'Builder', description: 'Jump to specific page.' },
                    { name: 'setPageSize(size)', type: 'Builder', description: 'Change page size.' },
                    { name: 'selectRow(id, selected?)', type: 'Builder', description: 'Select/deselect a row.' },
                    { name: 'selectRows(ids, selected?)', type: 'Builder', description: 'Batch select/deselect.' },
                    { name: 'selectAll()', type: 'Builder', description: 'Select all displayed rows.' },
                    { name: 'deselectAll()', type: 'Builder', description: 'Clear selection.' },
                    { name: 'resetState()', type: 'Builder', description: 'Reset filters, sort, selection, pagination.' },
                    { name: 'resetEdits()', type: 'Builder', description: 'Discard uncommitted cell edits.' },
                    { name: 'execute()', type: 'void', description: 'Apply all queued operations atomically.' },
                ]} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Advanced: Nested Manager
                </h2>
                <p className="text-muted-foreground">
                    You can even nest a manager transaction inside a params builder:
                </p>
                <CodeBlock
                    code={`gridApi.params()
   .resetState()
   .gridManager((manager) => 
       manager
          .remove(['id-1', 'id-2'])
          .add([newRow1, newRow2])
   )
   .setPage(0)
   .execute();`}
                />
            </div>
        </div>
    );
};
