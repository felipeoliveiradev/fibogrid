import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ServerSide = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">Server-Side Integration</h1>

            <p className="text-lg text-muted-foreground font-body">
                For large datasets, you can fetch data, sort, and filter on the server.
            </p>

            <Card className="paper-aged border-primary/10">
                <CardHeader>
                    <CardTitle className="font-display text-xl">Server Side Data Source</CardTitle>
                </CardHeader>
                <CardContent>
                    <CodeBlock code={`<FiboGrid
  serverSideDataSource={{
    getRows: async (params) => {
      // params contains: page, pageSize, sortModel, filterModel
      const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return await response.json(); // { data: [], totalRows: 1000 }
    }
  }}
  pagination={true}
  paginationMode="server" // Important!
/>`} />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold text-gradient-gold">Hybrid Filtering</h2>
                <p className="text-muted-foreground font-body">
                    You can mix server-side pagination with client-side filtering for specific columns.
                    Use <code className="font-mono bg-primary/10 px-1 rounded">useInternalFilter: true</code> on a column definition.
                </p>
                <p className="text-muted-foreground font-body">
                    This is useful when the server returns a subset of data (e.g. a page), but you want to filter that specific page's data immediately in the browser without triggering a new server request.
                </p>

                <CodeBlock code={`const columns: ColumnDef[] = [
  { 
    field: 'status', 
    headerName: 'Status (Client Filter)', 
    filterable: true,
    useInternalFilter: true // <--- Filters only the current page data on client
  },
  { 
    field: 'name', 
    headerName: 'Name (Server Filter)', 
    filterable: true 
    // Default behavior: triggers getRows() with new filterModel
  }
];`} />
            </div>
        </div>
    );
};
