import React, { useEffect, useState } from 'react';
import { ProcessedColumn, FilterModel, FilterType } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Search, Filter, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGridLocale } from '../context/GridContext';
import type { FiboGridLocale } from '../locales/types';
interface FilterPanelProps<T> {
  columns: ProcessedColumn<T>[];
  filterModel: FilterModel[];
  onClose: () => void;
  onFilterChange: (field: string, model: FilterModel | null) => void;
  onClearAllFilters: () => void;
}
export function FilterPanel<T>({
  columns,
  filterModel,
  onClose,
  onFilterChange,
  onClearAllFilters,
}: FilterPanelProps<T>) {
  const locale = useGridLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [openField, setOpenField] = useState<string | null>(null);
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
          <h3 className="font-semibold">{locale.filterPanel.title}</h3>
          {filterModel.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {filterModel.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label={locale.aria.close}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      { }
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={locale.columnPanel.search}
            aria-label={locale.columnPanel.search}
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
            <span className="text-sm font-medium">{locale.toolbar.activeFilters}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={onClearAllFilters}
            >
              {locale.toolbar.resetAll}
            </Button>
          </div>
          <div className="space-y-1">
            {filterModel.map(filter => {
              const column = columns.find(c => String(c.filterField || c.field) === filter.field);
              return (
                <div
                  key={filter.field}
                  className="flex items-center justify-between px-2 py-1 bg-muted rounded text-sm"
                >
                  <span className="truncate flex-1">
                    {column?.filterLabel || column?.headerName}: {String(filter.value).substring(0, 15)}
                  </span>
                  <button
                    type="button"
                    aria-label={locale.aria.removeFilter}
                    onClick={() => onFilterChange(filter.field, null)}
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
            const filterKey = String(column.filterField || column.field);
            const filter = getFilterForColumn(filterKey);
            const isOpen = openField === column.field;
            return (
              <div key={column.field}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  className={cn(
                    'flex items-center gap-2 px-2 py-2 rounded hover:bg-muted cursor-pointer',
                    filter && 'bg-primary/10'
                  )}
                  onClick={() => setOpenField(isOpen ? null : column.field)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    setOpenField(isOpen ? null : column.field);
                  }}
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
                      type="button"
                      aria-label={locale.aria.removeFilter}
                      onClick={(event) => {
                        event.stopPropagation();
                        onFilterChange(column.field, null);
                      }}
                      className="p-1 hover:bg-muted-foreground/20 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  )}
                </div>
                {isOpen && (
                  <ColumnFilterEditor
                    column={column}
                    filter={filter}
                    onApply={(model) => onFilterChange(column.field, model)}
                    onClear={() => onFilterChange(column.field, null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function ColumnFilterEditor<T>({
  column,
  filter,
  onApply,
  onClear,
}: {
  column: ProcessedColumn<T>;
  filter?: FilterModel;
  onApply: (model: FilterModel) => void;
  onClear: () => void;
}) {
  const locale = useGridLocale();
  const filterType: FilterType = column.filterType || 'text';
  const isList = filterType === 'select' && typeof column.filterOptions === 'function';
  const operators = operatorsFor(filterType, locale);
  const [operator, setOperator] = useState<string>(
    () => filter?.operator || (isList ? 'equals' : operators[0]?.value || 'contains'),
  );
  const [value, setValue] = useState(() => scalarFilterValue(filter?.value));
  const [between, setBetween] = useState<[string, string]>(() => betweenFilterValue(filter?.value));
  const filterKey = String(column.filterField || column.field);

  const apply = () => {
    if (filterType === 'boolean') {
      if (value !== 'true' && value !== 'false') return;
      onApply({
        field: filterKey,
        filterType,
        operator: 'equals',
        value: value === 'true',
      });
      return;
    }
    if (!isList && operator === 'between') {
      const low = between[0].trim();
      const high = between[1].trim();
      if (!low || !high) return;
      onApply({
        field: filterKey,
        filterType,
        operator: 'between',
        value: [coerceBound(filterType, low), coerceBound(filterType, high)],
      });
      return;
    }
    const text = String(value ?? '').trim();
    if (!text) {
      onClear();
      return;
    }
    onApply({
      field: filterKey,
      filterType,
      operator: (isList ? 'equals' : operator) as FilterModel['operator'],
      value: !isList && filterType === 'number' ? coerceBound(filterType, text) : text,
    });
  };

  const stopKeys = (event: React.KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      apply();
    }
  };

  return (
    <div
      className="px-2 pb-2 space-y-2"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {!isList && filterType !== 'boolean' && (
        <Select value={operator} onValueChange={setOperator}>
          <SelectTrigger className="h-8" aria-label={locale.filter.condition}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="fibogrid bg-popover border border-border fibogrid-z-popover-nested">
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {filterType === 'boolean' ? (
        <Select value={value === 'true' || value === 'false' ? value : undefined} onValueChange={setValue}>
          <SelectTrigger className="h-8" aria-label={locale.filter.placeholder.select}>
            <SelectValue placeholder={locale.filter.placeholder.select} />
          </SelectTrigger>
          <SelectContent className="fibogrid bg-popover border border-border fibogrid-z-popover-nested">
            <SelectItem value="true">{locale.filter.boolean.true}</SelectItem>
            <SelectItem value="false">{locale.filter.boolean.false}</SelectItem>
          </SelectContent>
        </Select>
      ) : operator === 'between' ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            type={inputTypeFor(filterType)}
            aria-label="Min"
            placeholder={locale.filter.placeholder.value}
            value={between[0]}
            onChange={(event) => setBetween([event.target.value, between[1]])}
            onKeyDown={stopKeys}
            className="h-8"
          />
          <Input
            type={inputTypeFor(filterType)}
            aria-label="Max"
            placeholder={locale.filter.placeholder.value}
            value={between[1]}
            onChange={(event) => setBetween([between[0], event.target.value])}
            onKeyDown={stopKeys}
            className="h-8"
          />
        </div>
      ) : isList ? (
        <ListFilterCombobox
          load={column.filterOptions!}
          value={value}
          onChange={setValue}
          searchLabel={locale.columnPanel.search}
        />
      ) : (
        <Input
          autoFocus
          type={inputTypeFor(filterType)}
          aria-label={locale.filter.placeholder.value}
          placeholder={locale.filter.placeholder.value}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={stopKeys}
          className="h-8"
        />
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 h-8" onClick={onClear}>
          {locale.filter.clear}
        </Button>
        <Button type="button" className="flex-1 h-8" onClick={apply}>
          {locale.filter.apply}
        </Button>
      </div>
    </div>
  );
}

function ListFilterCombobox({
  load,
  value,
  onChange,
  searchLabel,
}: {
  load: (search: string) => Promise<Array<{ value: string; label: string }>>;
  value: string;
  onChange: (value: string) => void;
  searchLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      load(query)
        .then((next) => {
          if (!cancelled) setItems(next);
        })
        .catch(() => {
          if (!cancelled) setItems([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, load]);

  return (
    <div className="space-y-1">
      <Input
        autoFocus
        value={query}
        aria-label={searchLabel}
        placeholder={searchLabel}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        className="h-8"
      />
      <div className="max-h-40 overflow-auto rounded border border-border">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              'block w-full truncate px-2 py-1 text-left text-xs hover:bg-muted',
              item.value === value && 'bg-primary/10',
            )}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
        {!loading && items.length === 0 && (
          <div className="px-2 py-2 text-xs text-muted-foreground">Sin resultados</div>
        )}
      </div>
    </div>
  );
}

function operatorsFor(type: FilterType, locale: FiboGridLocale) {
  switch (type) {
    case 'number':
      return [
        { value: 'equals', label: locale.filter.operators.equals },
        { value: 'greaterThan', label: locale.filter.operators.greaterThan },
        { value: 'lessThan', label: locale.filter.operators.lessThan },
        { value: 'between', label: locale.filter.operators.between },
      ];
    case 'date':
      return [
        { value: 'equals', label: locale.filter.operators.equals },
        { value: 'greaterThan', label: locale.filter.operators.after },
        { value: 'lessThan', label: locale.filter.operators.before },
        { value: 'between', label: locale.filter.operators.between },
      ];
    default:
      return [
        { value: 'contains', label: locale.filter.operators.contains },
        { value: 'equals', label: locale.filter.operators.equals },
        { value: 'startsWith', label: locale.filter.operators.startsWith },
        { value: 'endsWith', label: locale.filter.operators.endsWith },
      ];
  }
}

function inputTypeFor(type: FilterType): 'text' | 'number' | 'date' {
  if (type === 'number') return 'number';
  if (type === 'date') return 'date';
  return 'text';
}

function scalarFilterValue(raw: unknown): string {
  if (Array.isArray(raw) || raw == null) return '';
  return String(raw);
}

function betweenFilterValue(raw: unknown): [string, string] {
  if (Array.isArray(raw) && raw.length === 2) {
    return [raw[0] == null ? '' : String(raw[0]), raw[1] == null ? '' : String(raw[1])];
  }
  return ['', ''];
}

function coerceBound(filterType: FilterType, raw: string): string | number {
  if (filterType !== 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : raw;
}
