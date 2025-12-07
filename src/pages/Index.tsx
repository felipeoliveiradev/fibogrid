import { useState, useMemo, useCallback, useEffect } from 'react';
import { DataGrid, GridProvider } from '@/components/DataGrid';
import { ColumnDef, GridApi, RowNode } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, RefreshCw, Users, Package, Layers } from 'lucide-react';
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

interface OrderRow {
  id: string;
  orderId: string;
  product: string;
  quantity: number;
  price: number;
  date: string;
  userId: string;
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

// Generate orders for a user
const generateOrdersForUser = (userId: string): OrderRow[] => {
  const products = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse'];
  const count = Math.floor(Math.random() * 5) + 1;
  
  return Array.from({ length: count }, (_, i) => ({
    id: `order-${userId}-${i + 1}`,
    orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
    product: products[Math.floor(Math.random() * products.length)],
    quantity: Math.floor(Math.random() * 10) + 1,
    price: Math.floor(Math.random() * 1000) + 100,
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    userId,
  }));
};

const Index = () => {
  const [rowData, setRowData] = useState<DemoRow[]>(() => generateDemoData(500));
  const [gridApi, setGridApi] = useState<GridApi<DemoRow> | null>(null);
  const [selectedUser, setSelectedUser] = useState<DemoRow | null>(null);
  const [orderData, setOrderData] = useState<OrderRow[]>([]);
  const [groupByField, setGroupByField] = useState<string | undefined>(undefined);

  // Columns for main grid
  const columns: ColumnDef<DemoRow>[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      filterable: true,
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
      width: 200,
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
      width: 110,
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
      cellEditor: 'number',
      aggFunc: 'sum',
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
      cellEditor: 'date',
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 80,
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

  // Columns for orders grid
  const orderColumns: ColumnDef<OrderRow>[] = useMemo(() => [
    { field: 'orderId', headerName: 'Order ID', width: 120, sortable: true },
    { field: 'product', headerName: 'Product', width: 120, sortable: true, filterable: true },
    { field: 'quantity', headerName: 'Qty', width: 70, sortable: true },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100, 
      sortable: true,
      valueFormatter: (value) => `$${(value as number).toLocaleString()}`,
    },
    { field: 'date', headerName: 'Date', width: 110, sortable: true },
  ], []);

  // Load orders when user is selected
  useEffect(() => {
    if (selectedUser) {
      const orders = generateOrdersForUser(selectedUser.id);
      setOrderData(orders);
    } else {
      setOrderData([]);
    }
  }, [selectedUser]);

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
    setRowData(generateDemoData(500));
    setSelectedUser(null);
    toast({
      title: 'Data Refreshed',
      description: 'Grid data has been regenerated.',
    });
  }, []);

  const handleRowClicked = useCallback((event: { rowNode: RowNode<DemoRow> }) => {
    setSelectedUser(event.rowNode.data);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">DataGrid Demo</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Full-featured data grid with grouping, filtering, and linked tables
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
      <main className="max-w-[1800px] mx-auto p-6">
        {/* Grouping Controls */}
        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm font-medium">Group By:</span>
          <div className="flex gap-2">
            <Button 
              variant={groupByField === undefined ? "default" : "outline"} 
              size="sm"
              onClick={() => setGroupByField(undefined)}
            >
              <Layers className="h-4 w-4 mr-1" />
              None
            </Button>
            <Button 
              variant={groupByField === 'department' ? "default" : "outline"} 
              size="sm"
              onClick={() => setGroupByField('department')}
            >
              <Users className="h-4 w-4 mr-1" />
              Department
            </Button>
            <Button 
              variant={groupByField === 'status' ? "default" : "outline"} 
              size="sm"
              onClick={() => setGroupByField('status')}
            >
              <Package className="h-4 w-4 mr-1" />
              Status
            </Button>
            <Button 
              variant={groupByField === 'country' ? "default" : "outline"} 
              size="sm"
              onClick={() => setGroupByField('country')}
            >
              Country
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main DataGrid */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users
                  <Badge variant="secondary" className="ml-2">{rowData.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <GridProvider>
                  <DataGrid<DemoRow>
                    gridId="users-grid"
                    rowData={rowData}
                    columnDefs={columns}
                    pagination={true}
                    paginationPageSize={50}
                    paginationPageSizeOptions={[25, 50, 100, 250]}
                    rowSelection="multiple"
                    rowDragEnabled={true}
                    showToolbar={true}
                    showStatusBar={true}
                    height={550}
                    getRowId={(data) => data.id}
                    groupByFields={groupByField ? [groupByField] : undefined}
                    groupAggregations={{ salary: 'sum', age: 'avg' }}
                    onGridReady={(event) => setGridApi(event.api)}
                    onRowClicked={handleRowClicked}
                    onCellValueChanged={(event) => {
                      setRowData(prev => prev.map(row => 
                        row.id === event.rowNode.id 
                          ? { ...row, [event.column.field]: event.newValue }
                          : row
                      ));
                    }}
                  />
                </GridProvider>
              </CardContent>
            </Card>
          </div>

          {/* Detail Panel - Orders Grid */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Orders
                  {selectedUser && (
                    <Badge variant="outline" className="ml-2">
                      {selectedUser.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedUser ? (
                  <DataGrid<OrderRow>
                    gridId="orders-grid"
                    rowData={orderData}
                    columnDefs={orderColumns}
                    pagination={false}
                    rowSelection="single"
                    showToolbar={false}
                    showStatusBar={true}
                    height={400}
                    getRowId={(data) => data.id}
                  />
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a user to view their orders</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected User Info */}
            {selectedUser && (
              <Card className="mt-4">
                <CardHeader className="py-3 px-4 border-b border-border">
                  <CardTitle className="text-base">User Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium">{selectedUser.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Email:</dt>
                      <dd className="font-medium">{selectedUser.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Department:</dt>
                      <dd className="font-medium">{selectedUser.department}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status:</dt>
                      <dd>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          selectedUser.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          selectedUser.status === 'Inactive' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {selectedUser.status}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Salary:</dt>
                      <dd className="font-medium">
                        ${selectedUser.salary.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Orders:</dt>
                      <dd className="font-medium">{orderData.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Value:</dt>
                      <dd className="font-medium">
                        ${orderData.reduce((sum, o) => sum + o.price * o.quantity, 0).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <FeatureCard
            title="Excel-like Filtering"
            description="Click column filter icon for values list and conditions"
          />
          <FeatureCard
            title="Row Grouping"
            description="Group by Department, Status, or Country with aggregations"
          />
          <FeatureCard
            title="Linked Tables"
            description="Click a user to see their orders in the detail panel"
          />
          <FeatureCard
            title="Column Resize"
            description="Drag column edges to resize, double-click to auto-fit"
          />
          <FeatureCard
            title="Virtual Scrolling"
            description="Smooth performance with hundreds of rows"
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