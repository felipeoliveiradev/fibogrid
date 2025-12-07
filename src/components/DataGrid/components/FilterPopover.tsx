import React, { useState, useMemo, useEffect } from 'react';
import { ProcessedColumn, FilterModel, RowNode } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, X, Search, Check, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPopoverProps<T> {
  column: ProcessedColumn<T>;
  currentFilter?: FilterModel;
  onFilterChange: (filter: FilterModel | null) => void;
  children: React.ReactNode;
  // For value list
  allValues?: any[];
  onSort?: (direction: 'asc' | 'desc') => void;
}

export function FilterPopover<T>({
  column,
  currentFilter,
  onFilterChange,
  children,
  allValues = [],
  onSort,
}: FilterPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(true); // Open by default when rendered
  const [value, setValue] = useState(currentFilter?.value ?? '');
  const [operator, setOperator] = useState<string>(currentFilter?.operator ?? 'contains');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  const filterType = column.filterType || 'text';
  const operators = getOperatorsForType(filterType);

  // Get unique values for the column
  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    allValues.forEach(v => {
      if (v != null) {
        values.add(String(v));
      }
    });
    return Array.from(values).sort();
  }, [allValues]);

  // Filter values by search term
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(v => 
      v.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  // Initialize selected values
  useEffect(() => {
    if (currentFilter?.value && Array.isArray(currentFilter.value)) {
      setSelectedValues(new Set(currentFilter.value.map(String)));
      setSelectAll(false);
    } else {
      setSelectedValues(new Set(uniqueValues));
      setSelectAll(true);
    }
  }, [uniqueValues, currentFilter]);

  const handleApplyCondition = () => {
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
    setIsOpen(false);
  };

  const handleApplyValues = () => {
    if (selectAll || selectedValues.size === uniqueValues.length) {
      onFilterChange(null);
    } else if (selectedValues.size === 0) {
      // Filter everything out
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
    setIsOpen(false);
  };

  const handleClear = () => {
    setValue('');
    setSelectedValues(new Set(uniqueValues));
    setSelectAll(true);
    onFilterChange(null);
    setIsOpen(false);
  };

  const toggleValue = (val: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(val)) {
      newSelected.delete(val);
    } else {
      newSelected.add(val);
    }
    setSelectedValues(newSelected);
    setSelectAll(newSelected.size === uniqueValues.length);
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectedValues(new Set());
      setSelectAll(false);
    } else {
      setSelectedValues(new Set(uniqueValues));
      setSelectAll(true);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-popover border border-border shadow-lg z-50" 
        align="start"
        sideOffset={5}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{column.headerName}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Options */}
          {onSort && (
            <div className="flex gap-1 px-3 py-2 border-b border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 justify-start gap-2"
                onClick={() => {
                  onSort('asc');
                  setIsOpen(false);
                }}
              >
                <SortAsc className="h-4 w-4" />
                Sort A to Z
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 justify-start gap-2"
                onClick={() => {
                  onSort('desc');
                  setIsOpen(false);
                }}
              >
                <SortDesc className="h-4 w-4" />
                Sort Z to A
              </Button>
            </div>
          )}

          <Tabs defaultValue="values" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-9">
              <TabsTrigger value="values" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Values
              </TabsTrigger>
              <TabsTrigger value="condition" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Condition
              </TabsTrigger>
            </TabsList>

            {/* Values Tab - Excel-like checkbox list */}
            <TabsContent value="values" className="mt-0">
              <div className="p-3 space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>

                {/* Select All */}
                <div 
                  className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
                  onClick={toggleAll}
                >
                  <Checkbox 
                    checked={selectAll} 
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm font-medium">(Select All)</span>
                </div>

                {/* Value List */}
                <ScrollArea className="h-48 border border-border rounded">
                  <div className="p-1">
                    {filteredValues.map((val) => (
                      <div
                        key={val}
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => toggleValue(val)}
                      >
                        <Checkbox 
                          checked={selectedValues.has(val)}
                          onCheckedChange={() => toggleValue(val)}
                        />
                        <span className="text-sm truncate">{val || '(Blank)'}</span>
                      </div>
                    ))}
                    {filteredValues.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No values found
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Apply Button */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={handleApplyValues}>
                    Apply
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Condition Tab - Traditional filter */}
            <TabsContent value="condition" className="mt-0">
              <div className="p-3 space-y-3">
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {renderInput(filterType, value, setValue)}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={handleApplyCondition}>
                    Apply
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getOperatorsForType(type: string) {
  switch (type) {
    case 'number':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'lessThan', label: 'Less than' },
        { value: 'between', label: 'Between' },
      ];
    case 'date':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'After' },
        { value: 'lessThan', label: 'Before' },
        { value: 'between', label: 'Between' },
      ];
    default:
      return [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Equals' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
      ];
  }
}

function renderInput(
  type: string,
  value: any,
  onChange: (value: any) => void
) {
  switch (type) {
    case 'number':
      return (
        <Input
          type="number"
          placeholder="Enter value..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      );
    case 'boolean':
      return (
        <Select value={String(value)} onValueChange={(v) => onChange(v === 'true')}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50">
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          placeholder="Enter value..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      );
  }
}