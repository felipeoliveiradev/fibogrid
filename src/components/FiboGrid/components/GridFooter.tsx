import React from 'react';
import { RowNode, ProcessedColumn, PaginationState, FiboGridConfigs, FooterLayoutItem } from '../types';
import { useGridContext } from '../context/GridContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { GridPagination } from './GridPagination';
import { GridStatusBar } from './GridStatusBar';

interface GridFooterProps<T> {
    displayedRows: RowNode<T>[];
    totalRows: number;
    selectedCount: number;
    columns: ProcessedColumn<T>[];
    aggregations?: Record<string, { sum?: number; avg?: number; min?: number; max?: number; count?: number }>;
    paginationState: PaginationState;
    pageSizeOptions: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    config?: FiboGridConfigs['footer'];
    className?: string;
}

export function GridFooter<T>({
    displayedRows,
    totalRows,
    selectedCount,
    columns,
    aggregations,
    paginationState,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
    config,
    className,
}: GridFooterProps<T>) {
    const { locale } = useGridContext<T>()!;
    const layout: FooterLayoutItem[] = config?.layout || ['pagination', 'status-bar'];
    const hasGranular = layout.some(i => !['pagination', 'status-bar'].includes(i));

    const numericColumns = columns.filter(col => col.filterType === 'number' || col.aggFunc);
    const aggData = aggregations || (() => {
        if (displayedRows.length === 0) return null;
        const results: Record<string, any> = {};
        numericColumns.forEach((col) => {
            const values = displayedRows
                .map((row) => (row.data as any)[col.field])
                .filter((v) => typeof v === 'number' && !isNaN(v));
            if (values.length > 0) {
                results[col.field] = {
                    sum: values.reduce((a, b) => a + b, 0),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                };
            }
        });
        return results;
    })();

    const { currentPage, totalPages, pageSize } = paginationState;
    const startRow = currentPage * pageSize + 1;
    const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

    const renderItem = (item: FooterLayoutItem, index: number) => {
        switch (item) {
            case 'pagination':
                return <GridPagination
                    key={`bp-${index}`}
                    pagination={paginationState}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    className="border-none bg-transparent"
                />;

            case 'status-bar':
                return <GridStatusBar
                    key={`bs-${index}`}
                    displayedRows={displayedRows}
                    totalRows={totalRows}
                    selectedCount={selectedCount}
                    columns={columns}
                />;

            case 'spacer':
                return <div key={`sp-${index}`} className="flex-1" />;

            case 'pagination-page-size':
                return (
                    <div key={`pps-${index}`} className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                        <span>{locale.pagination.rowsPerPage}</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => onPageSizeChange(parseInt(value))}
                        >
                            <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'pagination-info':
                return (
                    <span key={`pi-${index}`} className="text-sm text-muted-foreground whitespace-nowrap mr-4">
                        {totalRows > 0 ? locale.pagination.pageInfo(startRow, endRow, totalRows) : locale.pagination.zeroRows}
                    </span>
                );

            case 'pagination-controls':
                return (
                    <div key={`pc-${index}`} className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(0)} disabled={currentPage === 0}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2 min-w-[3rem] text-center">
                            {locale.pagination.pageOf(currentPage + 1, totalPages || 1)}
                        </span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                );

            case 'status-info':
                return (
                    <span key={`si-${index}`} className="text-xs text-muted-foreground mr-4">
                        <strong className="text-foreground">{displayedRows.length.toLocaleString()}</strong> {locale.statusBar.rows}
                    </span>
                );

            case 'status-selected':
                return selectedCount > 0 && (
                    <span key={`ss-${index}`} className="px-2 py-0.5 bg-primary/10 rounded text-xs text-primary mr-4">
                        {locale.statusBar.selected(selectedCount)}
                    </span>
                );

            case 'status-aggregations':
                return aggData && Object.keys(aggData).length > 0 && (
                    <div key={`sa-${index}`} className="flex items-center gap-4 text-xs text-muted-foreground">
                        {Object.entries(aggData).slice(0, 3).map(([field, values]: any) => {
                            const col = columns.find((c) => c.field === field);
                            return (
                                <div key={field} className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{col?.headerName}:</span>
                                    <span>{locale.statusBar.aggregations.sum} {values.sum?.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className={cn(
            "w-full",
            hasGranular ? "flex items-center flex-wrap px-4 py-2 border-t border-border bg-muted/30 gap-2" : "flex flex-col",
            className
        )}>
            {layout.map((item, i) => renderItem(item, i))}
        </div>
    );
}
