import { useState, useMemo, useCallback, useRef, useEffect, startTransition } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@/components/DataGrid';
import { ColumnDef, GridApi, RowNode } from '@/components/DataGrid/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  FileSpreadsheet, 
  Play, 
  Pause,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Layers,
  Settings,
  Split,
  ChevronRight,
  ChevronDown,
  Users
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
  parentId?: string;
  isChild?: boolean;
  isDetailRow?: boolean;
  // Extra company info
  founded?: number;
  employees?: number;
  headquarters?: string;
  ceo?: string;
  website?: string;
}

// Pre-computed data for faster generation
const TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'JNJ', 
                 'WMT', 'PG', 'DIS', 'NFLX', 'PYPL', 'ADBE', 'CRM', 'INTC', 'AMD', 'ORCL'];
const NAMES = ['Apple Inc.', 'Alphabet Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Meta Platforms', 
               'NVIDIA Corp.', 'Tesla Inc.', 'JPMorgan Chase', 'Visa Inc.', 'Johnson & Johnson',
               'Walmart Inc.', 'Procter & Gamble', 'Walt Disney', 'Netflix Inc.', 'PayPal Holdings',
               'Adobe Inc.', 'Salesforce Inc.', 'Intel Corp.', 'AMD Inc.', 'Oracle Corp.'];
const SECTORS = ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'];
const HEADQUARTERS = ['Cupertino, CA', 'Mountain View, CA', 'Redmond, WA', 'Seattle, WA', 'Menlo Park, CA',
                      'Santa Clara, CA', 'Austin, TX', 'New York, NY', 'San Francisco, CA', 'New Brunswick, NJ'];
const CEOS = ['Tim Cook', 'Sundar Pichai', 'Satya Nadella', 'Andy Jassy', 'Mark Zuckerberg',
              'Jensen Huang', 'Elon Musk', 'Jamie Dimon', 'Ryan McInerney', 'Joaquin Duato'];

