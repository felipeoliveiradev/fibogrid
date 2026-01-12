import { RowNode, ColumnDef, ProcessedColumn, SortModel, FilterModel } from '../types';
export function generateRowId<T>(data: T, index: number, getRowId?: (data: T) => string): string {
  if (getRowId) {
    return getRowId(data);
  }
  return `row-${index}`;
}
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
export function processColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number,
  defaultColDef?: Partial<ColumnDef<T>>
): ProcessedColumn<T>[] {
  const mergedColumns = columns.map((col) => ({
    ...defaultColDef,
    ...col,
  }));
  let usedWidth = 0;
  let totalFlex = 0;
  mergedColumns.forEach((col) => {
    if (col.hide) return;
    if (col.width) {
      usedWidth += col.width;
    } else if (col.flex) {
      totalFlex += col.flex;
      usedWidth += (col.minWidth || 50);
    } else {
      usedWidth += (col.width || 150);
    }
  });
  const scrollbarWidth = 15;
  const effectiveContainerWidth = Math.max(0, containerWidth - scrollbarWidth);
  const availableForFlex = Math.max(0, effectiveContainerWidth - usedWidth);
  let currentLeft = 0;
  return mergedColumns.map((col, index) => {
    if (col.hide) {
      return {
        ...col,
        computedWidth: 0,
        left: 0,
        index,
      };
    }
    let computedWidth: number;
    if (col.width) {
      computedWidth = col.width;
    } else if (col.flex && totalFlex > 0) {
      const minW = col.minWidth || 50;
      const share = (col.flex / totalFlex) * availableForFlex;
      computedWidth = minW + (availableForFlex > 0 ? share : 0);
    } else {
      computedWidth = col.width || 150;
    }
    if (col.minWidth && computedWidth < col.minWidth) computedWidth = col.minWidth;
    if (col.maxWidth && computedWidth > col.maxWidth) computedWidth = col.maxWidth;
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
export function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}
export function mergeUnique<T>(
  original: T[] | T,
  incoming: T[] | T,
  compareKey: keyof T,
): T[] {
  const originalArray = this.toArray(original);
  const incomingArray = this.toArray(incoming);
  if (!incomingArray.length) return originalArray;
  if (!originalArray.length) return incomingArray;
  const filteredOriginal = originalArray.filter(
    (origItem) => !incomingArray.some((newItem) => String(newItem[compareKey]) === String(origItem[compareKey]))
  );
  return [...filteredOriginal, ...incomingArray];
}
export function sortRows<T>(
  rows: RowNode<T>[],
  sortModel: SortModel[],
  columns: ProcessedColumn<T>[]
): RowNode<T>[] {
  if (sortModel.length === 0 || rows.length === 0) return rows;
  const columnMap = new Map<string, ProcessedColumn<T>>();
  for (let i = 0; i < columns.length; i++) {
    columnMap.set(columns[i].field, columns[i]);
  }
  const sortConfigs = sortModel.map(sort => ({
    field: sort.field,
    direction: sort.direction,
    column: columnMap.get(sort.field),
  }));
  const result = rows.slice();
  result.sort((a, b) => {
    const dataA = a.data as Record<string, unknown>;
    const dataB = b.data as Record<string, unknown>;
    for (let i = 0; i < sortConfigs.length; i++) {
      const { field, direction, column } = sortConfigs[i];
      const valueA = getValueFromPath(dataA, field);
      const valueB = getValueFromPath(dataB, field);
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
export function fastComparator(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}
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
export function filterRows<T>(
  rows: RowNode<T>[],
  filterModel: FilterModel[],
  columns: ProcessedColumn<T>[],
  quickFilterText?: string
): RowNode<T>[] {
  if (rows.length === 0) return rows;
  if (filterModel.length === 0 && !quickFilterText) return rows;
  const columnMap = new Map<string, ProcessedColumn<T>>();
  for (let i = 0; i < columns.length; i++) {
    columnMap.set(columns[i].field, columns[i]);
  }
  const filterFns = filterModel.map(filter => {
    const column = columnMap.get(filter.field);
    return {
      field: filter.field,
      filter,
      column,
      customFn: column?.filterComparator,
    };
  });
  const result: RowNode<T>[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const data = row.data as Record<string, unknown>;
    let passes = true;
    for (let j = 0; j < filterFns.length && passes; j++) {
      const { field, filter, customFn } = filterFns[j];
      const value = getValueFromPath(data, field);
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
  if (quickFilterText) {
    const lowerFilter = quickFilterText.toLowerCase();
    const quickFiltered: RowNode<T>[] = [];
    for (let i = 0; i < result.length; i++) {
      const row = result[i];
      const data = row.data as Record<string, unknown>;
      for (let j = 0; j < columns.length; j++) {
        const value = getValueFromPath(data, columns[j].field);
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
export function defaultFilterComparator(filter: FilterModel, value: any): boolean {
  const filterValue = filter.value;
  if (filter.filterType === 'select' && Array.isArray(filterValue)) {
    if (filterValue.length === 0) {
      return false;
    }
    const stringValue = String(value);
    const isIncluded = filterValue.some(fv => String(fv) === stringValue);
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
export function getValueFromPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
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
export function paginateRows<T>(
  rows: RowNode<T>[],
  page: number,
  pageSize: number
): RowNode<T>[] {
  const start = page * pageSize;
  return rows.slice(start, start + pageSize);
}
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
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn('Failed to write to clipboard', e);
    }
  } else {
    console.warn('Clipboard API not available (writeText).');
  }
}
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
export function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
    return source;
  }
  if (Array.isArray(source)) {
    return [...source];
  }
  const result = { ...target };
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = result[key];
    if (typeof sourceValue === 'object' && sourceValue !== null && targetValue && typeof targetValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });
  return result;
}
export function isEqual(value: any, other: any): boolean {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (typeof value !== 'object' && typeof other !== 'object')) {
    return value !== value && other !== other;
  }
  if (value.constructor !== other.constructor) {
    return false;
  }
  if (Array.isArray(value)) {
    if (value.length !== other.length) {
      return false;
    }
    for (let i = 0; i < value.length; i++) {
      if (!isEqual(value[i], other[i])) {
        return false;
      }
    }
    return true;
  }
  if (value instanceof RegExp) {
    return value.source === other.source && value.flags === other.flags;
  }
  if (value instanceof Date) {
    return value.getTime() === other.getTime();
  }
  const keys = Object.keys(value);
  if (keys.length !== Object.keys(other).length) {
    return false;
  }
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(other, key) || !isEqual(value[key], other[key])) {
      return false;
    }
  }
  return true;
}
