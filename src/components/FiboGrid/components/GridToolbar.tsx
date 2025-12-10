import React, { useState } from 'react';
import { ProcessedColumn, GridApi, FilterModel, FiboGridConfigs } from '../types';
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
import { useGridContext } from '../context/GridContext';

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
  className?: string;
  headerConfig?: FiboGridConfigs['header'];
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
  className,
  headerConfig,
}: GridToolbarProps<T>) {
  const { locale } = useGridContext<T>()!;
  const [copied, setCopied] = useState(false);
  const [localSearch, setLocalSearch] = useState(quickFilterValue);

  // Sync local search when external prop changes (e.g. clear filter)
  React.useEffect(() => {
    setLocalSearch(quickFilterValue);
  }, [quickFilterValue]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onQuickFilterChange(localSearch);
    }
  };

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

  const showSearch = headerConfig?.search !== false;
  const showFilterTags = headerConfig?.filterButton !== false; // Reuse existing filter tags logic but maybe rename later? Plan said "filterButton", user meant tags usually.
  const hasActiveFilters = (filterModel.length > 0 || quickFilterValue.length > 0) && showFilterTags;

  const getFilterLabel = (filter: FilterModel): string => {
    const column = columns.find(c => c.field === filter.field);
    const columnName = column?.headerName || filter.field;

    if (Array.isArray(filter.value)) {
      const count = filter.value.length;
      return locale.toolbar.filterLabelCount(columnName, count);
    }

    return locale.toolbar.filterLabel(columnName, filter.value);
  };

  return (
    <div className="flex flex-col">
      {/* Active Filters Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
          <span className="text-xs text-muted-foreground font-medium">{locale.toolbar.activeFilters}</span>

          {/* Quick Filter Tag */}
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

          {/* Column Filters Tags */}
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

          {/* Reset All Button */}
          {onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 ml-auto text-xs"
              onClick={onResetFilters}
            >
              <FilterX className="h-3 w-3 mr-1" />
              {locale.toolbar.resetAll}
            </Button>
          )}
        </div>
      )}

      {/* Search and Tools Row */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30">
        {/* Search Input */}
        {showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={locale.toolbar.searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
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
        )}

        {/* Selection Count */}
        {selectedCount > 0 && (
          <div className="text-sm text-muted-foreground px-2 py-1 bg-primary/10 rounded">
            {locale.toolbar.selectedCount(selectedCount, totalCount)}
          </div>
        )}

        {/* Custom Actions (Middle/Right aligned) */}
        {headerConfig?.customActions && (
          <div className="flex items-center gap-2 ml-auto">
            {headerConfig.customActions}
          </div>
        )}

        {/* Toolbar Buttons */}
        <div className={cn("flex items-center gap-1", !headerConfig?.customActions && "ml-auto")}>
          {/* Columns Toggle */}
          {headerConfig?.columnsButton !== false && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Columns className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">{locale.toolbar.columns}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("fibogrid w-56 p-0 fibogrid-popover-content bg-popover border-border", className)} align="end">
                <div className="p-2 fibogrid-popover-content-header">
                  <span className="text-sm font-medium">{locale.toolbar.toggleColumns}</span>
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
                    {locale.toolbar.showAll}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() =>
                      columns.slice(2).forEach((c) => onColumnVisibilityChange(c.field, false))
                    }
                  >
                    {locale.toolbar.hideAll}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Copy Button */}
          {headerConfig?.copyButton !== false && (
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
              <span className="ml-1.5 hidden sm:inline">{copied ? locale.toolbar.copied : locale.toolbar.copy}</span>
            </Button>
          )}

          {/* Export Button */}
          {headerConfig?.exportButton !== false && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">{locale.toolbar.export}</span>
            </Button>
          )}

          {/* Refresh Button */}
          {headerConfig?.refreshButton !== false && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