// Optimized batch data generation for 100k+ rows
const generateStockData = (count: number): StockRow[] => {
  const result: StockRow[] = new Array(count);
  const tickerLen = TICKERS.length;
  const nameLen = NAMES.length;
  const sectorLen = SECTORS.length;
  const hqLen = HEADQUARTERS.length;
  const ceoLen = CEOS.length;
  
  for (let i = 0; i < count; i++) {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    result[i] = {
      id: `stock-${i + 1}`,
      ticker: i < tickerLen ? TICKERS[i] : `STK${i}`,
      name: i < nameLen ? NAMES[i] : `Company ${i + 1}`,
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      marketCap: Math.floor(Math.random() * 2000) + 10,
      sector: SECTORS[i % sectorLen],
      pe: Math.round((Math.random() * 50 + 5) * 100) / 100,
      // Extra company info
      founded: 1970 + Math.floor(Math.random() * 50),
      employees: Math.floor(Math.random() * 200000) + 1000,
      headquarters: HEADQUARTERS[i % hqLen],
      ceo: i < ceoLen ? CEOS[i] : `CEO ${i + 1}`,
      website: `https://${(i < tickerLen ? TICKERS[i] : `company${i}`).toLowerCase()}.com`,
    };
  }
  return result;
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Split row handler - clones row as child with empty ticker/name
  const handleSplitRow = useCallback((rowId: string) => {
    setRowData(prev => {
      const parentIndex = prev.findIndex(r => r.id === rowId);
      if (parentIndex === -1) return prev;
      
      const parent = prev[parentIndex];
      const childId = `${rowId}-child-${Date.now()}`;
      const childRow: StockRow = {
        ...parent,
        id: childId,
        ticker: '',
        name: '',
        parentId: rowId,
        isChild: true,
      };
      
      // Insert child right after parent
      const result = [...prev];
      result.splice(parentIndex + 1, 0, childRow);
      
      // Auto-expand parent
      setExpandedRows(p => new Set([...p, rowId]));
      
      return result;
    });
    toast({ title: 'Row Split', description: 'Child row created' });
  }, []);

  // Toggle row expand/collapse
  const toggleRowExpand = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  // Get visible rows (respecting expand/collapse state)
  const visibleRowData = useMemo(() => {
    const result: StockRow[] = [];
    const childrenByParent = new Map<string, StockRow[]>();
    
    // Group children by parent
    rowData.forEach(row => {
      if (row.parentId && row.isChild) {
        const children = childrenByParent.get(row.parentId) || [];
        children.push(row);
        childrenByParent.set(row.parentId, children);
      }
    });
    
    // Build visible rows with detail rows
    rowData.forEach(row => {
      if (!row.parentId && !row.isDetailRow) {
        result.push(row);
        
        // Add detail header + child rows if expanded
        if (expandedRows.has(row.id)) {
          // First add detail header row
          result.push({
            ...row,
            id: `${row.id}-detail`,
            isDetailRow: true,
            parentId: row.id,
          });
          
          // Then add any child rows (splits)
          const children = childrenByParent.get(row.id);
          if (children) {
            children.forEach(child => result.push(child));
          }
        }
      }
    });
    
    return result;
  }, [rowData, expandedRows]);

  // Check if row has children
  const hasChildren = useCallback((rowId: string) => {
    return rowData.some(r => r.parentId === rowId);
  }, [rowData]);

  // Stable getRowId
  const getRowId = useCallback((row: StockRow) => row.id, []);

  // Memoized columns with Actions
  const columns: ColumnDef<StockRow>[] = useMemo(() => [
    {
      field: 'ticker',
      headerName: 'Ticker',
      width: 180,
      sortable: true,
      filterable: true,
      editable: true,
      pinned: 'left',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        
        // Detail row - show avatar + name + sector
        if (row.isDetailRow) {
          return (
            <div className="flex items-center gap-2 pl-6">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs flex-shrink-0">
                {row.ticker?.slice(0, 2) || '??'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">{row.name}</span>
                <Badge variant="secondary" className="text-xs w-fit">{row.sector}</Badge>
              </div>
            </div>
          );
        }
        
        const isExpanded = expandedRows.has(row.id);
        const isChild = row.isChild;
        
        return (
          <div className="flex items-center gap-1">
            {/* Expand button */}
            {!isChild && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowExpand(row.id);
                }}
                className={`p-0.5 hover:bg-accent rounded transition-colors`}
                title="Show details"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}
            {isChild && <span className="w-5 ml-5" />}
            <span className={`font-bold ${isChild ? 'text-muted-foreground' : 'text-foreground'}`}>
              {params.value || (isChild ? '—' : '')}
            </span>
          </div>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Company',
      width: 200,
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        
        // Detail row - "Founded YEAR"
        if (row.isDetailRow) {
          return (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Founded</span>
              <span className="font-medium">{row.founded}</span>
            </div>
          );
        }
        
        return (
          <span className={row.isChild ? 'text-muted-foreground italic pl-4' : ''}>
            {params.value || (row.isChild ? '—' : '')}
          </span>
        );
      },
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      sortable: true,
      filterable: true,
      filterType: 'number',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        // Detail row - show "Active" badge
        if (row.isDetailRow) {
          return (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 font-medium">
              Active
            </Badge>
          );
        }
        return <span className="font-mono font-semibold">${(params.value as number).toFixed(2)}</span>;
      },
    },
    {
      field: 'volume',
      headerName: 'Volume',
      width: 110,
      sortable: true,
      filterType: 'number',
      aggFunc: 'sum',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        // Detail row - show employees count
        if (row.isDetailRow) {
          return (
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{row.employees?.toLocaleString()}</span>
            </div>
          );
        }
        const num = params.value as number;
        if (num >= 1000000) return <span>{(num / 1000000).toFixed(1)}M</span>;
        if (num >= 1000) return <span>{(num / 1000).toFixed(1)}K</span>;
        return <span>{num}</span>;
      },
    },
    {
      field: 'marketCap',
      headerName: 'Market Cap',
      width: 110,
      sortable: true,
      filterType: 'number',
      aggFunc: 'sum',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        // Detail row - show market cap with increase
        if (row.isDetailRow) {
          return (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">${row.marketCap}B</span>
              <span className="text-green-500 text-xs">5% increase</span>
            </div>
          );
        }
        return <span>${params.value}B</span>;
      },
    },
    {
      field: 'change',
      headerName: 'Change',
      width: 100,
      sortable: true,
      filterType: 'number',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        // Detail row - show price
        if (row.isDetailRow) {
          return <span className="font-mono font-semibold">${row.price.toFixed(2)}</span>;
        }
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
      width: 90,
      sortable: true,
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        // Detail row - empty or can show something else
        if (row.isDetailRow) {
          return null;
        }
        const value = params.value as number;
        const isPositive = value >= 0;
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
          </span>
        );
      },
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
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        if (row.isDetailRow) return null;
        return <span>{params.value}</span>;
      },
    },
    {
      field: 'pe',
      headerName: 'P/E',
      width: 80,
      sortable: true,
      filterType: 'number',
      aggFunc: 'avg',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        if (row.isDetailRow) return null;
        return <span>{(params.value as number).toFixed(2)}</span>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      pinned: 'right',
      cellRenderer: (params) => {
        const row = params.data as StockRow;
        if (row.isChild || row.isDetailRow) return null;
        
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleSplitRow(row.id);
            }}
          >
            <Split className="h-3 w-3 mr-1" />
            Split
          </Button>
        );
      },
    },
  ], [hasChildren, expandedRows, toggleRowExpand, handleSplitRow]);

  // Ultra-optimized real-time updates - target <16ms for 60fps
  useEffect(() => {
    if (isRealTimeEnabled) {
      intervalRef.current = setInterval(() => {
        const start = performance.now();
        
        // Use startTransition for non-blocking updates
        startTransition(() => {
          setRowData(prev => {
            const len = prev.length;
            const updated: StockRow[] = new Array(len);
            
            for (let i = 0; i < len; i++) {
              const stock = prev[i];
              const rand = Math.random();
              const priceChange = (rand - 0.5) * 2;
              const newPrice = stock.price + priceChange;
              const newChange = stock.change + priceChange;
              
              updated[i] = {
                id: stock.id,
                ticker: stock.ticker,
                name: stock.name,
                price: ((newPrice * 100) | 0) / 100,
                change: ((newChange * 100) | 0) / 100,
                changePercent: ((newChange / newPrice * 10000) | 0) / 100,
                volume: stock.volume + ((rand * 10000) | 0),
                marketCap: stock.marketCap,
                sector: stock.sector,
                pe: stock.pe,
              };
            }
            
            return updated;
          });
        });
        
        setRenderTime((performance.now() - start) | 0);
      }, updateInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRealTimeEnabled, updateInterval]);

  const handleRowCountChange = useCallback((count: number) => {
    setRowCount(count);
    
    // Use requestAnimationFrame for large datasets to prevent UI freeze
    if (count >= 50000) {
      toast({ title: 'Generating data...', description: `Creating ${count.toLocaleString()} rows` });
      requestAnimationFrame(() => {
        const start = performance.now();
        const data = generateStockData(count);
        const elapsed = Math.round(performance.now() - start);
        setRowData(data);
        toast({ title: 'Data ready', description: `${count.toLocaleString()} rows in ${elapsed}ms` });
      });
    } else {
      setRowData(generateStockData(count));
    }
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

  // FiboGrid Logo Component
  const FiboLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(42 70% 55%)" />
          <stop offset="50%" stopColor="hsl(40 65% 45%)" />
          <stop offset="100%" stopColor="hsl(38 60% 35%)" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="34" height="34" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="2"/>
      <rect x="44" y="10" width="21" height="21" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
      <rect x="44" y="31" width="13" height="13" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
      <rect x="57" y="31" width="8" height="8" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1"/>
      <rect x="10" y="50" width="55" height="40" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="3"/>
      <line x1="10" y1="60" x2="65" y2="60" stroke="url(#goldGradient)" strokeWidth="1.5"/>
      <line x1="10" y1="70" x2="65" y2="70" stroke="url(#goldGradient)" strokeWidth="1"/>
      <line x1="10" y1="80" x2="65" y2="80" stroke="url(#goldGradient)" strokeWidth="1"/>
      <line x1="30" y1="50" x2="30" y2="90" stroke="url(#goldGradient)" strokeWidth="1"/>
      <line x1="50" y1="50" x2="50" y2="90" stroke="url(#goldGradient)" strokeWidth="1"/>
      <circle cx="80" cy="70" r="12" stroke="url(#goldGradient)" strokeWidth="2" fill="none"/>
      <circle cx="80" cy="70" r="7" stroke="url(#goldGradient)" strokeWidth="1.5" fill="hsl(40 65% 45% / 0.2)"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Texture overlay */}
      <div className="fixed inset-0 texture-overlay pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-primary/10 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1900px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <FiboLogo className="h-8 w-8" />
                <span className="font-display font-bold text-xl">FiboGrid</span>
              </Link>
              <Badge className="bg-primary/10 text-primary border-primary/30 font-body">Interactive Demo</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-primary/10">
                {isRealTimeEnabled ? (
                  <Pause className="h-4 w-4 text-destructive" />
                ) : (
                  <Play className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-body">Real-time</span>
                <Switch checked={isRealTimeEnabled} onCheckedChange={setIsRealTimeEnabled} />
              </div>
              
              {isRealTimeEnabled && (
                <Badge variant="outline" className="font-mono border-primary/30">
                  {renderTime}ms render
                </Badge>
              )}
              
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={handleAddRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={handleExport}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5 font-body" onClick={handleRefresh}>
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
            <Card className="paper-aged border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 font-display">
                  <Settings className="h-4 w-4 text-primary" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Row Count */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-body">
                    <span>Row Count</span>
                    <Badge variant="outline" className="border-primary/30 font-mono">{rowCount.toLocaleString()}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[100, 1000, 10000, 50000, 100000].map((count) => (
                      <Button
                        key={count}
                        size="sm"
                        variant={rowCount === count ? "default" : "outline"}
                        className={rowCount === count ? "bg-gradient-gold text-primary-foreground shadow-gold" : "border-primary/30 hover:border-primary font-body"}
                        onClick={() => handleRowCountChange(count)}
                      >
                        {count >= 1000 ? `${count / 1000}k` : count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Update Interval */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-body">
                    <span>Update Interval</span>
                    <Badge variant="outline" className="border-primary/30 font-mono">{updateInterval}ms</Badge>
                  </div>
                  <Slider
                    value={[updateInterval]}
                    onValueChange={([v]) => setUpdateInterval(v)}
                    min={50}
                    max={1000}
                    step={50}
                    className="[&_[role=slider]]:bg-gradient-gold [&_[role=slider]]:border-primary"
                  />
                </div>

                {/* Grouping */}
                <div className="space-y-2">
                  <span className="text-sm font-body">Group By</span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={groupByField === undefined ? "default" : "outline"}
                      className={groupByField === undefined ? "bg-gradient-gold text-primary-foreground shadow-gold" : "border-primary/30 hover:border-primary font-body"}
                      onClick={() => setGroupByField(undefined)}
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      None
                    </Button>
                    <Button
                      size="sm"
                      variant={groupByField === 'sector' ? "default" : "outline"}
                      className={groupByField === 'sector' ? "bg-gradient-gold text-primary-foreground shadow-gold" : "border-primary/30 hover:border-primary font-body"}
                      onClick={() => setGroupByField('sector')}
                    >
                      Sector
                    </Button>
                  </div>
                </div>

                {/* Row Numbers */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body">Row Numbers</span>
                  <Switch checked={showRowNumbers} onCheckedChange={setShowRowNumbers} />
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="paper-aged border-primary/10">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rows</span>
                    <span className="font-semibold font-mono">{rowData.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visible</span>
                    <span className="font-semibold font-mono">{visibleRowData.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Columns</span>
                    <span className="font-semibold font-mono">{columns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Real-time</span>
                    <span className={`font-semibold ${isRealTimeEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isRealTimeEnabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Data Grid */}
          <Card className="overflow-hidden border-primary/20 shadow-parchment glow-gold">
            <DataGrid
              rowData={visibleRowData}
              columnDefs={columns}
              getRowId={getRowId}
              rowSelection="multiple"
              height={700}
              showToolbar={true}
              showStatusBar={true}
              showRowNumbers={showRowNumbers}
              pagination={false}
              paginationPageSize={1000}
              groupByFields={groupByField ? [groupByField] : undefined}
              onGridReady={(e) => setGridApi(e.api)}
              onCellValueChanged={(e) => {
                const editedRowId = (e.rowNode.data as StockRow).id;
                setRowData(prev => prev.map(row => 
                  row.id === editedRowId 
                    ? { ...row, [e.column.field]: e.newValue }
                    : row
                ));
              }}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}