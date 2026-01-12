import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Layout, Settings } from 'lucide-react';
import { ExampleBlock } from '../components/ExampleBlock';
import { FiboGrid } from 'fibogrid'; // Assuming self-import works for demo

export const Introduction = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            {/* Hero Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">
                        FiboGrid
                    </h1>
                    <Badge variant="outline" className="border-primary/20 text-primary font-mono">v1.0.0</Badge>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    The enterprise-grade data grid for React. Built on modern web standards, designed for performance, and styled for the future.
                </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-display">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            High Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        Virtualization built-in. Handles 100,000+ rows with 60fps scrolling. Zero-lag filtering and sorting.
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-display">
                            <Layout className="h-5 w-5 text-blue-500" />
                            Headless Capable
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        UI agnostic core. Use our beautiful default theme or bring your own UI components. Full control via Hooks.
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-display">
                            <Shield className="h-5 w-5 text-green-500" />
                            Enterprise Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        Features <code className="text-primary bg-primary/10 px-1 rounded">Ingress</code> and <code className="text-primary bg-primary/10 px-1 rounded">Egress</code> rules to strictly control cross-grid communication in complex apps.
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-display">
                            <Settings className="h-5 w-5 text-purple-500" />
                            Developer Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        Written in TypeScript. Fully typed props, events, and API. Comprehensive documentation and examples.
                    </CardContent>
                </Card>
            </div>

            {/* Live Demo Preview */}
            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">At a Glance</h2>
                <ExampleBlock
                    code={`import { FiboGrid } from 'fibogrid';

const data = [
  { id: 1, name: 'Task A', status: 'Completed', priority: 'High' },
  { id: 2, name: 'Task B', status: 'In Progress', priority: 'Medium' },
];

const columns = [
  { field: 'name', headerName: 'Task', flex: 1 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'priority', headerName: 'Priority', width: 100 },
];

<FiboGrid 
    rowData={data} 
    columnDefs={columns} 
    rowSelection="multiple"
/>`}
                    preview={
                        <div className="h-[300px] w-full">
                            <FiboGrid
                                rowData={[
                                    { id: 1, name: 'Review PR #123', status: 'Completed', priority: 'High', date: '2024-03-10' },
                                    { id: 2, name: 'Update Documentation', status: 'In Progress', priority: 'Critical', date: '2024-03-11' },
                                    { id: 3, name: 'Fix Layout Bug', status: 'Pending', priority: 'Medium', date: '2024-03-12' },
                                    { id: 4, name: 'Deploy to Staging', status: 'Pending', priority: 'High', date: '2024-03-13' },
                                ]}
                                columnDefs={[
                                    { field: 'name', headerName: 'Task Name', flex: 1, sortable: true, filterable: true },
                                    { field: 'status', headerName: 'Status', width: 140, sortable: true },
                                    { field: 'priority', headerName: 'Priority', width: 120, sortable: true },
                                    { field: 'date', headerName: 'Due Date', width: 120 },
                                ]}
                                rowSelection="multiple"
                                getRowId={(data) => String(data.id)}
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
};
