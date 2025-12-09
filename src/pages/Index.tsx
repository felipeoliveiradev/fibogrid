import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataGrid, GridProvider } from '@/components/DataGrid';
import { ColumnDef, GridApi, RowNode } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, RefreshCw, Users, Package, Layers, TrendingUp, TrendingDown, FileSpreadsheet, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockRow {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  industry: string;
  pe: number;
  high52w: number;
  low52w: number;
}

interface OrderRow {
  id: string;
  orderId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  date: string;
  status: 'Filled' | 'Pending' | 'Cancelled';
}

// Generate stock data
const generateStockData = (count: number): StockRow[] => {
  const tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'JNJ', 
                   'WMT', 'PG', 'DIS', 'NFLX', 'PYPL', 'ADBE', 'CRM', 'INTC', 'AMD', 'ORCL',
                   'IBM', 'CSCO', 'UBER', 'LYFT', 'SQ', 'SHOP', 'ZOOM', 'SNAP', 'TWTR', 'PINS'];
  const names = ['Apple Inc.', 'Alphabet Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Meta Platforms', 
                 'NVIDIA Corp.', 'Tesla Inc.', 'JPMorgan Chase', 'Visa Inc.', 'Johnson & Johnson',
                 'Walmart Inc.', 'Procter & Gamble', 'Walt Disney', 'Netflix Inc.', 'PayPal Holdings',
                 'Adobe Inc.', 'Salesforce Inc.', 'Intel Corp.', 'AMD Inc.', 'Oracle Corp.',
                 'IBM Corp.', 'Cisco Systems', 'Uber Technologies', 'Lyft Inc.', 'Block Inc.',
                 'Shopify Inc.', 'Zoom Video', 'Snap Inc.', 'Twitter Inc.', 'Pinterest Inc.'];
  const sectors = ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'];
  const industries = ['Software', 'Hardware', 'Internet', 'Banking', 'Retail', 'Automotive'];

  return Array.from({ length: count }, (_, i) => {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    return {
      id: `stock-${i + 1}`,
      ticker: i < tickers.length ? tickers[i] : `STK${i}`,
      name: i < names.length ? names[i] : `Company ${i + 1}`,
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      marketCap: Math.floor(Math.random() * 2000) + 10,
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      pe: Math.round((Math.random() * 50 + 5) * 100) / 100,
      high52w: Math.round((basePrice * 1.3) * 100) / 100,
      low52w: Math.round((basePrice * 0.7) * 100) / 100,
    };
  });
};

