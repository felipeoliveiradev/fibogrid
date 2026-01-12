import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock } from '../components/ExampleBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Zap } from 'lucide-react';

export const EditingAdvanced = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Advanced Editing</h1>
                <p className="text-lg text-muted-foreground">
                    Custom edit behaviors, action interceptors, and conditional editability.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Edit Action Interceptor
                </h2>
                <p className="text-muted-foreground">
                    Use <code className="text-primary">editAction</code> to intercept edit attempts and trigger custom behavior instead of inline editing.
                </p>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6 space-y-4">
                        <CodeBlock
                            code={`{
  field: 'document',
  editable: true,
  editAction: (params) => {
    // Instead of inline edit, open a modal
    openDocumentModal({
      rowId: params.rowNode.id,
      currentValue: params.value,
      onSave: (newValue) => {
        params.update(newValue);
      }
    });
  }
}`}
                        />
                        <p className="text-sm text-muted-foreground">
                            When <code>editAction</code> is defined, double-click and Enter key will call your function instead of entering edit mode.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-primary" />
                    Conditional Editability
                </h2>
                <p className="text-muted-foreground">
                    Make cells editable based on row data or user permissions.
                </p>
                <CodeBlock
                    code={`{
  field: 'price',
  editable: (params) => {
    // Only allow editing if status is 'draft'
    return params.data.status === 'draft';
  }
}`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Edit Lifecycle</h2>
                <p className="text-muted-foreground">
                    The editing system provides <code>update</code> and <code>stopEditing</code> callbacks for full control.
                </p>
                <CodeBlock
                    code={`// Available in cellEditorRenderer and editAction
interface CellEditorParams {
  value: any;
  data: T;
  rowNode: RowNode<T>;
  
  // Control functions
  update: (newValue: any) => void;      // Apply change
  stopEditing: (cancel?: boolean) => void; // Exit edit mode
}`}
                />
            </div>
        </div>
    );
};
