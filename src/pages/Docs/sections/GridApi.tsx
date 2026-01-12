import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { CodeBlock } from '../components/CodeBlock';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Layers, Layout, Clipboard, Command } from 'lucide-react';

export const GridApi = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Grid API Reference</h1>
                <p className="text-lg text-muted-foreground">
                    The <code className="text-primary">GridApi</code> interface provides full imperative control over the grid instance.
                </p>
                <div className="flex gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">interface GridApi&lt;T&gt;</span>
                </div>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Accessing the API</AlertTitle>
                <AlertDescription>
                    You can access the API via the <code className="text-primary">onGridReady</code> event or the <code className="text-primary">useFiboGrid</code> hook.
                </AlertDescription>
            </Alert>

            {/* Data Operations */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold text-primary flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Data Operations
                </h2>
                <ApiTable items={[
                    {
                        name: 'setRowData(data: T[])',
                        type: 'void',
                        description: 'Completely replaces the current grid data with new data. Triggers a full re-render of rows.'
                    },
                    {
                        name: 'updateRowData(transaction)',
                        type: 'void',
                        description: 'Applies a localized transaction. Transaction object: `{ add?: T[], remove?: T[], update?: T[] }`.'
                    },
                    {
                        name: 'getRowNode(id: string)',
                        type: 'RowNode<T> | null',
                        description: 'Returns the internal RowNode object for a given ID. Useful for checking node state (selected, expanded, etc.).'
                    },
                    {
                        name: 'getRowData()',
                        type: 'T[]',
                        description: 'Returns all data currently loaded in the grid (unfiltered, unsorted).'
                    },
                    {
                        name: 'forEachNode(callback)',
                        type: 'void',
                        description: 'Iterates through every node in the grid. `callback: (node: RowNode<T>) => void`.'
                    },
                    {
                        name: 'getDisplayedRows()',
                        type: 'RowNode<T>[]',
                        description: 'Returns only the rows currently visible after Filtering and Sorting are applied.'
                    },
                    {
                        name: 'getDisplayedRowAtIndex(index)',
                        type: 'RowNode<T> | null',
                        description: 'Get a specific visible row node by its visual index.'
                    },
                ]} />
            </div>

            {/* Hierarchy & Tree Data */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold text-primary flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Hierarchy & Structure
                </h2>
                <p className="text-sm text-muted-foreground">Methods for managing tree data and master-detail relationships.</p>
                <ApiTable items={[
                    {
                        name: 'addChildToRow(parentId, data)',
                        type: 'void',
                        description: 'Dynamically appends children to a specific parent row. Useful for lazy loading tree nodes.'
                    },
                    {
                        name: 'connect(sourceId)',
                        type: 'GridApi<T>',
                        description: 'Connects this grid to another "source" grid, often for listening to events or syncing state.'
                    },
                ]} />
                <CodeBlock
                    code={`// Lazy Loading Children
const onGroupExpanded = async (params) => {
   if (params.node.children.length === 0) {
       const newChildren = await fetchChildren(params.node.id);
       gridApi.addChildToRow(params.node.id, newChildren);
   }
};`}
                />
            </div>

            {/* UI Control */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold text-primary flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    UI & Rendering controls
                </h2>
                <ApiTable items={[
                    { name: 'refreshCells(params?)', type: 'void', description: 'Force re-render of cells. Useful if custom renderers depend on external state.' },
                    { name: 'redrawRows()', type: 'void', description: 'Destroys and recreates row DOM elements.' },
                    { name: 'autoSizeColumn(field)', type: 'void', description: 'Calculates specific column width based on content.' },
                    { name: 'autoSizeAllColumns()', type: 'void', description: 'Auto-sizes all columns efficiently.' },
                    { name: 'ensureRowVisible(id)', type: 'void', description: 'Scrolls vertical viewport to target row.' },
                    { name: 'ensureColumnVisible(field)', type: 'void', description: 'Scrolls horizontal viewport to target column.' },
                ]} />
            </div>

            {/* Clipboard & Undo */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold text-primary flex items-center gap-2">
                    <Clipboard className="h-5 w-5" />
                    Clipboard & History
                </h2>
                <ApiTable items={[
                    { name: 'undo()', type: 'void', description: 'Reverts the last edit operation (if history is enabled).' },
                    { name: 'copyToClipboard(headers?)', type: 'Promise<void>', description: 'Copies selected rows to system clipboard. `headers`: defaults to true.' },
                    { name: 'pasteFromClipboard()', type: 'Promise<void>', description: 'Parses clipboard (tab or comma separated). Auto-generates IDs if missing.' },
                    { name: 'exportToCsv(params?)', type: 'void', description: 'Params: `{ fileName?: string, skipHeader?: boolean, onlySelected?: boolean }`.' },
                ]} />
            </div>

            {/* Fluent Params Builder */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold text-primary flex items-center gap-2">
                    <Command className="h-5 w-5" />
                    Params Builder (Fluent API)
                </h2>
                <p className="text-muted-foreground">The <code className="text-primary">api.params()</code> builder allows you to chain configuration changes and execute them atomically.</p>

                <CodeBlock
                    code={`// Example: Reset grid state and apply a new search view
api.params()
   .resetState()            // Clear Sorts, Filters, Selection
   .setPageSize(50)         // Change pagination
   .setQuickFilter("Urgent") // Apply global search
   .setSortModel([{ field: 'date', direction: 'desc' }])
   .execute();              // Apply all at once`}
                />

                <ApiTable items={[
                    { name: 'resetState()', type: 'Builder', description: 'Clears all grid state (sort, filter, selection, etc).' },
                    { name: 'resetEdits()', type: 'Builder', description: 'Discards uncommitted cell edits.' },
                    { name: 'removeFilter(field)', type: 'Builder', description: 'Removes a specific column filter.' },
                ]} />
            </div>
        </div>
    );
};
