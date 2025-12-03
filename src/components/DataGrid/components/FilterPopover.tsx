import React, { useState } from 'react';
import { ProcessedColumn, FilterModel } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

interface FilterPopoverProps<T> {
  column: ProcessedColumn<T>;
  currentFilter?: FilterModel;
  onFilterChange: (filter: FilterModel | null) => void;
  children: React.ReactNode;
}

export function FilterPopover<T>({
  column,
  currentFilter,
  onFilterChange,
  children,
}: FilterPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(currentFilter?.value ?? '');
  const [operator, setOperator] = useState<string>(currentFilter?.operator ?? 'contains');

  const filterType = column.filterType || 'text';

  const operators = getOperatorsForType(filterType);

  const handleApply = () => {
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

  const handleClear = () => {
    setValue('');
    onFilterChange(null);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter: {column.headerName}</h4>
            {currentFilter && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {renderInput(filterType, value, setValue)}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClear}>
              Clear
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Apply
            </Button>
          </div>
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
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'boolean':
      return (
        <Select value={String(value)} onValueChange={(v) => onChange(v === 'true')}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
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
        />
      );
  }
}
