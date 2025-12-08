import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef, GridApi, RowNode } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  FileSpreadsheet, 
  Play, 
  Pause,
  Table2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Layers,
  Settings
} from 'lucide-react';
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
  pe: number;
}

// Optimized data generation
const generateStockData = (count: number): StockRow[] => {
  const tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'JNJ', 
                   'WMT', 'PG', 'DIS', 'NFLX', 'PYPL', 'ADBE', 'CRM', 'INTC', 'AMD', 'ORCL'];
  const names = ['Apple Inc.', 'Alphabet Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Meta Platforms', 
                 'NVIDIA Corp.', 'Tesla Inc.', 'JPMorgan Chase', 'Visa Inc.', 'Johnson & Johnson',
                 'Walmart Inc.', 'Procter & Gamble', 'Walt Disney', 'Netflix Inc.', 'PayPal Holdings',
                 'Adobe Inc.', 'Salesforce Inc.', 'Intel Corp.', 'AMD Inc.', 'Oracle Corp.'];
  const sectors = ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'];

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
      pe: Math.round((Math.random() * 50 + 5) * 100) / 100,
    };
  });
};

export default function Demo() {
  const [rowCount, setRowCount] = useState(1000);
  const [rowData, setRowData] = useState<StockRow[]>(() => generateStockData(1000));
  const [gridApi, setGridApi] = useState<GridApi<StockRow> | null>(null);
  const [groupByField, setGroupByField] = useState<string | undefined>(undefined);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [showRowNumbers, setShowRowNumbers] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [renderTime, setRenderTime] = useState(0);

  // Stable getRowId
  const getRowId = useCallback((row: StockRow) => row.id, []);

  // Memoized columns
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
      field: 'pe',
      headerName: 'P/E',
      width: 80,
      sortable: true,
      filterType: 'number',
      aggFunc: 'avg',
      valueFormatter: (value) => (value as number).toFixed(2),
    },
  ], []);

  // Optimized real-time updates
  useEffect(() => {
    if (isRealTimeEnabled) {
      intervalRef.current = setInterval(() => {
        const start = performance.now();
        setRowData(prev => {
          const updated = prev.map(stock => {
            const priceChange = (Math.random() - 0.5) * 2;
            const newPrice = Math.max(1, stock.price + priceChange);
            const newChange = stock.change + priceChange;
            
            return {
              ...stock,
              price: Math.round(newPrice * 100) / 100,
              change: Math.round(newChange * 100) / 100,
              changePercent: Math.round((newChange / (newPrice - newChange)) * 10000) / 100,
              volume: stock.volume + Math.floor(Math.random() * 10000),
            };
          });
          setRenderTime(Math.round(performance.now() - start));
          return updated;
        });
      }, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRealTimeEnabled, updateInterval]);

  const handleRowCountChange = useCallback((count: number) => {
    setRowCount(count);
    setRowData(generateStockData(count));
  }, []);

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
      pe: 25,
    };
    setRowData(prev => [newStock, ...prev]);
    toast({ title: 'Stock Added' });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast({ title: 'No Selection', variant: 'destructive' });
      return;
    }
    const selectedIds = new Set(selectedRows.map(r => r.id));
    setRowData(prev => prev.filter(row => !selectedIds.has(row.id)));
    toast({ title: 'Deleted', description: `${selectedIds.size} stock(s) removed.` });
  }, [gridApi]);

  const handleExport = useCallback(async () => {
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
      exportToExcel(displayedRows, processedColumns, { fileName: 'stocks.xlsx' });
      toast({ title: 'Export Complete' });
    } catch (error) {
      toast({ title: 'Export Failed', variant: 'destructive' });
    }
  }, [gridApi, columns]);

  const handleRefresh = useCallback(() => {
    setRowData(generateStockData(rowCount));
    toast({ title: 'Data Refreshed' });
  }, [rowCount]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1900px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <Table2 className="h-6 w-6 text-primary" />
                <span className="font-bold">LovGrid</span>
              </Link>
              <Badge variant="secondary">Interactive Demo</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                {isRealTimeEnabled ? (
                  <Pause className="h-4 w-4 text-red-500" />
                ) : (
                  <Play className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">Real-time</span>
                <Switch checked={isRealTimeEnabled} onCheckedChange={setIsRealTimeEnabled} />
              </div>
              
              {isRealTimeEnabled && (
                <Badge variant="outline" className="font-mono">
                  {renderTime}ms render
                </Badge>
              )}
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleAddRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1900px] mx-auto p-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Settings Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Row Count */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Row Count</span>
                    <Badge variant="outline">{rowCount.toLocaleString()}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[100, 1000, 10000, 50000, 100000].map((count) => (
                      <Button
                        key={count}
                        size="sm"
                        variant={rowCount === count ? "default" : "outline"}
                        onClick={() => handleRowCountChange(count)}
                      >
                        {count >= 1000 ? `${count / 1000}k` : count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Update Interval */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Update Interval</span>
                    <Badge variant="outline">{updateInterval}ms</Badge>
                  </div>
                  <Slider
                    value={[updateInterval]}
                    onValueChange={([v]) => setUpdateInterval(v)}
                    min={50}
                    max={1000}
                    step={50}
                  />
                </div>

                {/* Grouping */}
                <div className="space-y-2">
                  <span className="text-sm">Group By</span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={groupByField === undefined ? "default" : "outline"}
                      onClick={() => setGroupByField(undefined)}
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      None
                    </Button>
                    <Button
                      size="sm"
                      variant={groupByField === 'sector' ? "default" : "outline"}
                      onClick={() => setGroupByField('sector')}
                    >
                      Sector
                    </Button>
                  </div>
                </div>

                {/* Row Numbers */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Row Numbers</span>
                  <Switch checked={showRowNumbers} onCheckedChange={setShowRowNumbers} />
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rows</span>
                    <span className="font-medium">{rowData.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Columns</span>
                    <span className="font-medium">{columns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Real-time</span>
                    <span className="font-medium">{isRealTimeEnabled ? 'Active' : 'Paused'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Grid */}
          <Card className="overflow-hidden">
            <DataGrid
              rowData={rowData}
              columnDefs={columns}
              getRowId={getRowId}
              rowSelection="multiple"
              height={700}
              showToolbar={true}
              showStatusBar={true}
              showRowNumbers={showRowNumbers}
              pagination={rowCount > 10000}
              paginationPageSize={100}
              groupByFields={groupByField ? [groupByField] : undefined}
              onGridReady={(e) => setGridApi(e.api)}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}