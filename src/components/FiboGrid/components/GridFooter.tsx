import React, { useMemo, memo } from 'react';
import { RowNode, ProcessedColumn, PaginationState, FiboGridConfigs, FooterLayoutItem, ZIndexType } from '../types';
import { useGridLocale } from '../context/GridContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { GridPagination } from './GridPagination';
import { GridStatusBar } from './GridStatusBar';

type AggregationMap = Record<string, { sum?: number; avg?: number; min?: number; max?: number; count?: number }>;

const EMPTY_COLUMNS: ProcessedColumn<any>[] = [];

interface GridFooterProps<T> {
    displayedRows: RowNode<T>[];
    totalRows: number;
    selectedCount: number;
    columns: ProcessedColumn<T>[];
    aggregations?: AggregationMap;
    paginationState: PaginationState;
    pageSizeOptions: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    config?: FiboGridConfigs['footer'] & { zIndex?: ZIndexType };
    className?: string;
}

function areFooterLayoutsEqual(
    prev?: FooterLayoutItem[],
    next?: FooterLayoutItem[]
): boolean {
    if (prev === next) return true;
    if (!prev || !next || prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== next[i]) return false;
    }
    return true;
}

function areFooterConfigsEqual(
    prev?: GridFooterProps<unknown>['config'],
    next?: GridFooterProps<unknown>['config']
): boolean {
    if (prev === next) return true;
    if (!prev || !next) return false;
    if (!areFooterLayoutsEqual(prev.layout, next.layout)) return false;
    if (prev.zIndex !== next.zIndex) return false;
    return true;
}

function arePaginationStatesEqual(prev: PaginationState, next: PaginationState): boolean {
    return (
        prev.enabled === next.enabled &&
        prev.currentPage === next.currentPage &&
        prev.pageSize === next.pageSize &&
        prev.totalRows === next.totalRows &&
        prev.totalPages === next.totalPages
    );
}

function areGridFooterPropsEqual<T>(prev: GridFooterProps<T>, next: GridFooterProps<T>): boolean {
    if (prev.displayedRows !== next.displayedRows) return false;
    if (prev.totalRows !== next.totalRows) return false;
    if (prev.selectedCount !== next.selectedCount) return false;
    if (prev.columns !== next.columns) return false;
    if (prev.aggregations !== next.aggregations) return false;
    if (prev.pageSizeOptions !== next.pageSizeOptions) return false;
    if (prev.onPageChange !== next.onPageChange) return false;
    if (prev.onPageSizeChange !== next.onPageSizeChange) return false;
    if (prev.className !== next.className) return false;
    if (!arePaginationStatesEqual(prev.paginationState, next.paginationState)) return false;
    if (!areFooterConfigsEqual(prev.config, next.config)) return false;
    return true;
}

function GridFooterInner<T>({
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
    const locale = useGridLocale();
    const layout: FooterLayoutItem[] = config?.layout || ['pagination', 'status-bar'];
    const hasGranular = layout.some(i => !['pagination', 'status-bar'].includes(i));
    const needsAggregations = layout.includes('status-bar') || layout.includes('status-aggregations');
    const numericColumns = useMemo(
        () => (needsAggregations ? columns.filter(col => col.filterType === 'number' || col.aggFunc) : EMPTY_COLUMNS),
        [columns, needsAggregations]
    );
    const aggData = useMemo(() => {
        if (!needsAggregations) return null;
        if (aggregations) return aggregations;
        if (displayedRows.length === 0 || numericColumns.length === 0) return null;
        const results: AggregationMap = {};
        for (let c = 0; c < numericColumns.length; c++) {
            const col = numericColumns[c]!;
            const field = col.field;
            let sum = 0;
            let count = 0;
            for (let i = 0; i < displayedRows.length; i++) {
                const v = (displayedRows[i].data as any)[field];
                if (typeof v === 'number' && !Number.isNaN(v)) {
                    sum += v;
                    count++;
                }
            }
            if (count > 0) {
                results[field] = { sum, avg: sum / count };
            }
        }
        return results;
    }, [needsAggregations, aggregations, displayedRows, numericColumns]);
    const { currentPage, totalPages, pageSize } = paginationState;
    const startRow = currentPage * pageSize + 1;
    const endRow = Math.min((currentPage + 1) * pageSize, totalRows);
    const renderItem = (item: FooterLayoutItem, index: number) => {
        switch (item) {
            case 'pagination':
                return <GridPagination
                    key={`bp-${index}`}
                    zIndex={config?.zIndex}
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
                    aggregations={aggData ?? undefined}
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

export const GridFooter = memo(GridFooterInner, areGridFooterPropsEqual) as typeof GridFooterInner;
