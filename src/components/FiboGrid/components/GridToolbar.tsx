import React, { useState, useRef, memo } from 'react';
import { ProcessedColumn, GridApi, FilterModel, FiboGridConfigs, HeaderLayoutItem } from '../types';
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
  Filter,
  Rows3,
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
import { useGridLocale } from '../context/GridContext';
import { FilterPanel } from './FilterPanel';

type GridDensity = 'compact' | 'normal' | 'comfortable';

const DEFAULT_LAYOUT: HeaderLayoutItem[] = [
  'search',
  'spacer',
  'custom-actions',
  'columns-button',
  'copy-button',
  'export-button',
  'refresh-button',
];
const DENSITY_CYCLE: GridDensity[] = ['compact', 'normal', 'comfortable'];

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
  density?: GridDensity;
  onDensityChange?: (density: GridDensity) => void;
}

function areGridToolbarPropsEqual<T>(prev: GridToolbarProps<T>, next: GridToolbarProps<T>): boolean {
  if (prev.api !== next.api) return false;
  if (prev.columns !== next.columns) return false;
  if (prev.quickFilterValue !== next.quickFilterValue) return false;
  if (prev.onQuickFilterChange !== next.onQuickFilterChange) return false;
  if (prev.onColumnVisibilityChange !== next.onColumnVisibilityChange) return false;
  if (prev.selectedCount !== next.selectedCount) return false;
  if (prev.totalCount !== next.totalCount) return false;
  if (prev.filterModel !== next.filterModel) return false;
  if (prev.onResetFilters !== next.onResetFilters) return false;
  if (prev.className !== next.className) return false;
  if (prev.headerConfig !== next.headerConfig) return false;
  if (prev.density !== next.density) return false;
  if (prev.onDensityChange !== next.onDensityChange) return false;
  return true;
}

