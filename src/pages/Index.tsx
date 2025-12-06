import { useState, useMemo } from 'react';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef } from '@/components/DataGrid/types';

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
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: (params) => {
        const colors: Record<string, string> = {
          Active: 'bg-green-500/20 text-green-400',
          Pending: 'bg-yellow-500/20 text-yellow-400',
          Inactive: 'bg-red-500/20 text-red-400',
          Completed: 'bg-blue-500/20 text-blue-400',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[params.value as string] || ''}`}>
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
      width: 120,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'number',
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
      width: 120,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'date',
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 80,
      sortable: true,
      filterable: true,
      editable: true,
      filterType: 'boolean',
      cellRenderer: (params) => (
        <span className={params.value ? 'text-green-400' : 'text-red-400'}>
          {params.value ? '✓' : '✗'}
        </span>
      ),
    },
  ], []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">DataGrid Demo</h1>
          <p className="text-muted-foreground">
            Demonstração completa do componente DataGrid com 1000 linhas de dados.
          </p>
        </header>

        <div className="bg-card rounded-lg border border-border shadow-lg overflow-hidden" style={{ height: 600 }}>
          <DataGrid<DemoRow>
            rowData={rowData}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={50}
            rowSelection="multiple"
            rowDragEnabled={true}
            getRowId={(data) => data.id}
            onCellValueChanged={(event) => {
              console.log('Cell changed:', event);
              // Update the row data
              setRowData(prev => prev.map(row => 
                row.id === event.rowNode.id 
                  ? { ...row, [event.column.field]: event.newValue }
                  : row
              ));
            }}
            onSelectionChanged={(event) => {
              console.log('Selection changed:', event.selectedRows.length, 'rows selected');
            }}
          />
        </div>

        <footer className="mt-6 text-sm text-muted-foreground">
          <p>
            <strong>Features:</strong> Sorting, Filtering, Pagination, Column Resize/Reorder, 
            Row Selection, Cell Range Selection, Inline Editing, Row Drag & Drop, 
            Quick Filter, CSV Export, Context Menu
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