// Generate orders for a stock
const generateOrdersForStock = (ticker: string): OrderRow[] => {
  const count = Math.floor(Math.random() * 8) + 2;
  const statuses: ('Filled' | 'Pending' | 'Cancelled')[] = ['Filled', 'Pending', 'Cancelled'];
  
  return Array.from({ length: count }, (_, i) => {
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const quantity = Math.floor(Math.random() * 100) + 1;
    const price = Math.round((Math.random() * 100 + 50) * 100) / 100;
    return {
      id: `order-${ticker}-${i + 1}`,
      orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
      ticker,
      type,
      quantity,
      price,
      total: Math.round(quantity * price * 100) / 100,
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

const Index = () => {
  const [rowData, setRowData] = useState<StockRow[]>(() => generateStockData(1000));
  const [gridApi, setGridApi] = useState<GridApi<StockRow> | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockRow | null>(null);
  const [orderData, setOrderData] = useState<OrderRow[]>([]);
  const [groupByField, setGroupByField] = useState<string | undefined>(undefined);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [showRowNumbers, setShowRowNumbers] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);


  const columns: ColumnDef<StockRow>[] = useMemo(() => [
    {
      field: 'ticker',
      headerName: 'Ticker',
      width: 100,
      sortable: true,
      filterable: true,
      pinned: 'left',
      cellRenderer: (params) => (
        <span className="font-bold text-primary">{params.value}</span>
      ),
    },
    {
      field: 'name',
      headerName: 'Company',
      width: 180,
      sortable: true,
      filterable: true,
      editable: true,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      sortable: true,
      filterable: true,
      filterType: 'number',
      valueFormatter: (value) => `$${(value as number).toFixed(2)}`,
      cellRenderer: (params) => (
        <span className="font-mono font-semibold">${(params.value as number).toFixed(2)}</span>
      ),
    },
    {
      field: 'change',
      headerName: 'Change',
      width: 100,
      sortable: true,
      filterType: 'number',
      cellRenderer: (params) => {
        const value = params.value as number;
        const isPositive = value >= 0;
        return (
          <div className={`flex items-center gap-1 font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{value.toFixed(2)}
          </div>
        );
      },
    },
    {
      field: 'changePercent',
      headerName: '%',
      width: 80,
      sortable: true,
      cellRenderer: (params) => {
        const value = params.value as number;
        const isPositive = value >= 0;
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
          </span>
        );
      },
    },
    {
      field: 'volume',
      headerName: 'Volume',
      width: 120,
      sortable: true,
      filterType: 'number',
      aggFunc: 'sum',
      valueFormatter: (value) => {
        const num = value as number;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      },
    },
    {
      field: 'marketCap',
      headerName: 'Market Cap',
      width: 120,
      sortable: true,
      filterType: 'number',
      aggFunc: 'sum',
      valueFormatter: (value) => `$${value}B`,
    },
    {
      field: 'sector',
      headerName: 'Sector',
      width: 120,
      sortable: true,
      filterable: true,
      editable: true,
      cellEditor: 'select',
      cellEditorParams: {
        values: ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'],
      },
    },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 110,
      sortable: true,
      filterable: true,
    },
    {
      field: 'pe',
      headerName: 'P/E',
      width: 80,
      sortable: true,
      filterType: 'number',
      aggFunc: 'avg',
      valueFormatter: (value) => (value as number).toFixed(2),
    },
    {
      field: 'high52w',
      headerName: '52W High',
      width: 100,
      sortable: true,
      valueFormatter: (value) => `$${(value as number).toFixed(2)}`,
    },
    {
      field: 'low52w',
      headerName: '52W Low',
      width: 100,
      sortable: true,
      valueFormatter: (value) => `$${(value as number).toFixed(2)}`,
    },
  ], []);


  const orderColumns: ColumnDef<OrderRow>[] = useMemo(() => [
    { field: 'orderId', headerName: 'Order ID', width: 120, sortable: true },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 80, 
      sortable: true,
      cellRenderer: (params) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          params.value === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {params.value as string}
        </span>
      ),
    },
    { field: 'quantity', headerName: 'Qty', width: 70, sortable: true },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 90, 
      sortable: true,
      valueFormatter: (value) => `$${(value as number).toFixed(2)}`,
    },
    { 
      field: 'total', 
      headerName: 'Total', 
      width: 100, 
      sortable: true,
      valueFormatter: (value) => `$${(value as number).toLocaleString()}`,
    },
    { field: 'date', headerName: 'Date', width: 100, sortable: true },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 90,
      cellRenderer: (params) => {
        const colors: Record<string, string> = {
          Filled: 'bg-green-500/20 text-green-400',
          Pending: 'bg-yellow-500/20 text-yellow-400',
          Cancelled: 'bg-red-500/20 text-red-400',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[params.value as string]}`}>
            {params.value as string}
          </span>
        );
      },
    },
  ], []);


  useEffect(() => {
    if (isRealTimeEnabled) {
      intervalRef.current = setInterval(() => {
        setRowData(prev => prev.map(stock => {

          const priceChange = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(1, stock.price + priceChange);
          const newChange = stock.change + priceChange;
          const newChangePercent = (newChange / (newPrice - newChange)) * 100;
          
          return {
            ...stock,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(newChange * 100) / 100,
            changePercent: Math.round(newChangePercent * 100) / 100,
            volume: stock.volume + Math.floor(Math.random() * 10000),
          };
        }));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTimeEnabled]);


  useEffect(() => {
    if (selectedStock) {
      const orders = generateOrdersForStock(selectedStock.ticker);
      setOrderData(orders);
    } else {
      setOrderData([]);
    }
  }, [selectedStock]);

  const handleAddRow = useCallback(() => {
    const newStock: StockRow = {
      id: `stock-${Date.now()}`,
      ticker: 'NEW',
      name: 'New Company',
      price: 100,
      change: 0,
      changePercent: 0,
      volume: 1000000,
      marketCap: 50,
      sector: 'Technology',
      industry: 'Software',
      pe: 25,
      high52w: 120,
      low52w: 80,
    };
    setRowData(prev => [newStock, ...prev]);
    toast({ title: 'Stock Added', description: 'New stock added to the grid.' });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast({ title: 'No Selection', description: 'Please select rows to delete.', variant: 'destructive' });
      return;
    }
    const selectedIds = selectedRows.map(r => r.id);
    setRowData(prev => prev.filter(row => !selectedIds.includes(row.id)));
    toast({ title: 'Deleted', description: `${selectedIds.length} stock(s) removed.` });
  }, [gridApi]);

  const handleExportExcel = useCallback(async () => {
    if (!gridApi) return;
    
    try {
      const { exportToExcel } = await import('@/components/DataGrid/utils/excelExport');
      const displayedRows = gridApi.getDisplayedRows();
      const processedColumns = columns.map((col, idx) => ({
        ...col,
        computedWidth: col.width || 100,
        left: 0,
        index: idx,
      }));
      
      exportToExcel(displayedRows, processedColumns, {
        fileName: 'stocks_export.xlsx',
        sheetName: 'Stocks',
      });
      
      toast({ title: 'Export Complete', description: 'Excel file downloaded successfully.' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export Failed', description: 'Failed to export to Excel.', variant: 'destructive' });
    }
  }, [gridApi, columns]);

  const handleRefreshData = useCallback(() => {
    setRowData(generateStockData(1000));
    setSelectedStock(null);
    toast({ title: 'Data Refreshed', description: 'Stock data has been regenerated.' });
  }, []);

  const handleRowClicked = useCallback((event: { rowNode: RowNode<StockRow> }) => {
    setSelectedStock(event.rowNode.data);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1900px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stock Trading Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Real-time stock data with 1000 rows • Full-featured DataGrid
              </p>
            </div>
            <div className="flex items-center gap-4">
              {}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                {isRealTimeEnabled ? (
                  <Pause className="h-4 w-4 text-red-500" />
                ) : (
                  <Play className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">Real-time</span>
                <Switch
                  checked={isRealTimeEnabled}
                  onCheckedChange={setIsRealTimeEnabled}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleAddRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stock
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefreshData}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-[1900px] mx-auto p-6">
        {}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                variant={groupByField === 'sector' ? "default" : "outline"} 
                size="sm"
                onClick={() => setGroupByField('sector')}
              >
                Sector
              </Button>
              <Button 
                variant={groupByField === 'industry' ? "default" : "outline"} 
                size="sm"
                onClick={() => setGroupByField('industry')}
              >
                Industry
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Row Numbers</span>
              <Switch
                checked={showRowNumbers}
                onCheckedChange={setShowRowNumbers}
              />
            </div>
            <Badge variant="secondary" className="text-xs">
              {rowData.length} stocks
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Watch
                  {isRealTimeEnabled && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-500">LIVE</span>
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <GridProvider>
                  <DataGrid<StockRow>
                    gridId="stocks-grid"
                    rowData={rowData}
                    columnDefs={columns}
                    pagination={true}
                    paginationPageSize={100}
                    paginationPageSizeOptions={[50, 100, 250, 500]}
                    rowSelection="multiple"
                    rowDragEnabled={true}
                    showToolbar={true}
                    showStatusBar={true}
                    showRowNumbers={showRowNumbers}
                    height={600}
                    getRowId={(data) => data.id}
                    groupByFields={groupByField ? [groupByField] : undefined}
                    groupAggregations={{ volume: 'sum', marketCap: 'sum', pe: 'avg' }}
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

          {}
          <div className="lg:col-span-1 space-y-4">
            {}
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Orders
                  {selectedStock && (
                    <Badge variant="outline" className="ml-2">
                      {selectedStock.ticker}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedStock ? (
                  <DataGrid<OrderRow>
                    gridId="orders-grid"
                    rowData={orderData}
                    columnDefs={orderColumns}
                    pagination={false}
                    rowSelection="single"
                    showToolbar={false}
                    showStatusBar={true}
                    height={300}
                    getRowId={(data) => data.id}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a stock to view orders</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            {selectedStock && (
              <Card>
                <CardHeader className="py-3 px-4 border-b border-border">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{selectedStock.ticker}</span>
                    <span className={`text-lg ${selectedStock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${selectedStock.price.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Company:</dt>
                      <dd className="font-medium truncate max-w-[150px]">{selectedStock.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Change:</dt>
                      <dd className={`font-medium ${selectedStock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Volume:</dt>
                      <dd className="font-medium">{(selectedStock.volume / 1000000).toFixed(1)}M</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Market Cap:</dt>
                      <dd className="font-medium">${selectedStock.marketCap}B</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">P/E Ratio:</dt>
                      <dd className="font-medium">{selectedStock.pe.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">52W Range:</dt>
                      <dd className="font-medium">${selectedStock.low52w} - ${selectedStock.high52w}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Sector:</dt>
                      <dd className="font-medium">{selectedStock.sector}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Orders:</dt>
                      <dd className="font-medium">{orderData.length}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}

            {}
            <Card>
              <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-base">Features Demo</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>✓ 1000 rows with real-time updates</li>
                  <li>✓ Column pinning (Ticker pinned left)</li>
                  <li>✓ Row numbers column</li>
                  <li>✓ Excel-style filtering</li>
                  <li>✓ Column resize & auto-fit</li>
                  <li>✓ Row grouping with aggregations</li>
                  <li>✓ Linked grids (click stock → orders)</li>
                  <li>✓ Cell editing with select editors</li>
                  <li>✓ Multi-row selection</li>
                  <li>✓ Drag & drop rows</li>
                  <li>✓ Excel export</li>
                  <li>✓ CSV export</li>
                  <li>✓ Quick filter search</li>
                  <li>✓ Custom cell renderers</li>
                  <li>✓ Status bar with stats</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
