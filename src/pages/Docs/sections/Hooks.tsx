import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu } from 'lucide-react';

export const Hooks = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Hooks & Headless</h1>
                <p className="text-lg text-muted-foreground">
                    Control your grids from anywhere in the component tree.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    useFiboGrid
                </h2>
                <p className="text-muted-foreground">
                    The primary hook for accessing a grid's instance by ID.
                </p>
                <CodeBlock code={`const { grid, events } = useFiboGrid('my-grid-id');

// grid: The GridApi instance (or null if not ready)
// events: Helper to subscribe to events`} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Headless Controller Example</h2>
                <p className="text-muted-foreground">
                    Create a toolbar component that lives outside the grid but controls it.
                </p>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="p-0">
                        <CodeBlock
                            code={`const GlobalToolbar = () => {
  const { grid } = useFiboGrid('inventory-grid');

  const handleExport = () => {
     grid?.exportToCsv({ fileName: 'inventory.csv' });
  };

  const handleClearFilters = () => {
     grid?.setFilterModel([]);
  };

  return (
    <div className="toolbar">
       <button onClick={handleExport}>Export CSV</button>
       <button onClick={handleClearFilters}>Clear Filters</button>
    </div>
  );
}`}
                            className="border-none m-0 rounded-none bg-transparent"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Available Hooks</h2>
                <ApiTable items={[
                    { name: 'useFiboGrid', type: '(gridId) => { grid, events }', description: 'Get API and Event subscriber for a grid.' },
                    { name: 'useGridRegistry', type: '() => Registry', description: 'Low-level access to the registry context.' },
                    { name: 'useGridEvent', type: '(gridId, event, handler)', description: 'Lightweight subscription to a single event.' },
                ]} />
            </div>
        </div>
    );
};
