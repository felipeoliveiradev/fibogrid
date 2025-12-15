import { CodeBlock } from '../components/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Terminal, Plus, Trash, RefreshCw, Edit } from 'lucide-react';

export const ApiManager = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Terminal className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground">
                        Manager API
                    </h1>
                </div>
                <p className="text-xl text-muted-foreground font-body leading-relaxed">
                    A fluent, builder-based API for programmatic CRUD operations. Separate your data mutation logic from view configuration.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <Plus className="h-5 w-5 text-green-500" />
                        <h3 className="font-display font-bold text-lg">Add Rows</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">Insert new records efficiently.</p>
                    <CodeBlock code={`api.manager().add([newRow]).execute();`} language="typescript" />
                </Card>

                <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <Trash className="h-5 w-5 text-red-500" />
                        <h3 className="font-display font-bold text-lg">Remove Rows</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">Delete records by ID.</p>
                    <CodeBlock code={`api.manager().remove(['row-1']).execute();`} language="typescript" />
                </Card>

                <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <RefreshCw className="h-5 w-5 text-blue-500" />
                        <h3 className="font-display font-bold text-lg">Update Rows</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">Full row updates (replacement).</p>
                    <CodeBlock code={`api.manager().update([updatedRow]).execute();`} language="typescript" />
                </Card>

                <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <Edit className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-display font-bold text-lg">Update Cell</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">Granular cell-level updates.</p>
                    <CodeBlock code={`api.manager().updateCell('row-1', 'price', 99).execute();`} language="typescript" />
                </Card>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-display font-bold">Comprehensive Example</h2>
                <p className="text-muted-foreground">
                    Mix and match operations in a single chain (though currently executed logically in order: Remove &rarr; Update &rarr; Add).
                </p>
                <CodeBlock code={`const handleBatchUpdate = () => {
    api.manager()
       .remove(['old-row-id'])
       .add([{ id: 'new-row', name: 'New Item' }])
       .updateCell('existing-row', 'status', 'active')
       .execute();
};`} language="typescript" />
            </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-display font-bold">Validation</h2>
                <p className="text-muted-foreground">
                    The manager includes built-in validation to prevent runtime errors. It checks for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Non-empty arrays for <code className="text-primary">add</code> and <code className="text-primary">update</code>.</li>
                    <li>Valid <code className="text-primary">rowIds</code> for removal.</li>
                    <li>Existence of <code className="text-primary">rowId</code> and <code className="text-primary">field</code> for cell updates.</li>
                </ul>
            </section>
        </div>
    );
};
