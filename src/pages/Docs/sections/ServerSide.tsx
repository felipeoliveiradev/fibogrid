import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Server, ArrowRightLeft } from 'lucide-react';

export const ServerSide = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Server-Side Data</h1>
                <p className="text-lg text-muted-foreground">
                    Connect FiboGrid to any backend API.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    The DataSource Pattern
                </h2>
                <p className="text-muted-foreground">
                    Instead of passing accurate <code className="text-primary">rowData</code>, you enable <code className="text-primary">paginationMode="server"</code> and provide a <code className="text-primary">serverSideDataSource</code>.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Implementation Example</h2>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="p-0">
                        <CodeBlock
                            code={`import { ServerSideDataSource } from 'fibogrid';

// 1. Define your data source
const myDataSource: ServerSideDataSource = {
    getRows: async (params) => {
        // params contains: page, pageSize, sortModel, filterModel, quickFilterText
        const queryParams = new URLSearchParams({
            page: params.page.toString(),
            limit: params.pageSize.toString(),
            sort: JSON.stringify(params.sortModel),
            filter: JSON.stringify(params.filterModel),
            q: params.quickFilterText || ''
        });

        const response = await fetch(\`/api/items?\${queryParams}\`);
        const result = await response.json();

        // Return standard response format
        return {
            data: result.items,      // Array of rows for current page
            totalRows: result.total, // Total count (for pagination)
            page: params.page,
            pageSize: params.pageSize
        };
    }
};

// 2. Pass to Grid
<FiboGrid
    pagination={true}
    paginationMode="server"
    serverSideDataSource={myDataSource}
    columnDefs={columns}
/>`}
                            className="border-none m-0 rounded-none bg-transparent"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-purple-500" />
                    Hybrid Filtering
                </h2>
                <p className="text-muted-foreground">
                    Sometimes you want to fetch large pages from the server, but <span className="text-purple-400">filter locally</span> within that page for instant feedback.
                </p>
                <CodeBlock
                    code={`// In Column Definition
{
    field: 'status',
    filterable: true,
    // Forces grid to use client-side logic for this column 
    // even when in server-side mode
    useInternalFilter: true 
}`}
                />
            </div>
        </div>
    );
};
