import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProcessedColumn, FilterModel } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, X, Search, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VirtualFilterList } from './VirtualFilterList';
import { useGridContext } from '../context/GridContext';
interface FilterPopoverProps<T> {
  column: ProcessedColumn<T>;
  currentFilter?: FilterModel;
  onFilterChange: (filter: FilterModel | null) => void;
  onClose: () => void;
  allValues?: any[];
  onSort?: (direction: 'asc' | 'desc') => void;
  anchorRect?: DOMRect | null;
  containerRef?: React.RefObject<HTMLDivElement>;
  enableVirtualization?: boolean;
  className?: string;
}
export function FilterPopover<T>({
  column,
  currentFilter,
  onFilterChange,
  onClose,
  allValues = [],
  onSort,
  anchorRect,
  containerRef,
  enableVirtualization = true,
  className,
}: FilterPopoverProps<T>) {
  const { locale } = useGridContext<T>()!;
  const popoverRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(() => scalarFilterValue(currentFilter?.value));
  const [betweenRange, setBetweenRange] = useState<[string, string]>(() => betweenFilterValue(currentFilter?.value));
  const [operator, setOperator] = useState<string>(currentFilter?.operator ?? 'contains');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(() => new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const filterType = column.filterType || 'text';
  const operators = getOperatorsForType(filterType, locale);
  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    allValues.forEach(v => {
      if (v != null) {
        values.add(String(v));
      }
    });
    return Array.from(values).sort();
  }, [allValues]);
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    const needle = searchTerm.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(needle));
  }, [uniqueValues, searchTerm]);
  useEffect(() => {
    if (uniqueValues.length === 0) return;
    if (!isInitialized) {
      if (currentFilter?.operator !== 'between' && currentFilter?.value && Array.isArray(currentFilter.value)) {
        setSelectedValues(new Set(currentFilter.value.map(String)));
        setSelectAll(currentFilter.value.length === uniqueValues.length);
      } else {
        setSelectedValues(new Set(uniqueValues));
        setSelectAll(true);
      }
      setIsInitialized(true);
    }
  }, [uniqueValues, currentFilter, isInitialized]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [onClose]);
  const handleApplyCondition = () => {
    if (operator === 'between') {
      const low = betweenRange[0].trim();
      const high = betweenRange[1].trim();
      if (low === '' || high === '') {
        return;
      }
      onFilterChange({
        field: column.field,
        filterType,
        value: [coerceBetweenBound(filterType, low), coerceBetweenBound(filterType, high)],
        operator: 'between',
      });
      onClose();
      return;
    }
    if (value === '' || value == null) {
      onFilterChange(null);
    } else {
      onFilterChange({
        field: column.field,
        filterType,
        value,
        operator: operator as any,
      });
    }
    onClose();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCondition();
    }
  };
  const handleApplyValues = () => {
    if (selectAll) {
      onFilterChange(null);
    } else if (selectedValues.size === 0) {
      onFilterChange({
        field: column.field,
        filterType: 'select',
        value: [],
        operator: 'equals',
      });
    } else {
      onFilterChange({
        field: column.field,
        filterType: 'select',
        value: Array.from(selectedValues),
        operator: 'equals',
      });
    }
    onClose();
  };
  const handleClear = () => {
    setValue('');
    setBetweenRange(['', '']);
    setSelectedValues(new Set(uniqueValues));
    setSelectAll(true);
    onFilterChange(null);
    onClose();
  };
  const toggleValue = (val: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedValues(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(val)) {
        newSelected.delete(val);
      } else {
        newSelected.add(val);
      }
      const allSelected = newSelected.size === uniqueValues.length;
      setSelectAll(allSelected);
      return newSelected;
    });
  };
  const toggleAll = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (selectAll) {
      setSelectedValues(new Set());
      setSelectAll(false);
    } else {
      setSelectedValues(new Set(uniqueValues));
      setSelectAll(true);
    }
  };
  const style = useMemo(() => {
    if (!anchorRect) return { top: 0, left: 0 };
    const containerRect = containerRef?.current?.getBoundingClientRect();
    if (containerRect) {
      return {
        position: 'absolute' as const,
        top: anchorRect.bottom - containerRect.top + 4,
        left: Math.max(0, anchorRect.left - containerRect.left),
      };
    }
    return {
      position: 'fixed' as const,
      top: anchorRect.bottom + 4,
      left: Math.max(8, anchorRect.left),
    };
  }, [anchorRect, containerRef]);
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`${column.filterLabel || column.headerName}. ${locale.filter.advancedFilter}`}
      className="w-80 bg-popover border border-border rounded-lg shadow-xl fibogrid-z-filter-popover"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col">
        { }
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{column.filterLabel || column.headerName}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose} aria-label={locale.aria.close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        { }
        {onSort && (
          <div className="flex gap-1 px-3 py-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2"
              onClick={() => {
                onSort('asc');
                onClose();
              }}
            >
              <SortAsc className="h-4 w-4" />
              {locale.columnMenu.sortAsc}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2"
              onClick={() => {
                onSort('desc');
                onClose();
              }}
            >
              <SortDesc className="h-4 w-4" />
              {locale.columnMenu.sortDesc}
            </Button>
          </div>
        )}
        <Tabs defaultValue="values" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border bg-transparent h-9">
            <TabsTrigger value="values" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
              {locale.filter.values}
            </TabsTrigger>
            <TabsTrigger value="condition" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
              {locale.filter.condition}
            </TabsTrigger>
          </TabsList>
          { }
          <TabsContent value="values" className="mt-0">
            <div className="p-3 space-y-2">
              { }
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={firstFieldRef}
                  placeholder={locale.filter.searchPlaceholder}
                  aria-label={locale.filter.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pl-8 h-8"
                />
              </div>
              { }
              <label
                className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
              >
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={() => toggleAll()}
                />
                <span className="text-sm font-medium">{locale.filter.selectAll}</span>
              </label>
              { }
              {enableVirtualization ? (
                <VirtualFilterList
                  values={filteredValues}
                  selectedValues={selectedValues}
                  onToggle={toggleValue}
                  height={192}
                  itemHeight={36}
                  overscan={5}
                />
              ) : (
                <ScrollArea className="h-48 border border-border rounded bg-background">
                  <div className="p-1">
                    {filteredValues.map((val) => (
                      <label
                        key={val}
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedValues.has(val)}
                          onCheckedChange={() => toggleValue(val)}
                        />
                        <span className="text-sm truncate">{val || locale.filter.blank}</span>
                      </label>
                    ))}
                    {filteredValues.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        {locale.filter.noValues}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
              { }
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleClear}>
                  {locale.filter.clear}
                </Button>
                <Button className="flex-1" onClick={handleApplyValues}>
                  {locale.filter.apply}
                </Button>
              </div>
            </div>
          </TabsContent>
          { }
          <TabsContent value="condition" className="mt-0">
            <div className="p-3 space-y-3">
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn("fibogrid bg-popover border border-border fibogrid-z-popover-nested", className)}>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {operator === 'between'
                ? renderBetweenInputs(filterType, betweenRange, setBetweenRange, handleKeyDown, locale)
                : renderInput(filterType, value, setValue, handleKeyDown, locale, className)}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleClear}>
                  {locale.filter.clear}
                </Button>
                <Button className="flex-1" onClick={handleApplyCondition}>
                  {locale.filter.apply}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function getOperatorsForType(type: string, locale: import('../locales/types').FiboGridLocale) {
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
function scalarFilterValue(raw: unknown): any {
  if (Array.isArray(raw)) return '';
  return raw ?? '';
}
function betweenFilterValue(raw: unknown): [string, string] {
  if (Array.isArray(raw) && raw.length === 2) {
    return [raw[0] == null ? '' : String(raw[0]), raw[1] == null ? '' : String(raw[1])];
  }
  return ['', ''];
}
function coerceBetweenBound(filterType: string, raw: string): string | number {
  if (filterType !== 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : raw;
}
function renderBetweenInputs(
  type: string,
  range: [string, string],
  onChange: (range: [string, string]) => void,
  onKeyDown: (e: React.KeyboardEvent) => void,
  locale: import('../locales/types').FiboGridLocale,
) {
  const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';
  const placeholder = locale.filter.placeholder.value;
  const update = (index: 0 | 1, next: string) => {
    const nextRange: [string, string] = [range[0], range[1]];
    nextRange[index] = next;
    onChange(nextRange);
  };
  const handleKey = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    onKeyDown(e);
  };
  return (
    <div className="flex gap-2">
      <Input
        type={inputType}
        placeholder={placeholder}
        aria-label="Min"
        value={range[0]}
        onChange={(e) => update(0, e.target.value)}
        onKeyDown={handleKey}
        className="h-8"
      />
      <Input
        type={inputType}
        placeholder={placeholder}
        aria-label="Max"
        value={range[1]}
        onChange={(e) => update(1, e.target.value)}
        onKeyDown={handleKey}
        className="h-8"
      />
    </div>
  );
}
function renderInput(
  type: string,
  value: any,
  onChange: (value: any) => void,
  onKeyDown: (e: React.KeyboardEvent) => void,
  locale: import('../locales/types').FiboGridLocale,
  className?: string
) {
  switch (type) {
    case 'number':
      return (
        <Input
          type="number"
          placeholder={locale.filter.placeholder.value}
          aria-label={locale.filter.placeholder.value}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-8"
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-8"
        />
      );
    case 'boolean':
      return (
        <Select value={String(value)} onValueChange={(v) => onChange(v === 'true')}>
          <SelectTrigger className="h-8" onKeyDown={onKeyDown}>
            <SelectValue placeholder={locale.filter.placeholder.select} />
          </SelectTrigger>
          <SelectContent className={cn("fibogrid bg-popover border border-border fibogrid-z-popover-nested", className)}>
            <SelectItem value="true">{locale.filter.boolean.true}</SelectItem>
            <SelectItem value="false">{locale.filter.boolean.false}</SelectItem>
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          placeholder={locale.filter.placeholder.value}
          aria-label={locale.filter.placeholder.value}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            onKeyDown(e);
          }}
          className="h-8"
        />
      );
  }
}
