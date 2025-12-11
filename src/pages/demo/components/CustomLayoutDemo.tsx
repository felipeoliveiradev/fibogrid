import { FiboGrid } from 'fibogrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell } from 'lucide-react';
import { useState } from 'react';

const DATA = Array.from({ length: 50 }, (_, i) => ({
    id: `row-${i}`,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    value: Math.floor(Math.random() * 1000)
}));

const COL_DEFS = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'value', headerName: 'Value', width: 100, valueFormatter: (v: number) => `$${v}` },
];

export function CustomLayoutDemo() {
    const [layoutMode, setLayoutMode] = useState<'standard' | 'custom'>('custom');

    return (
        <Card className="mt-8 border-primary/20 shadow-parchment">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-display text-gradient-gold">
                    Custom Layout Demo
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLayoutMode(prev => prev === 'standard' ? 'custom' : 'standard')}
                >
                    Toggle Layout: {layoutMode === 'standard' ? 'Standard' : 'Custom'}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] border rounded-md overflow-hidden">
                    <FiboGrid
                        key={layoutMode}
                        rowData={DATA}
                        columnDefs={COL_DEFS}
                        pagination={true}
                        paginationPageSize={10}
                        configs={{
                            header: layoutMode === 'custom' ? {
                                layout: ['spacer', 'custom-actions', 'search'],
                                customActions: (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><Bell className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                                    </>
                                )
                            } : undefined,
                            footer: layoutMode === 'custom' ? {
                                layout: ['status-info', 'status-selected', 'spacer', 'pagination-controls', 'pagination-page-size']
                            } : undefined
                        }}
                    />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    {layoutMode === 'custom' ? (
                        <p>
                            <strong>Custom Layout:</strong> Header puts Search on left. Footer merges Status and Pagination into a single line.
                        </p>
                    ) : (
                        <p>
                            <strong>Standard Layout:</strong> Default toolbar and stacked footer components.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
