import React, { useState } from 'react';
import { ProcessedColumn, FilterModel } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search, Filter, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps<T> {
  columns: ProcessedColumn<T>[];
  filterModel: FilterModel[];
  onClose: () => void;
  onFilterChange: (filter: FilterModel | null) => void;
  onClearAllFilters: () => void;
}

export function FilterPanel<T>({
  columns,
  filterModel,
  onClose,
  onFilterChange,
  onClearAllFilters,
}: FilterPanelProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filterableColumns = columns.filter(
    col => col.filterable !== false && !col.hide
  );

  const filteredColumns = filterableColumns.filter(col =>
    col.headerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilterForColumn = (field: string) => {
    return filterModel.find(f => f.field === field);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-72 bg-popover border-l border-border shadow-xl fibogrid-z-filter-panel flex flex-col">
      { }
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
          {filterModel.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {filterModel.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      { }
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      { }
      {filterModel.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={onClearAllFilters}
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-1">
            {filterModel.map(filter => {
              const column = columns.find(c => c.field === filter.field);
              return (
                <div
                  key={filter.field}
                  className="flex items-center justify-between px-2 py-1 bg-muted rounded text-sm"
                >
                  <span className="truncate flex-1">
                    {column?.filterLabel || column?.headerName}: {String(filter.value).substring(0, 15)}
                  </span>
                  <button
                    onClick={() => onFilterChange(null)}
                    className="ml-2 p-0.5 hover:bg-muted-foreground/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      { }
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredColumns.map(column => {
            const filter = getFilterForColumn(column.field);

            return (
              <div
                key={column.field}
                className={cn(
                  'flex items-center gap-2 px-2 py-2 rounded hover:bg-muted cursor-pointer',
                  filter && 'bg-primary/10'
                )}
              >
                <Filter className={cn(
                  'h-4 w-4',
                  filter ? 'text-primary' : 'text-muted-foreground'
                )} />

                <span className="flex-1 text-sm truncate">
                  {column.filterLabel || column.headerName}
                </span>

                {filter && (
                  <button
                    onClick={() => onFilterChange(null)}
                    className="p-1 hover:bg-muted-foreground/20 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
