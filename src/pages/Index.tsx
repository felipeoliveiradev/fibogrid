import { useState, useMemo, useCallback } from 'react';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef, GridApi } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DemoRow {
  id: string;
  name: string;
  email: string;
  age: number;
  department: string;
  status: string;
  country: string;
  salary: number;
  startDate: string;
  active: boolean;
}

// Generate demo data
const generateDemoData = (count: number): DemoRow[] => {
  const statuses = ['Active', 'Pending', 'Inactive', 'Completed'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const countries = ['USA', 'UK', 'Germany', 'France', 'Japan', 'Brazil'];

  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: Math.floor(Math.random() * 50) + 20,
    department: departments[Math.floor(Math.random() * departments.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    salary: Math.floor(Math.random() * 100000) + 30000,
    startDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    active: Math.random() > 0.3,
  }));
};

const Index = () => {
  const [rowData, setRowData] = useState<DemoRow[]>(() => generateDemoData(1000));
  const [gridApi, setGridApi] = useState<GridApi<DemoRow> | null>(null);

  const columns: ColumnDef<DemoRow>[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      sortable: true,
      filterable: true,
      pinned: 'left',
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      sortable: true,
      filterable: true,
      editable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      sortable: true,
      filterable: true,
      editable: true,
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 80,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'number',
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 130,
      sortable: true,
      filterable: true,
      editable: true,
      cellEditor: 'select',
      cellEditorParams: {
        values: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
      filterable: true,
      editable: true,
      cellEditor: 'select',
      cellEditorParams: {
        values: ['Active', 'Pending', 'Inactive', 'Completed'],
      },
      cellRenderer: (params) => {
        const colors: Record<string, string> = {
          Active: 'bg-green-500/20 text-green-400 border-green-500/30',
          Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          Inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
          Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[params.value as string] || ''}`}>
            {params.value as string}
          </span>
        );
      },
    },
    {
      field: 'country',
      headerName: 'Country',
      width: 120,
      sortable: true,
      filterable: true,
      editable: true,
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 130,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'number',
      cellEditor: 'number',
      valueFormatter: (value) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(value as number);
      },
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'date',
      cellEditor: 'date',
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 90,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'boolean',
      cellEditor: 'checkbox',
      cellRenderer: (params) => (
        <div className="flex items-center justify-center w-full">
          <span className={`w-3 h-3 rounded-full ${params.value ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      ),
    },
  ], []);

  const handleAddRow = useCallback(() => {
    const newRow: DemoRow = {
      id: `row-${Date.now()}`,
      name: 'New User',
      email: 'new@example.com',
      age: 25,
      department: 'Engineering',
      status: 'Active',
      country: 'USA',
      salary: 50000,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
    };
    setRowData(prev => [newRow, ...prev]);
    toast({
      title: 'Row Added',
      description: 'A new row has been added to the grid.',
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!gridApi) return;
    const selectedIds = gridApi.getSelectedRowIds();
    if (selectedIds.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select rows to delete.',
        variant: 'destructive',
      });
      return;
    }
    setRowData(prev => prev.filter(row => !selectedIds.includes(row.id)));
    toast({
      title: 'Rows Deleted',
      description: `${selectedIds.length} row(s) have been deleted.`,
    });
  }, [gridApi]);

  const handleRefreshData = useCallback(() => {
    setRowData(generateDemoData(1000));
    toast({
      title: 'Data Refreshed',
      description: 'Grid data has been regenerated.',
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">DataGrid Demo</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Full-featured data grid with 1,000 rows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAddRow}>
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6">
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <DataGrid<DemoRow>
            rowData={rowData}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeOptions={[25, 50, 100, 250]}
            rowSelection="multiple"
            rowDragEnabled={true}
            showToolbar={true}
            showStatusBar={true}
            height={650}
            getRowId={(data) => data.id}
            onGridReady={(event) => setGridApi(event.api)}
            onCellValueChanged={(event) => {
              setRowData(prev => prev.map(row => 
                row.id === event.rowNode.id 
                  ? { ...row, [event.column.field]: event.newValue }
                  : row
              ));
            }}
          />
        </div>

        {/* Feature List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            title="Sorting & Filtering"
            description="Multi-column sorting, advanced filters with operators"
          />
          <FeatureCard
            title="Selection & Editing"
            description="Row/cell selection, inline editing with custom editors"
          />
          <FeatureCard
            title="Drag & Drop"
            description="Column reorder, row drag, resize columns"
          />
          <FeatureCard
            title="Virtual Scrolling"
            description="Handles 100k+ rows with smooth performance"
          />
        </div>
      </main>
    </div>
  );
};

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border">
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export default Index;
