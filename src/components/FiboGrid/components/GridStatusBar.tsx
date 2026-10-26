import React, { useMemo, memo } from 'react';
import { RowNode, ProcessedColumn } from '../types';
import { useGridLocale } from '../context/GridContext';

type AggregationMap = Record<string, { sum?: number; avg?: number; min?: number; max?: number; count?: number }>;

interface GridStatusBarProps<T> {
  displayedRows: RowNode<T>[];
  totalRows: number;
  selectedCount: number;
  columns: ProcessedColumn<T>[];
  aggregations?: AggregationMap;
}

function areGridStatusBarPropsEqual<T>(prev: GridStatusBarProps<T>, next: GridStatusBarProps<T>): boolean {
  if (prev.displayedRows !== next.displayedRows) return false;
  if (prev.totalRows !== next.totalRows) return false;
  if (prev.selectedCount !== next.selectedCount) return false;
  if (prev.columns !== next.columns) return false;
  if (prev.aggregations !== next.aggregations) return false;
  return true;
}

function GridStatusBarInner<T>({
  displayedRows,
  totalRows,
  selectedCount,
  columns,
  aggregations,
}: GridStatusBarProps<T>) {
  const locale = useGridLocale();
  const numericColumns = useMemo(
    () => columns.filter((col) => col.filterType === 'number' || col.aggFunc),
    [columns]
  );
  const aggData = useMemo(() => {
    if (aggregations) return aggregations;
    if (displayedRows.length === 0 || numericColumns.length === 0) return null;
    const results: Record<string, { sum: number; avg: number; min: number; max: number; count: number }> = {};
    for (let c = 0; c < numericColumns.length; c++) {
      const col = numericColumns[c]!;
      const field = col.field;
      let sum = 0;
      let count = 0;
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < displayedRows.length; i++) {
        const v = (displayedRows[i].data as any)[field];
        if (typeof v === 'number' && !Number.isNaN(v)) {
          sum += v;
          count++;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      if (count > 0) {
        results[field] = { sum, avg: sum / count, min, max, count };
      }
    }
    return results;
  }, [aggregations, displayedRows, numericColumns]);
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>
          <strong className="text-foreground">{displayedRows.length.toLocaleString()}</strong>{' '}
          {displayedRows.length !== totalRows && (
            <>{locale.statusBar.totalRows(totalRows)}</>
          )}{' '}
          {locale.statusBar.rows}
        </span>
        {selectedCount > 0 && (
          <span className="px-2 py-0.5 bg-primary/10 rounded text-primary">
            {locale.statusBar.selected(selectedCount)}
          </span>
        )}
      </div>
      {aggData && Object.keys(aggData).length > 0 && (
        <div className="flex items-center gap-4">
          {Object.entries(aggData)
            .slice(0, 3)
            .map(([field, values]) => {
              const col = columns.find((c) => c.field === field);
              return (
                <div key={field} className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{col?.headerName}:</span>
                  <span>
                    {locale.statusBar.aggregations.sum} {values.sum?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span>
                    {locale.statusBar.aggregations.avg} {values.avg?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export const GridStatusBar = memo(GridStatusBarInner, areGridStatusBarPropsEqual) as typeof GridStatusBarInner;
