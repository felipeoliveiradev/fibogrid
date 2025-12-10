import React from 'react';
import { RowNode, ProcessedColumn } from '../types';
import { useGridContext } from '../context/GridContext';

interface GridStatusBarProps<T> {
  displayedRows: RowNode<T>[];
  totalRows: number;
  selectedCount: number;
  columns: ProcessedColumn<T>[];
  aggregations?: Record<string, { sum?: number; avg?: number; min?: number; max?: number; count?: number }>;
}

export function GridStatusBar<T>({
  displayedRows,
  totalRows,
  selectedCount,
  columns,
  aggregations,
}: GridStatusBarProps<T>) {
  const { locale } = useGridContext<T>()!;

  const numericColumns = columns.filter(
    (col) => col.filterType === 'number' || col.aggFunc
  );

  const calculateAggregations = () => {
    if (displayedRows.length === 0) return null;

    const results: Record<string, { sum: number; avg: number; min: number; max: number; count: number }> = {};

    numericColumns.forEach((col) => {
      const values = displayedRows
        .map((row) => (row.data as any)[col.field])
        .filter((v) => typeof v === 'number' && !isNaN(v));

      if (values.length > 0) {
        results[col.field] = {
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });

    return results;
  };

  const aggData = aggregations || calculateAggregations();

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
                    {locale.statusBar.aggregations.sum} {values.sum.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span>
                    {locale.statusBar.aggregations.avg} {values.avg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
