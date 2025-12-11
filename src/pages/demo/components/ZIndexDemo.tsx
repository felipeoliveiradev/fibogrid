import { FiboGrid } from 'fibogrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from 'react';

const DATA = Array.from({ length: 20 }, (_, i) => ({
    id: `row-${i}`,
    name: `Layer Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000)
}));

const COL_DEFS = [
    { field: 'name', headerName: 'Name', flex: 1, filter: true },
    { field: 'value', headerName: 'Value', width: 100, filter: true },
];

export function ZIndexDemo() {
    return (
        <Card className="mt-8 border-primary/20 shadow-parchment">
            <CardHeader>
                <CardTitle className="text-2xl font-display text-gradient-gold">
                    Z-Index & Overlay Demo
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-2">
                    Visual verification for Themeable Z-Index system (1.0.16).
                    Try opening grid filters/menus while Dialogs or Popovers are active.
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary">Open Test Dialog (z-index check)</Button>
                        </DialogTrigger>
                        <DialogContent className="min-w-[800px] h-[600px] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Grid Inside Dialog</DialogTitle>
                                <DialogDescription>
                                    Verify that Grid Menus (z=1000) appear ON TOP of this Dialog (z=1050 usually needs adjustment).
                                    You might need to adjust `--fibogrid-z-popover` in your theme if it falls behind.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 min-h-0 border rounded-md mt-4 relative">
                                <FiboGrid
                                    rowData={DATA}
                                    columnDefs={COL_DEFS}
                                    pagination={true}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Test Popover Overlap</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 h-96 p-0 overflow-hidden" side="right">
                            <div className="h-full flex flex-col p-4 bg-background">
                                <h3 className="font-semibold mb-4">Grid Inside Popover</h3>
                                <div className="flex-1 min-h-0 border rounded-md relative">
                                    <FiboGrid
                                        rowData={DATA.slice(0, 5)}
                                        columnDefs={COL_DEFS}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="h-[300px] border rounded-md relative z-0">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-10">
                        <span className="text-9xl font-bold">Standard Grid</span>
                    </div>
                    <FiboGrid
                        rowData={DATA}
                        columnDefs={COL_DEFS}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
