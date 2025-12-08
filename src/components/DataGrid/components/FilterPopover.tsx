import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProcessedColumn, FilterModel } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, X, Search, SortAsc, SortDesc } from 'lucide-react';

interface FilterPopoverProps<T> {
  column: ProcessedColumn<T>;
  currentFilter?: FilterModel;
  onFilterChange: (filter: FilterModel | null) => void;
  onClose: () => void;
  allValues?: any[];
  onSort?: (direction: 'asc' | 'desc') => void;
  anchorRect?: DOMRect | null;
  containerRef?: React.RefObject<HTMLDivElement>;
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
}: FilterPopoverProps<T>) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(currentFilter?.value ?? '');
  const [operator, setOperator] = useState<string>(currentFilter?.operator ?? 'contains');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(() => new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize selected values once when uniqueValues changes
  useEffect(() => {
    if (uniqueValues.length === 0) return;
    
    if (!isInitialized) {
      if (currentFilter?.value && Array.isArray(currentFilter.value)) {
        setSelectedValues(new Set(currentFilter.value.map(String)));
        setSelectAll(currentFilter.value.length === uniqueValues.length);
      } else {
        setSelectedValues(new Set(uniqueValues));
        setSelectAll(true);
      }
      setIsInitialized(true);
    }
  }, [uniqueValues, currentFilter, isInitialized]);

  // Handle click outside
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
    onClose();
  };

  const handleApplyValues = () => {
    console.log('Applying filter with selected values:', Array.from(selectedValues));
    console.log('selectAll:', selectAll, 'uniqueValues.length:', uniqueValues.length, 'selectedValues.size:', selectedValues.size);
    
    if (selectAll) {
      // All selected = no filter
      console.log('All selected, clearing filter');
      onFilterChange(null);
    } else if (selectedValues.size === 0) {
      // None selected = filter everything out
      console.log('None selected, filtering all out');
      onFilterChange({
        field: column.field,
        filterType: 'select',
        value: [],
        operator: 'equals',
      });
    } else {
      // Some selected = filter to selected values
      console.log('Some selected, filtering to:', Array.from(selectedValues));
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
    setSelectedValues(new Set(uniqueValues));
    setSelectAll(true);
    onFilterChange(null);
    onClose();
  };

  const toggleValue = (val: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Toggling value:', val);
    setSelectedValues(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(val)) {
        newSelected.delete(val);
      } else {
        newSelected.add(val);
      }
      const allSelected = newSelected.size === uniqueValues.length;
      setSelectAll(allSelected);
      console.log('New selected values:', Array.from(newSelected), 'allSelected:', allSelected);
      return newSelected;
    });
  };

  const toggleAll = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Toggle all, current selectAll:', selectAll);
    if (selectAll) {
      setSelectedValues(new Set());
      setSelectAll(false);
    } else {
      setSelectedValues(new Set(uniqueValues));
      setSelectAll(true);
    }
  };

  // Calculate position relative to container
  const style = useMemo(() => {
    if (!anchorRect) return { top: 0, left: 0 };
    
    const containerRect = containerRef?.current?.getBoundingClientRect();
    
    if (containerRect) {
      // Position relative to container for proper scrolling
      return {
        position: 'absolute' as const,
        top: anchorRect.bottom - containerRect.top + 4,
        left: Math.max(0, anchorRect.left - containerRect.left),
      };
    }
    
    // Fallback to viewport positioning
    return {
      position: 'fixed' as const,
      top: anchorRect.bottom + 4,
      left: Math.max(8, anchorRect.left),
    };
  }, [anchorRect, containerRef]);

  return (
    <div
      ref={popoverRef}
      className="w-80 bg-popover border border-border rounded-lg shadow-xl z-[100]"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{column.headerName}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
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
                onClose();
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
                onClose();
              }}
            >
              <SortDesc className="h-4 w-4" />
              Sort Z to A
            </Button>
          </div>
        )}

        <Tabs defaultValue="values" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border bg-transparent h-9">
            <TabsTrigger value="values" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Values
            </TabsTrigger>
            <TabsTrigger value="condition" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
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
              <label 
                className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
              >
                <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={() => toggleAll()}
                />
                <span className="text-sm font-medium">(Select All)</span>
              </label>

              {/* Value List */}
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
                      <span className="text-sm truncate">{val || '(Blank)'}</span>
                    </label>
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
                <SelectContent className="bg-popover border border-border z-[110]">
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
    </div>
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
          <SelectContent className="bg-popover border border-border z-[110]">
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
