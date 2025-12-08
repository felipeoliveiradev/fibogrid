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

// Process columns with computed widths - Fixed widths, no flex redistribution
export function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[] {
  const mergedColumns = columns.map((col) => ({
    ...defaultColDef,
    ...col,
  }));

  let currentLeft = 0;
  return mergedColumns.map((col, index) => {
    // Use fixed width - no flex redistribution
    const computedWidth = col.width || 150;

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

// Sort rows - optimized with pre-computed comparators
export function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ProcessedColumn<T>[]
): RowNode<T>[] {
  if (sortModel.length === 0 || rows.length === 0) return rows;

  // Pre-compute column map for O(1) lookups
  const columnMap = new Map<string, ProcessedColumn<T>>();
  for (let i = 0; i < columns.length; i++) {
    columnMap.set(columns[i].field, columns[i]);
  }

  // Pre-compute sort config for each sort model entry
  const sortConfigs = sortModel.map(sort => ({
    field: sort.field,
    direction: sort.direction,
    column: columnMap.get(sort.field),
  }));

  // Create shallow copy and sort
  const result = rows.slice();
  
  result.sort((a, b) => {
    const dataA = a.data as Record<string, unknown>;
    const dataB = b.data as Record<string, unknown>;
    
    for (let i = 0; i < sortConfigs.length; i++) {
      const { field, direction, column } = sortConfigs[i];
      const valueA = dataA[field];
      const valueB = dataB[field];

      let comparison: number;
      if (column?.comparator) {
        comparison = column.comparator(valueA, valueB);
      } else {
        comparison = fastComparator(valueA, valueB);
      }

      if (comparison !== 0) {
        return direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });

  return result;
}

// Fast comparator optimized for numbers (most common in real-time grids)
export function fastComparator(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  // Fast path for numbers - most common case in real-time data
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Fallback for strings and other types
  return String(a).localeCompare(String(b));
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

// Filter rows - optimized with pre-computed column map
export function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ProcessedColumn<T>[],
  quickFilterText?: string
): RowNode<T>[] {
  if (rows.length === 0) return rows;
  if (filterModel.length === 0 && !quickFilterText) return rows;

  // Pre-compute column map
  const columnMap = new Map<string, ProcessedColumn<T>>();
  for (let i = 0; i < columns.length; i++) {
    columnMap.set(columns[i].field, columns[i]);
  }

  // Pre-compute filter functions for each filter
  const filterFns = filterModel.map(filter => {
    const column = columnMap.get(filter.field);
    return {
      field: filter.field,
      filter,
      column,
      customFn: column?.filterComparator,
    };
  });

  // Pre-allocate result array (estimate)
  const result: RowNode<T>[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const data = row.data as Record<string, unknown>;
    let passes = true;

    // Check each filter
    for (let j = 0; j < filterFns.length && passes; j++) {
      const { field, filter, customFn } = filterFns[j];
      const value = data[field];
      
      if (customFn) {
        passes = customFn(filter.value, value);
      } else {
        passes = defaultFilterComparator(filter, value);
      }
    }

    if (passes) {
      result.push(row);
    }
  }

  // Apply quick filter if needed
  if (quickFilterText) {
    const lowerFilter = quickFilterText.toLowerCase();
    const quickFiltered: RowNode<T>[] = [];
    
    for (let i = 0; i < result.length; i++) {
      const row = result[i];
      const data = row.data as Record<string, unknown>;
      
      for (let j = 0; j < columns.length; j++) {
        const value = data[columns[j].field];
        if (value != null && String(value).toLowerCase().includes(lowerFilter)) {
          quickFiltered.push(row);
          break;
        }
      }
    }
    return quickFiltered;
  }

  return result;
}

// Default filter comparator - Fixed for select filter type
export function defaultFilterComparator(filter: FilterModel, value: any): boolean {
  const filterValue = filter.value;
  
  // Handle select filter type (array of values)
  if (filter.filterType === 'select' && Array.isArray(filterValue)) {
    console.log('Select filter - filterValue:', filterValue, 'cellValue:', value);
    
    // Empty array means filter everything out
    if (filterValue.length === 0) {
      return false;
    }
    
    // Check if value is in the selected values
    const stringValue = String(value);
    const isIncluded = filterValue.some(fv => String(fv) === stringValue);
    console.log('Value included:', isIncluded);
    return isIncluded;
  }
  
  if (filterValue == null || filterValue === '') return true;

  switch (filter.operator || 'contains') {
    case 'equals':
      return String(value) === String(filterValue);
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
