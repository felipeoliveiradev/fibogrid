import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const Rows = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Rows & Data</h1>
                <p className="text-lg text-muted-foreground">
                    Managing data flow, IDs, and updates efficiently.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Providing Data</h2>
                <p className="text-muted-foreground">
                    The <code className="text-primary">rowData</code> prop accepts an array of objects. FiboGrid is agnostic to the shape of your data, as long as it matches your <code className="text-primary">field</code> definitions.
                </p>
                <CodeBlock code={`<FiboGrid rowData={myArray} />`} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Row IDs</h2>
                <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Critical for Performance</AlertTitle>
                    <AlertDescription>
                        You MUST provide a unique ID for each row. This allows FiboGrid to track rows across sorts, filters, and updates without re-rendering the entire DOM.
                    </AlertDescription>
                </Alert>
                <p className="mt-4 text-muted-foreground">
                    Use the <code className="text-primary">getRowId</code> callback to tell the grid how to find the ID.
                </p>
                <CodeBlock
                    code={`// If your data has an 'id' field:
getRowId={(data) => data.id}

// If your data uses '_id' (MongoDB styled):
getRowId={(data) => data._id}

// Composite ID:
getRowId={(data) => \`\${data.org}_\${data.userKey}\`}
`}
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Updating Data</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-card/50 border-primary/10">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">Immutable Updates (React style)</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Pass a new array reference to <code className="text-primary">rowData</code>. The grid will diff the changes and animate rows.
                            </p>
                            <CodeBlock code={`setRowData(prev => [
  ...prev, 
  newRow
])`} language="javascript" />
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-primary/10">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">Transaction API (Manager)</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                For high-frequency updates, use the Grid Manager API to avoid React renders.
                            </p>
                            <CodeBlock code={`gridApi.manager()
  .add([newRow])
  .update([modifiedRow])
  .remove(['id-123'])
  .execute()`} language="javascript" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