function GridToolbarInner<T>({
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
  density,
  onDensityChange,
}: GridToolbarProps<T>) {
  const locale = useGridLocale();
  const [copied, setCopied] = useState(false);
  const [localSearch, setLocalSearch] = useState(quickFilterValue);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [localDensity, setLocalDensity] = useState<GridDensity>(density ?? 'normal');
  const prevQuickFilterValueRef = useRef(quickFilterValue);
  const prevDensityRef = useRef(density);
  if (quickFilterValue !== prevQuickFilterValueRef.current) {
    prevQuickFilterValueRef.current = quickFilterValue;
    setLocalSearch(quickFilterValue);
  }
  if (density !== undefined && density !== prevDensityRef.current) {
    prevDensityRef.current = density;
    setLocalDensity(density);
  }
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
    api.refresh();
  };
  const cycleDensity = () => {
    const next = DENSITY_CYCLE[(DENSITY_CYCLE.indexOf(localDensity) + 1) % DENSITY_CYCLE.length];
    setLocalDensity(next);
    onDensityChange?.(next);
  };
  const handlePanelFilterChange = (field: string, model: FilterModel | null) => {
    if (model == null) {
      api.setFilterModel(filterModel.filter((filter) => filter.field !== field));
      return;
    }
    const index = filterModel.findIndex((filter) => filter.field === field);
    if (index >= 0) {
      const next = filterModel.slice();
      next[index] = model;
      api.setFilterModel(next);
      return;
    }
    api.setFilterModel([...filterModel, model]);
  };
  const showSearch = headerConfig?.search !== false;
  const showFilterTags = headerConfig?.filterButton !== false;
  const hasActiveFilters = (filterModel.length > 0 || quickFilterValue.length > 0) && showFilterTags;
  const layout = headerConfig?.layout || DEFAULT_LAYOUT;
  const layoutIncludesActiveFilters = layout.includes('active-filters');
  const layoutIncludesDensity = layout.includes('density-button');
  const showDensity = headerConfig?.densityButton === true || layoutIncludesDensity;
  const getFilterLabel = (filter: FilterModel): string => {
    const column = columns.find(c => c.field === filter.field);
    const columnName = column?.headerName || filter.field;
    if (Array.isArray(filter.value)) {
      const count = filter.value.length;
      return locale.toolbar.filterLabelCount(columnName, count);
    }
    return locale.toolbar.filterLabel(columnName, filter.value);
  };
  const renderActiveFilters = (placement: 'bar' | 'inline') => {
    if (!hasActiveFilters) return null;
    return (
      <div
        key="active-filters"
        className={
          placement === 'bar'
            ? 'flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20'
            : 'flex items-center gap-2 shrink-0'
        }
      >
        <span className="text-xs text-muted-foreground font-medium">{locale.toolbar.activeFilters}</span>
        {quickFilterValue && (
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
            <Search className="h-3 w-3" />
            <span>{quickFilterValue}</span>
            <button
              type="button"
              aria-label={locale.aria.clearSearch}
              onClick={() => onQuickFilterChange('')}
              className="ml-1 hover:bg-primary/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {filterModel.map((filter, idx) => (
          <div
            key={`${filter.field}-${idx}`}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
          >
            <span>{getFilterLabel(filter)}</span>
            <button
              type="button"
              aria-label={locale.aria.removeFilter}
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
        {onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            className={placement === 'bar' ? 'h-6 px-2 ml-auto text-xs' : 'h-6 px-2 text-xs'}
            onClick={onResetFilters}
          >
            <FilterX className="h-3 w-3 mr-1" />
            {locale.toolbar.resetAll}
          </Button>
        )}
      </div>
    );
  };
  const densityButton = (
    <Button
      key="density-btn"
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={cycleDensity}
      aria-label={`${locale.header.density.label}: ${locale.header.density[localDensity]}`}
      title={locale.header.density[localDensity]}
    >
      <Rows3 className="h-4 w-4" />
      <span className="ml-1.5 hidden sm:inline">{locale.header.density[localDensity]}</span>
    </Button>
  );
  return (
    <div className="flex flex-col">
      {!layoutIncludesActiveFilters && renderActiveFilters('bar')}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30 w-full overflow-x-auto">
        {layout.map((item, index) => {
          switch (item) {
            case 'search':
              return showSearch && (
                <div key="search" className="relative flex-1 max-w-sm min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={locale.toolbar.searchPlaceholder}
                    aria-label={locale.toolbar.searchPlaceholder}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      handleSearchKeyDown(e);
                    }}
                    className="pl-9 h-8 text-sm"
                  />
                  {quickFilterValue && (
                    <button
                      type="button"
                      aria-label={locale.aria.clearSearch}
                      onClick={() => onQuickFilterChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              );
            case 'spacer':
              return <div key={`spacer-${index}`} className="flex-1" />;
            case 'custom-actions':
              return headerConfig?.customActions && (
                <div key="custom-actions" className="flex items-center gap-2">
                  {headerConfig.customActions}
                </div>
              );
            case 'active-filters':
              return renderActiveFilters('inline');
            case 'filter-button':
              return headerConfig?.filterButton !== false && (
                <Button
                  key="filter-btn"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  aria-label={locale.filterPanel.title}
                  aria-pressed={filterPanelOpen}
                  onClick={() => setFilterPanelOpen((open) => !open)}
                >
                  <Filter className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">{locale.filterPanel.title}</span>
                </Button>
              );
            case 'density-button':
              return showDensity ? densityButton : null;
            case 'columns-button':
              return headerConfig?.columnsButton !== false && (
                <Popover key="columns-btn">
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      aria-label={locale.toolbar.columns}
                    >
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
              );
            case 'copy-button':
              return headerConfig?.copyButton !== false && (
                <Button
                  key="copy-btn"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleCopy}
                  aria-label={copied ? locale.toolbar.copied : locale.toolbar.copy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">{copied ? locale.toolbar.copied : locale.toolbar.copy}</span>
                </Button>
              );
            case 'export-button':
              return headerConfig?.exportButton !== false && (
                <Button
                  key="export-btn"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleExport}
                  aria-label={locale.toolbar.export}
                >
                  <Download className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">{locale.toolbar.export}</span>
                </Button>
              );
            case 'refresh-button':
              return headerConfig?.refreshButton !== false && (
                <Button
                  key="refresh-btn"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleRefresh}
                  aria-label={locale.toolbar.refresh}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              );
            default:
              return null;
          }
        })}
        {showDensity && !layoutIncludesDensity && densityButton}
        {selectedCount > 0 && (
          <div className="text-sm text-muted-foreground px-2 py-1 bg-primary/10 rounded ml-2">
            {locale.toolbar.selectedCount(selectedCount, totalCount)}
          </div>
        )}
      </div>
      {filterPanelOpen && (
        <FilterPanel
          columns={columns}
          filterModel={filterModel}
          onClose={() => setFilterPanelOpen(false)}
          onFilterChange={handlePanelFilterChange}
          onClearAllFilters={() => api.setFilterModel([])}
        />
      )}
    </div>
  );
}

export const GridToolbar = memo(GridToolbarInner, areGridToolbarPropsEqual) as typeof GridToolbarInner;
