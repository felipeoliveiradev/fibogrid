import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Columns3, Pin } from 'lucide-react';

export const ColumnManagement = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Column Management</h1>
                <p className="text-lg text-muted-foreground">
                    Advanced column features: pinning priorities, dynamic visibility, and reordering.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Pin className="h-5 w-5 text-primary" />
                    Pinning with Priority
                </h2>
                <p className="text-muted-foreground">
                    When multiple columns are pinned to the same side, use <code className="text-primary">pinnedPriority</code> to control their order.
                </p>
                <CodeBlock
                    code={`const columns = [
  { 
    field: 'actions', 
    pinned: 'left', 
    pinnedPriority: 1  // Appears first
  },
  { 
    field: 'checkbox', 
    pinned: 'left', 
    pinnedPriority: 2  // Appears second
  },
  { 
    field: 'export', 
    pinned: 'right', 
    pinnedPriority: 1  // Rightmost
  }
];`}
                />
                <Card className="bg-muted/30 p-4 border-2 border-dashed border-primary/20">
                    <p className="text-sm text-muted-foreground">
                        <strong>Rendering Order:</strong> [actions] [checkbox] ...center columns... [export]
                    </p>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Columns3 className="h-5 w-5 text-primary" />
                    Dynamic Column Visibility
                </h2>
                <ApiTable items={[
                    {
                        name: 'setColumnVisible(field, visible)',
                        type: 'void',
                        description: 'Show or hide a column at runtime. Updates internal `hiddenColumns` Set.'
                    },
                    {
                        name: 'moveColumn(fromIndex, toIndex)',
                        type: 'void',
                        description: 'Reorder columns programmatically. Updates `columnOrder` array.'
                    },
                    {
                        name: 'resizeColumn(field, width)',
                        type: 'void',
                        description: 'Set a specific column width in pixels.'
                    },
                ]} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Column State Management</h2>
                <p className="text-muted-foreground">
                    The grid maintains several internal state maps for column configuration:
                </p>
                <CodeBlock
                    code={`// Internal state (useGridColumns.ts)
const [columnOrder, setColumnOrder] = useState<string[]>([]);
const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left'|'right'|null>>({});`}
                />
            </div>
        </div>
    );
};
