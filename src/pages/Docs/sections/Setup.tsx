import { FiboGrid, ColumnDef } from 'fibogrid';
import { Package, BookOpen, Code, Check, Hexagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '../components/CodeBlock';
import { ExampleBlock } from '../components/ExampleBlock';
import { useMemo } from 'react';

const sampleData = [
    { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active' },
    { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active' },
    { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending' },
];

const basicColumns: ColumnDef<any>[] = [
    { field: 'name', headerName: 'Name', sortable: true, width: 140 },
    { field: 'email', headerName: 'Email', sortable: true, width: 180 },
    { field: 'status', headerName: 'Status', width: 100 },
];

export const Setup = ({ activeSection }: { activeSection: string }) => {
    // We render based on activeSection to keep the file structure clean but granular
    return (
        <>
            {activeSection === 'installation' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-gold">Installation</h1>
                        <p className="text-lg text-muted-foreground font-body leading-relaxed">
                            Get started with FiboGrid in minutes. Install the package and start building beautiful data grids.
                        </p>
                    </div>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Package Installation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="font-body text-muted-foreground">Install FiboGrid using your preferred package manager:</p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-mono text-primary mb-2">npm</p>
                                    <CodeBlock code="npm install fibogrid" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-primary mb-2">yarn</p>
                                    <CodeBlock code="yarn add fibogrid" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-primary mb-2">pnpm</p>
                                    <CodeBlock code="pnpm add fibogrid" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 font-body">
                                {[
                                    { label: 'React', version: '>= 18.0.0' },
                                    { label: 'TypeScript', version: '>= 4.7 (optional)' },
                                    { label: 'Tailwind CSS', version: '>= 3.0 (for default styles)' },
                                ].map((req, i) => (
                                    <li key={i} className="flex items-center justify-between border-b border-primary/5 pb-2">
                                        <span>{req.label}</span>
                                        <Badge variant="outline" className="border-primary/30 font-mono text-xs">
                                            {req.version}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'getting-started' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient-gold">Getting Started</h1>
                        <p className="text-lg text-muted-foreground font-body leading-relaxed">
                            FiboGrid is a high-performance React data grid component with features comparable to AG Grid,
                            inspired by Da Vinci's pursuit of mathematical perfection.
                        </p>
                    </div>

                    <ExampleBlock
                        title="Quick Start"
                        description="Import the DataGrid component and pass your data to get started immediately."
                        code={`import { DataGrid } from 'fibogrid';
import { ColumnDef } from 'fibogrid/types';

const columns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'email', headerName: 'Email', sortable: true },
  { field: 'status', headerName: 'Status' },
];

const data = [
  { id: '1', name: 'Leonardo', email: 'leo@vinci.com', status: 'Active' },
  { id: '2', name: 'Michelangelo', email: 'mike@sistine.com', status: 'Active' },
  { id: '3', name: 'Raphael', email: 'raph@school.com', status: 'Pending' },
];

function MyGrid() {
  return (
    <FiboGrid
      rowData={data}
      columnDefs={columns}
      getRowId={(row) => row.id}
      rowSelection="multiple"
    />
  );
}`}
                        preview={
                            <FiboGrid
                                rowData={sampleData}
                                columnDefs={basicColumns}
                                getRowId={(row) => row.id}
                                rowSelection="multiple"
                            />
                        }
                    />

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <Hexagon className="h-5 w-5 text-primary" />
                                Core Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 font-body">
                                {[
                                    'Virtual scrolling for 100k+ rows',
                                    'Multi-column sorting',
                                    'Advanced filtering with Excel-style UI',
                                    'Column pinning (left/right)',
                                    'Row grouping with aggregations',
                                    'Inline cell editing',
                                    'CSV/Excel export',
                                    'Real-time data updates with animations',
                                    'Linked grids for master-detail views',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded bg-gradient-gold flex items-center justify-center shadow-gold">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeSection === 'basic-usage' && (
                <div className="space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Basic Usage</h1>

                    <Card className="paper-aged border-primary/10">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">DataGrid Props</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm font-body">
                                    <thead>
                                        <tr className="border-b border-primary/10">
                                            <th className="text-left py-3 px-4 font-display">Prop</th>
                                            <th className="text-left py-3 px-4 font-display">Type</th>
                                            <th className="text-left py-3 px-4 font-display">Default</th>
                                            <th className="text-left py-3 px-4 font-display">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ['rowData', 'T[]', '-', 'Array of data objects'],
                                            ['columnDefs', 'ColumnDef[]', '-', 'Column definitions'],
                                            ['getRowId', '(data) => string', '-', 'Function to get unique row ID'],
                                            ['height', 'number | string', "'100%'", 'Grid height'],
                                            ['rowSelection', "'single' | 'multiple'", '-', 'Enable row selection'],
                                            ['pagination', 'boolean', 'false', 'Enable pagination'],
                                            ['rowHeight', 'number', '40', 'Height of each row in pixels'],
                                            ['showToolbar', 'boolean', 'false', 'Show toolbar with search/export'],
                                            ['showStatusBar', 'boolean', 'false', 'Show status bar with counts'],
                                            ['loading', 'boolean', 'false', 'Show loading overlay'],
                                        ].map(([prop, type, def, desc], i) => (
                                            <tr key={i} className="border-b border-primary/5">
                                                <td className="py-3 px-4 font-mono text-primary">{prop}</td>
                                                <td className="py-3 px-4 font-mono text-muted-foreground">{type}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{def}</td>
                                                <td className="py-3 px-4">{desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};
