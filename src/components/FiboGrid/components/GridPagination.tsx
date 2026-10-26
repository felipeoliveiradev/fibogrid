import React, { useId, memo } from 'react';
import { PaginationState, ZIndexType } from '../types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useGridLocale } from '../context/GridContext';

interface GridPaginationProps {
  pagination: PaginationState;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
  zIndex?: ZIndexType
}

function areGridPaginationPropsEqual(prev: GridPaginationProps, next: GridPaginationProps): boolean {
  if (prev.pageSizeOptions !== next.pageSizeOptions) return false;
  if (prev.onPageChange !== next.onPageChange) return false;
  if (prev.onPageSizeChange !== next.onPageSizeChange) return false;
  if (prev.className !== next.className) return false;
  if (prev.zIndex !== next.zIndex) return false;
  const pp = prev.pagination;
  const np = next.pagination;
  return (
    pp.enabled === np.enabled &&
    pp.currentPage === np.currentPage &&
    pp.pageSize === np.pageSize &&
    pp.totalRows === np.totalRows &&
    pp.totalPages === np.totalPages
  );
}

function GridPaginationInner({
  pagination,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  className,
  zIndex
}: GridPaginationProps) {
  const locale = useGridLocale();
  const rowsPerPageId = useId();
  const { currentPage, totalPages, totalRows, pageSize } = pagination;
  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span id={rowsPerPageId}>{locale.pagination.rowsPerPage}</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-20 h-8" aria-labelledby={rowsPerPageId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={cn("fibogrid fibogrid-select", zIndex?.select ? `z-[${zIndex.select}]` : '', className)}>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {totalRows > 0 ? locale.pagination.pageInfo(startRow, endRow, totalRows) : locale.pagination.zeroRows}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            aria-label={locale.pagination.firstPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label={locale.pagination.previousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            {locale.pagination.pageOf(currentPage + 1, totalPages || 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label={locale.pagination.nextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label={locale.pagination.lastPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const GridPagination = memo(GridPaginationInner, areGridPaginationPropsEqual);
