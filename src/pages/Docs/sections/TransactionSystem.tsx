import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { GitBranch, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const TransactionSystem = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Transaction System</h1>
                <p className="text-lg text-muted-foreground">
                    Understanding FiboGrid's internal transaction batching and execution engine.
                </p>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Advanced Topic</AlertTitle>
                <AlertDescription>
                    This section covers internal implementation details. Most users don't need to understand this to use FiboGrid effectively.
                </AlertDescription>
            </Alert>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Update State Structure
                </h2>
                <p className="text-muted-foreground">
                    When you call methods on <code>api.params()</code> or <code>api.manager()</code>, they don't execute immediately. Instead, they queue operations in an internal state object:
                </p>
                <CodeBlock
                    code={`interface GridApiUpdateState {
  // Filter operations
  filterUpdates: ((current: FilterModel[]) => FilterModel[])[];
  pendingQuickFilter: string | null;
  
  // Sort operations
  sortUpdates: ((current: SortModel[]) => SortModel[])[];
  
  // Pagination
  pendingPage: number | null;
  pendingPageSize: number | null;
  
  // Selection
  pendingSelection: { ids: string[], selected: boolean, mode: ... } | null;
  
  // Reset flags
  pendingReset: boolean;
  pendingResetEdits: boolean;
  pendingResetCells: { rowId: string, field: string }[];
  pendingResetRows: string[];
  
  // Data mutations
  pendingUpAdds: any[];
  pendingReplaceAll: any[];
  pendingUpdates: Map<string, any>;
  pendingRemoves: Set<string>;
  pendingAdds: any[];
}`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Execution Pipeline
                </h2>
                <p className="text-muted-foreground">
                    When <code>.execute()</code> is called, the <code>gridApiExecutor</code> processes all pending operations in this exact order:
                </p>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">1. State Resets</h3>
                            <CodeBlock
                                code={`if (state.pendingReset) {
    sortFilter.setFilterModel([]);
    sortFilter.setSortModel([]);
    sortFilter.setQuickFilter('');
    pagination.setPaginationState(prev => ({ ...prev, currentPage: 0 }));
    selection.setSelection(prev => ({ ...prev, selectedRows: new Set() }));
    rows.setOverrides({});
}`}
                                className="text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">2. Filter Updates (Functional)</h3>
                            <CodeBlock
                                code={`state.filterUpdates.forEach(update => {
    next = update(next); // Each update is a function
});`}
                                className="text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">3. Data Mutations (Order Matters)</h3>
                            <CodeBlock
                                code={`// Order: replaceAll > upAdds > updates > removes > adds
if (state.pendingReplaceAll.length > 0) {
    next = [...state.pendingReplaceAll];
} else if (state.pendingReset) {
    next = [];
} else {
    next = [...prev];
}

// upAdds are split into updates (if exists) or adds (if new)
state.pendingUpAdds.forEach(upRow => {
    const exists = next.some(r => r.id === upRow.id);
    if (exists) state.pendingUpdates.set(upRow.id, upRow);
    else state.pendingAdds.push(upRow);
});

// Apply updates (deep merge)
next = next.map(row => 
    state.pendingUpdates.has(row.id) 
        ? deepMerge(row, state.pendingUpdates.get(row.id))
        : row
);

// Remove
next = next.filter(row => !state.pendingRemoves.has(row.id));

// Add
next = [...next, ...state.pendingAdds];`}
                                className="text-xs"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Key Insights</h2>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Filter updates are functional:</strong> Each filter operation is stored as a function that transforms the previous state.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>upAdd is smart:</strong> It automatically detects if a row exists and converts to update or add accordingly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Deep merge for updates:</strong> Updates don't replace the entire row, they merge properties using <code>deepMerge</code>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span><strong>Single React render:</strong> All state setters are called, but React batches them into one render cycle.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
