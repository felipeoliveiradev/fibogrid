import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock } from '../components/ExampleBlock';
import { Card, CardContent } from '@/components/ui/card';
import { MousePointerClick, Keyboard } from 'lucide-react';

export const AdvancedSelection = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Advanced Selection</h1>
                <p className="text-lg text-muted-foreground">
                    Power-user selection features including keyboard modifiers and range selection.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-primary" />
                    Shift-Click Range Selection
                </h2>
                <p className="text-muted-foreground">
                    When <code className="text-primary">rowSelection="multiple"</code>, users can hold <kbd>Shift</kbd> and click to select a range of rows.
                </p>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">How it works:</h3>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                <li>Click a row to set the "anchor"</li>
                                <li>Hold <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd> and click another row</li>
                                <li>All rows between anchor and target are selected</li>
                            </ol>
                        </div>
                        <CodeBlock
                            code={`// Internal implementation (useGridSelection.ts)
if (shift && prev.anchorIndex !== null) {
    const start = Math.min(prev.anchorIndex, rowIndex);
    const end = Math.max(prev.anchorIndex, rowIndex);
    for (let i = start; i <= end; i++) {
        newSelected.add(displayedRows[i].id);
    }
}`}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-primary" />
                    Ctrl/Cmd-Click Toggle
                </h2>
                <p className="text-muted-foreground">
                    In multiple selection mode, clicking a row toggles its selection state without affecting others.
                </p>
                <CodeBlock
                    code={`// User clicks row without modifiers
selectRow(rowId, true);  // Adds to selection

// User clicks selected row again
selectRow(rowId, false); // Removes from selection`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Programmatic Range Selection</h2>
                <p className="text-muted-foreground">
                    You can also trigger range selection programmatically using the API.
                </p>
                <CodeBlock
                    code={`// Select rows 5 through 10
const rowIds = displayedRows
    .slice(5, 11)
    .map(row => row.id);
    
gridApi.selectRows(rowIds, true);`}
                />
            </div>
        </div>
    );
};
