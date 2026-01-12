import React from 'react';
import { ApiTable } from '../components/ApiTable';
import { ExampleBlock } from '../components/ExampleBlock';
import { FiboGrid } from 'fibogrid';

export const Columns = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Columns</h1>
                <p className="text-lg text-muted-foreground">
                    Columns are the fundamental building blocks of FiboGrid. They define how data is displayed, formatted, and interacted with.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Column Definition Properties</h2>
                <ApiTable items={[
                    { name: 'field', type: 'string', required: true, description: 'The key in the data object to bind to.' },
                    { name: 'headerName', type: 'string', description: 'The text to display in the header. Defaults to field name capitalized.' },
                    { name: 'width', type: 'number', description: 'Fixed width in pixels.' },
                    { name: 'flex', type: 'number', description: 'Flex grow factor. Use 1 to fill remaining space.' },
                    { name: 'hide', type: 'boolean', default: 'false', description: 'If true, the column is hidden.' },
                    { name: 'pinned', type: "'left' | 'right' | null", description: 'Pin the column to the left or right.' },
                    { name: 'sortable', type: 'boolean', default: 'false', description: 'Enable sorting for this column.' },
                    { name: 'filterable', type: 'boolean', default: 'false', description: 'Enable filtering for this column.' },
                    { name: 'valueFormatter', type: '(value, data) => string', description: 'Function to format the display value.' },
                    { name: 'cellRenderer', type: 'React.Component', description: 'Custom component to render the cell content.' },
                ]} />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Sizing: Width vs Flex</h2>
                <p className="text-muted-foreground">
                    You can mix fixed-width columns with flexible columns. Fixed columns respect their <code className="text-primary">width</code>, while <code className="text-primary">flex</code> columns share the remaining space.
                </p>
                <ExampleBlock
                    title="Flexible Layout"
                    code={`const columns = [
  { field: 'id', width: 80, pinned: 'left' }, // Fixed 80px
  { field: 'title', flex: 2 },                // Takes 2x space
  { field: 'category', flex: 1 },             // Takes 1x space
  { field: 'date', width: 120 }               // Fixed 120px
];`}
                    preview={
                        <div className="h-[200px]">
                            <FiboGrid
                                rowData={[
                                    { id: '1', title: 'Implementation Plan', category: 'Documentation', date: '2024-01-01' },
                                    { id: '2', title: 'Fix Layout Bug', category: 'Bugfix', date: '2024-01-02' },
                                    { id: '3', title: 'Release v2.0', category: 'Release', date: '2024-01-05' },
                                ]}
                                columnDefs={[
                                    { field: 'id', headerName: 'ID', width: 60, pinned: 'left' },
                                    { field: 'title', headerName: 'Title (Flex 2)', flex: 2 },
                                    { field: 'category', headerName: 'Category (Flex 1)', flex: 1 },
                                    { field: 'date', headerName: 'Date', width: 100 },
                                ]}
                            />
                        </div>
                    }
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Custom Cell Renderers</h2>
                <p className="text-muted-foreground">
                    Use <code className="text-primary">cellRenderer</code> to render any React component inside a cell.
                </p>
                <ExampleBlock
                    code={`const columns = [
  { 
    field: 'status', 
    headerName: 'Status',
    cellRenderer: (params) => (
      <span className={params.value === 'Active' ? 'text-green-500' : 'text-red-500'}>
        ● {params.value}
      </span>
    )
  }
];`}
                    preview={
                        <div className="h-[150px]">
                            <FiboGrid
                                rowData={[
                                    { id: 1, name: 'Server A', status: 'Active' },
                                    { id: 2, name: 'Server B', status: 'Offline' },
                                ]}
                                columnDefs={[
                                    { field: 'name', headerName: 'Server', flex: 1 },
                                    {
                                        field: 'status',
                                        headerName: 'Status',
                                        width: 150,
                                        cellRenderer: (p: any) => (
                                            <span className={`font-bold ${p.value === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                                                {p.value === 'Active' ? '● Online' : '○ Offline'}
                                            </span>
                                        )
                                    }
                                ]}
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
};
