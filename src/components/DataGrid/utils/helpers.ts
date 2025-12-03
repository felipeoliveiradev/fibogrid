import { RowNode, ColumnDef, ProcessedColumn, SortModel, FilterModel } from '../types';

// Generate unique row IDs
export function generateRowId<T>(data: T, index: number, getRowId?: (data: T) => string): string {
  if (getRowId) {
    return getRowId(data);
  }
  return `row-${index}`;
}

// Create RowNode from data
export function createRowNode<T>(
  data: T,
  index: number,
  getRowId?: (data: T) => string
): RowNode<T> {
  return {
    id: generateRowId(data, index, getRowId),
    data,
    rowIndex: index,
    selected: false,
    expanded: false,
    level: 0,
  };
}

// Process columns with computed widths
export function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[] {
  const mergedColumns = columns.map((col) => ({
    ...defaultColDef,
    ...col,
  }));

  // Calculate flex columns
  const fixedWidth = mergedColumns
    .filter((col) => !col.flex && col.width)
    .reduce((sum, col) => sum + (col.width || 150), 0);

  const flexTotal = mergedColumns
    .filter((col) => col.flex)
    .reduce((sum, col) => sum + (col.flex || 1), 0);

  const availableFlexWidth = Math.max(0, containerWidth - fixedWidth);

  let currentLeft = 0;
  return mergedColumns.map((col, index) => {
    let computedWidth: number;

    if (col.flex && flexTotal > 0) {
      computedWidth = (col.flex / flexTotal) * availableFlexWidth;
    } else {
      computedWidth = col.width || 150;
    }

    // Apply min/max constraints
    if (col.minWidth) {
      computedWidth = Math.max(computedWidth, col.minWidth);
    }
    if (col.maxWidth) {
      computedWidth = Math.min(computedWidth, col.maxWidth);
    }

    const processed: ProcessedColumn<T> = {
      ...col,
      computedWidth,
      left: currentLeft,
      index,
    };

    currentLeft += computedWidth;

    return processed;
  });
}

// Sort rows
export function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ProcessedColumn<T>[]
): RowNode<T>[] {
  if (sortModel.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const sort of sortModel) {
      const column = columns.find((c) => c.field === sort.field);
      const valueA = getValueFromPath(a.data, sort.field);
      const valueB = getValueFromPath(b.data, sort.field);

      let comparison: number;
      if (column?.comparator) {
        comparison = column.comparator(valueA, valueB);
      } else {
        comparison = defaultComparator(valueA, valueB);
      }

      if (comparison !== 0) {
        return sort.direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

// Default value comparator
export function defaultComparator(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  return String(a).localeCompare(String(b));
}

// Filter rows
export function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ProcessedColumn<T>[],
  quickFilterText?: string
): RowNode<T>[] {
  let filtered = rows;

  // Apply column filters
  for (const filter of filterModel) {
    const column = columns.find((c) => c.field === filter.field);
    filtered = filtered.filter((row) => {
      const value = getValueFromPath(row.data, filter.field);
      
      if (column?.filterComparator) {
        return column.filterComparator(filter.value, value);
      }

      return defaultFilterComparator(filter, value);
    });
  }

  // Apply quick filter
  if (quickFilterText) {
    const lowerFilter = quickFilterText.toLowerCase();
    filtered = filtered.filter((row) => {
      return columns.some((col) => {
        const value = getValueFromPath(row.data, col.field);
        return String(value).toLowerCase().includes(lowerFilter);
      });
    });
  }

  return filtered;
}

// Default filter comparator
export function defaultFilterComparator(filter: FilterModel, value: any): boolean {
  const filterValue = filter.value;
  
  if (filterValue == null || filterValue === '') return true;

  switch (filter.operator || 'contains') {
    case 'equals':
      return value === filterValue;
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'greaterThan':
      return Number(value) > Number(filterValue);
    case 'lessThan':
      return Number(value) < Number(filterValue);
    case 'between':
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        return Number(value) >= Number(filterValue[0]) && Number(value) <= Number(filterValue[1]);
      }
      return true;
    default:
      return true;
  }
}

// Get value from nested path (e.g., "user.name")
export function getValueFromPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Set value at nested path
export function setValueAtPath(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] };
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

// Paginate rows
export function paginateRows<T>(
  rows: RowNode<T>[],
  page: number,
  pageSize: number
): RowNode<T>[] {
  const start = page * pageSize;
  return rows.slice(start, start + pageSize);
}

// Export to CSV
export function exportToCsv<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  options: {
    fileName?: string;
    skipHeader?: boolean;
  } = {}
): void {
  const { fileName = 'export.csv', skipHeader = false } = options;

  const visibleColumns = columns.filter((col) => !col.hide);
  
  let csv = '';

  if (!skipHeader) {
    csv += visibleColumns.map((col) => escapeCSV(col.headerName)).join(',') + '\n';
  }

  for (const row of rows) {
    const values = visibleColumns.map((col) => {
      const value = getValueFromPath(row.data, col.field);
      const formatted = col.valueFormatter ? col.valueFormatter(value, row.data) : value;
      return escapeCSV(String(formatted ?? ''));
    });
    csv += values.join(',') + '\n';
  }

  downloadCSV(csv, fileName);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCSV(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Copy to clipboard
export async function copyToClipboard<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  includeHeaders: boolean = true
): Promise<void> {
  const visibleColumns = columns.filter((col) => !col.hide);
  
  let text = '';

  if (includeHeaders) {
    text += visibleColumns.map((col) => col.headerName).join('\t') + '\n';
  }

  for (const row of rows) {
    const values = visibleColumns.map((col) => {
      const value = getValueFromPath(row.data, col.field);
      return col.valueFormatter ? col.valueFormatter(value, row.data) : String(value ?? '');
    });
    text += values.join('\t') + '\n';
  }

  await navigator.clipboard.writeText(text);
}

// Calculate aggregate values
export function calculateAggregate(values: any[], aggFunc: string | ((values: any[]) => any)): any {
  if (typeof aggFunc === 'function') {
    return aggFunc(values);
  }

  const numericValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

  switch (aggFunc) {
    case 'sum':
      return numericValues.reduce((a, b) => a + b, 0);
    case 'avg':
      return numericValues.length > 0
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        : 0;
    case 'min':
      return Math.min(...numericValues);
    case 'max':
      return Math.max(...numericValues);
    case 'count':
      return values.length;
    default:
      return null;
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
