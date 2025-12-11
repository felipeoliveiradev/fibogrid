import { useMemo } from 'react';
import { ColumnDef } from 'fibogrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, Split, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { StockRow } from '../data/types';

interface StockColumnParams {
    expandedRows: Set<string>;
    toggleRowExpand: (rowId: string) => void;
    handleSplitRow: (rowId: string) => void;
    hasChildren: (rowId: string) => boolean;
}

export function useStockColumns({ expandedRows, toggleRowExpand, handleSplitRow }: StockColumnParams) {
    return useMemo<ColumnDef<StockRow>[]>(() => [

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
                        {!isChild && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpand(row.id);
                                }}
                                className="p-0.5 hover:bg-accent rounded transition-colors"
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
            cellEditor: 'select',
            cellEditorParams: { values: ['Active', 'Pending', 'Inactive'] },
            cellRenderer: (params) => {
                const row = params.data as StockRow;
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
        { field: 'carro.cor', headerName: 'Car Color', width: 120, editable: true },
        {
            field: 'price',
            headerName: 'Price',
            width: 100,
            sortable: true,
            filterable: true,
            filterType: 'number',
            cellRenderer: (params) => {
                const row = params.data as StockRow;
                if (row.isDetailRow) {
                    return (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 font-medium">
                            Active
                        </Badge>
                    );
                }
                return <span className="font-mono font-semibold">${(params.value as number).toFixed(2)}</span>;
            },
            editable: true,
            cellEditor: 'number',
            cellClass: (params) => params.value < 2 ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500',
            valueSetter: (params) => {
                const newVal = parseFloat(params.newValue);
                if (isNaN(newVal) || newVal < 0) {
                    toast({
                        title: "Validation Error",
                        description: "Price cannot be negative.",
                        variant: "destructive",
                    });
                    return false;
                }
                return true;
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
                if (row.isDetailRow) return null;
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
            cellEditorParams: { values: ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'] },
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
    ], [expandedRows, toggleRowExpand, handleSplitRow]);
}

