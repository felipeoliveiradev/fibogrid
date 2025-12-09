import React, { useState } from 'react';
import { ProcessedColumn, GridApi, FilterModel } from '../types';
import { cn } from '@/lib/utils';
import {
  Search,
  Download,
  Columns,
  RefreshCw,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  FilterX,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GridToolbarProps<T> {
  api: GridApi<T>;
  columns: ProcessedColumn<T>[];
  quickFilterValue: string;
  onQuickFilterChange: (value: string) => void;
  onColumnVisibilityChange: (field: string, visible: boolean) => void;
  selectedCount: number;
  totalCount: number;
  filterModel?: FilterModel[];
  onResetFilters?: () => void;
}

export function GridToolbar<T>({
  api,
  columns,
  quickFilterValue,
  onQuickFilterChange,
  onColumnVisibilityChange,
  selectedCount,
  totalCount,
  filterModel = [],
  onResetFilters,
}: GridToolbarProps<T>) {
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    api.exportToCsv({ fileName: 'data-export.csv' });
  };

  const handleCopy = async () => {
    await api.copyToClipboard(true);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    api.refreshCells();
  };

  const hasActiveFilters = filterModel.length > 0 || quickFilterValue.length > 0;
  
  const getFilterLabel = (filter: FilterModel): string => {
    const column = columns.find(c => c.field === filter.field);
    const columnName = column?.headerName || filter.field;
    
    if (Array.isArray(filter.value)) {
      const count = filter.value.length;
      return `${columnName}: ${count} selected`;
    }
    
    return `${columnName}: ${filter.value}`;
  };

  return (
    <div className="flex flex-col">
      {}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
          <span className="text-xs text-muted-foreground font-medium">Active Filters:</span>
          
          {}
          {quickFilterValue && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              <Search className="h-3 w-3" />
              <span>{quickFilterValue}</span>
              <button
                onClick={() => onQuickFilterChange('')}
                className="ml-1 hover:bg-primary/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {}
          {filterModel.map((filter, idx) => (
            <div
              key={`${filter.field}-${idx}`}
              className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
            >
              <span>{getFilterLabel(filter)}</span>
              <button
                onClick={() => {
                  const newFilters = filterModel.filter((_, i) => i !== idx);
                  api.setFilterModel(newFilters);
                }}
                className="ml-1 hover:bg-primary/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {}
          {onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 ml-auto text-xs"
              onClick={onResetFilters}
            >
              <FilterX className="h-3 w-3 mr-1" />
              Reset All
            </Button>
          )}
        </div>
      )}
      
      {}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30">
      {}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick filter..."
          value={quickFilterValue}
          onChange={(e) => onQuickFilterChange(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
        {quickFilterValue && (
          <button
            onClick={() => onQuickFilterChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {}
      {selectedCount > 0 && (
        <div className="text-sm text-muted-foreground px-2 py-1 bg-primary/10 rounded">
          {selectedCount} of {totalCount} selected
        </div>
      )}

      <div className="flex items-center gap-1 ml-auto">
        {}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Columns className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Columns</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0 fibogrid-popover-content" align="end">
            <div className="p-2 fibogrid-popover-content-header">
              <span className="text-sm font-medium">Toggle Columns</span>
            </div>
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {columns.map((col) => (
                  <label
                    key={col.field}
                    className="flex items-center gap-2 px-2 py-1.5 fibogrid-popover-content-item cursor-pointer"
                  >
                    <Checkbox
                      checked={!col.hide}
                      onCheckedChange={(checked) =>
                        onColumnVisibilityChange(col.field, !!checked)
                      }
                    />
                    <span className="text-sm flex-1 truncate">{col.headerName}</span>
                    {col.hide ? (
                      <EyeOff className="h-3 w-3 fibogrid-column-panel-icon" />
                    ) : (
                      <Eye className="h-3 w-3 fibogrid-column-panel-icon" />
                    )}
                  </label>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 fibogrid-popover-content-footer flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => columns.forEach((c) => onColumnVisibilityChange(c.field, true))}
              >
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() =>
                  columns.slice(2).forEach((c) => onColumnVisibilityChange(c.field, false))
                }
              >
                Hide All
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-1.5 hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </Button>

        {}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Export</span>
        </Button>

        {}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
    </div>
  );
}
