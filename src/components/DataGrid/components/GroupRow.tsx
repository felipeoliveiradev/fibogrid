import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroupRowNode } from '../utils/grouping';
import { ProcessedColumn } from '../types';

interface GroupRowProps<T> {
  row: GroupRowNode<T>;
  columns: ProcessedColumn<T>[];
  rowHeight: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showCheckboxColumn?: boolean;
  allChildrenSelected?: boolean;
  someChildrenSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}

export function GroupRow<T>({
  row,
  columns,
  rowHeight,
  isExpanded,
  onToggleExpand,
  showCheckboxColumn,
  allChildrenSelected,
  someChildrenSelected,
  onSelectAll,
}: GroupRowProps<T>) {
  const groupFields = row.groupField.split(',');
  const totalWidth = columns.reduce((sum, col) => sum + col.computedWidth, 0) + (showCheckboxColumn ? 48 : 0);

  return (
    <div
      className={cn(
        'flex items-center border-b border-border bg-muted/70 hover:bg-muted cursor-pointer select-none',
        'font-medium'
      )}
      style={{ height: rowHeight, width: totalWidth }}
      onClick={onToggleExpand}
    >
      {showCheckboxColumn && (
        <div
          className="flex items-center justify-center border-r border-border px-2"
          style={{ width: 48, minWidth: 48 }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={allChildrenSelected}
            ref={(el) => {
              if (el) el.indeterminate = someChildrenSelected && !allChildrenSelected;
            }}
            onChange={(e) => onSelectAll?.(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
        </div>
      )}
      
      <div className="flex items-center px-3 flex-1">
        <button
          className="mr-2 p-0.5 rounded hover:bg-muted-foreground/20"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        <span className="text-sm">
          {groupFields.map((field, i) => (
            <span key={field}>
              {i > 0 && ' / '}
              <span className="text-muted-foreground">{field}: </span>
              <span className="font-semibold">
                {typeof row.groupValue === 'object' 
                  ? row.groupValue[field] 
                  : row.groupValue}
              </span>
            </span>
          ))}
          <span className="ml-2 text-muted-foreground text-xs">
            ({row.groupChildren.length} items)
          </span>
        </span>
        
        {/* Aggregated values */}
        {row.aggregatedValues && Object.keys(row.aggregatedValues).length > 0 && (
          <div className="ml-4 flex items-center gap-4 text-xs text-muted-foreground">
            {Object.entries(row.aggregatedValues).map(([field, value]) => (
              <span key={field}>
                {field}: <span className="font-medium text-foreground">
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}