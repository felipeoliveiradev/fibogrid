import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle2, XCircle } from 'lucide-react';

export const Performance = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Performance</h1>
                <p className="text-lg text-muted-foreground">
                    FiboGrid is fast by default, but these tips ensure it stays fast at scale.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/50 border-green-500/20">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="h-5 w-5" />
                            Do This
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>• Use a stable reference for <code>columnDefs</code> (useMemo).</li>
                            <li>• Provide a fast <code>getRowId</code> function.</li>
                            <li>• Use <code>pagination</code> for datasets {'>'} 10k rows.</li>
                            <li>• Use production build of React.</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-red-500/20">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            Avoid This
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>• Re-creating <code>columnDefs</code> array on every render.</li>
                            <li>• Using complex inline functions in <code>cellRenderer</code>.</li>
                            <li>• Deeply nested objects in row data without flat keys.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Memoization Example
                </h2>
                <p className="text-muted-foreground">
                    This is the #1 performance fix for React grids.
                </p>
                <CodeBlock
                    code={`// BAD ❌
// This array is recreated on every render, causing the grid to re-initialize
<FiboGrid
    columnDefs={[ { field: 'id' }, { field: 'name' } ]} 
    ... 
/>

// GOOD ✅
const columns = useMemo(() => [
    { field: 'id' }, 
    { field: 'name' }
], []);

<FiboGrid 
    columnDefs={columns} 
    ... 
/>`}
                />
            </div>
        </div>
    );
};
