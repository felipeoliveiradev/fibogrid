import React, { memo, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroupRowNode } from '../utils/grouping';
import { ProcessedColumn } from '../types';
import { useGridLocale } from '../context/GridContext';
import type { FiboGridLocale } from '../locales/types';
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
  locale?: FiboGridLocale;
}
function localeString(source: object | null | undefined, key: string): string | undefined {
  if (source == null) return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
function groupCountLabel(count: number, locale: FiboGridLocale | undefined): string {
  const format = locale?.groups?.itemCount;
  if (typeof format === 'function') return format(count);
  return `${count} items`;
}
function groupFieldText(groupValue: unknown, field: string): React.ReactNode {
  if (groupValue == null) return '';
  if (typeof groupValue === 'object') {
    const fieldValue = (groupValue as Record<string, unknown>)[field];
    if (fieldValue == null) return '';
    return fieldValue as React.ReactNode;
  }
  return groupValue as React.ReactNode;
}
function GroupRowInner<T>({
  row,
  columns,
  rowHeight,
  isExpanded,
  onToggleExpand,
  showCheckboxColumn,
  allChildrenSelected,
  someChildrenSelected,
  onSelectAll,
  locale: localeProp,
}: GroupRowProps<T>) {
  const contextLocale = useGridLocale();
  const locale = localeProp ?? contextLocale;
  const selectLabel = localeString(locale?.aria, 'selectGroup') ?? 'Select group';
  const expandLabel = localeString(locale?.aria, 'expandGroup') ?? 'Expand group';
  const collapseLabel = localeString(locale?.aria, 'collapseGroup') ?? 'Collapse group';
  const groupFields = row.groupField.split(',');
  const aggregates = useMemo(
    () => Object.entries(row.aggregatedValues ?? {}).filter(([, value]) => value != null),
    [row.aggregatedValues]
  );
  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + col.computedWidth, 0) + (showCheckboxColumn ? 48 : 0),
    [columns, showCheckboxColumn]
  );
  return (
    <div
      role="row"
      className={cn(
        'fibogrid-group-row flex items-center cursor-pointer select-none',
        'font-medium'
      )}
      style={{ height: `${rowHeight}px`, width: `${totalWidth}px` }}
      onClick={onToggleExpand}
    >
      {showCheckboxColumn && (
        <div
          className="flex items-center justify-center border-r border-border px-2 fibogrid-checkbox-column"
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
            aria-label={selectLabel}
          />
        </div>
      )}
      <div className="flex items-center px-3 flex-1">
        <button
          type="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? collapseLabel : expandLabel}
          className="mr-2 p-0.5 rounded hover:bg-muted-foreground/20"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
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
              <span className="fibogrid-group-label font-semibold">
                {groupFieldText(row.groupValue, field)}
              </span>
            </span>
          ))}
          <span className="fibogrid-group-count ml-2 text-muted-foreground text-xs">
            ({groupCountLabel(row.groupChildren.length, locale)})
          </span>
        </span>
        {aggregates.length > 0 && (
          <div className="ml-4 flex items-center gap-4 text-xs text-muted-foreground">
            {aggregates.map(([field, value]) => (
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

export const GroupRow = memo(GroupRowInner, (prev, next) => {
  return (
    prev.row === next.row &&
    prev.columns === next.columns &&
    prev.rowHeight === next.rowHeight &&
    prev.isExpanded === next.isExpanded &&
    prev.showCheckboxColumn === next.showCheckboxColumn &&
    prev.allChildrenSelected === next.allChildrenSelected &&
    prev.someChildrenSelected === next.someChildrenSelected &&
    prev.onToggleExpand === next.onToggleExpand &&
    prev.onSelectAll === next.onSelectAll &&
    prev.locale === next.locale
  );
}) as typeof GroupRowInner;