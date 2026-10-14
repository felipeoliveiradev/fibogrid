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
  const originalArray = toArray(original);
  const incomingArray = toArray(incoming);
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
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NUMERIC_STRING_PATTERN = /^[+-]?\d+(?:\.\d+)?$/;
const PLAIN_NUMBER_REST = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string'
    && Number.isNaN(Number(value))
    && ISO_DATE_PATTERN.test(value)
    && Number.isFinite(Date.parse(value));
}
function timestampOf(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  if (isIsoDateString(value)) return Date.parse(value);
  return null;
}
function isNumericString(value: unknown): value is string {
  return typeof value === 'string' && NUMERIC_STRING_PATTERN.test(value);
}
function compareAsNumbers(a: string, b: string): number {
  const left = Number(a);
  const right = Number(b);
  if (left === right) return 0;
  return left < right ? -1 : 1;
}
function calendarDayKey(value: unknown): string | null {
  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) return value;
  const time = timestampOf(value);
  if (time == null || !Number.isFinite(time)) return null;
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
function endOfLocalDayMs(dateOnly: string): number {
  const year = Number(dateOnly.slice(0, 4));
  const month = Number(dateOnly.slice(5, 7));
  const day = Number(dateOnly.slice(8, 10));
  return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
}
function isBlankOrNaN(value: unknown): boolean {
  return value == null || (typeof value === 'number' && Number.isNaN(value));
}
function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (isNumericString(value)) return Number(value);
  return null;
}
export function fastComparator(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const timeA = timestampOf(a);
  const timeB = timestampOf(b);
  if (
    timeA != null && timeB != null
    && Number.isFinite(timeA) && Number.isFinite(timeB)
    && (a instanceof Date || b instanceof Date)
  ) {
    return timeA - timeB;
  }
  if (isNumericString(a) && isNumericString(b)) {
    return compareAsNumbers(a, b);
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
  if (isNumericString(a) && isNumericString(b)) {
    return compareAsNumbers(a, b);
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
    const selected = Array.isArray(filter.value)
      ? new Set(filter.value.map((entry: unknown) => String(entry)))
      : null;
    return {
      field: filter.field,
      filter,
      column,
      customFn: column?.filterComparator,
      selected,
    };
  });
  const result: RowNode<T>[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const data = row.data as Record<string, unknown>;
    let passes = true;
    for (let j = 0; j < filterFns.length && passes; j++) {
      const { field, filter, customFn, selected } = filterFns[j];
      const value = getValueFromPath(data, field);
      if (customFn) {
        passes = customFn(filter.value, value);
      } else if (selected && filter.filterType === 'select') {
        passes = selected.size > 0 && selected.has(String(value));
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
    const searchColumns: ProcessedColumn<T>[] = [];
    for (let c = 0; c < columns.length; c++) {
      if (!columns[c].hide) searchColumns.push(columns[c]);
    }
    const quickFiltered: RowNode<T>[] = [];
    for (let i = 0; i < result.length; i++) {
      const row = result[i];
      const data = row.data as Record<string, unknown>;
      for (let j = 0; j < searchColumns.length; j++) {
        const value = getValueFromPath(data, searchColumns[j].field);
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
function shouldCompareByTimestamp(...candidates: unknown[]): boolean {
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (candidate instanceof Date || isIsoDateString(candidate)) return true;
  }
  return false;
}
function toCompareNumber(value: unknown, byTimestamp: boolean): number {
  if (byTimestamp) {
    if (value instanceof Date) return value.getTime();
    if (isIsoDateString(value)) return Date.parse(value);
    if (typeof value === 'number') return value;
    return Number.NaN;
  }
  return Number(value);
}
function compareOrdered(left: unknown, right: unknown, direction: 'gt' | 'lt'): boolean {
  const byTimestamp = shouldCompareByTimestamp(left, right);
  const leftNumber = toCompareNumber(left, byTimestamp);
  const rightNumber = toCompareNumber(right, byTimestamp);
  if (Number.isNaN(leftNumber) || Number.isNaN(rightNumber)) return false;
  return direction === 'gt' ? leftNumber > rightNumber : leftNumber < rightNumber;
}
function lowerBoundMatches(value: unknown, bound: unknown): boolean {
  if (bound instanceof Date || isIsoDateString(bound)) {
    const current = timestampOf(value);
    const limit = timestampOf(bound);
    if (current == null || limit == null || !Number.isFinite(current) || !Number.isFinite(limit)) return false;
    return current >= limit;
  }
  const currentNumber = finiteNumber(value);
  const boundNumber = finiteNumber(bound);
  if (currentNumber != null && boundNumber != null) return currentNumber >= boundNumber;
  return String(value) >= String(bound);
}
function upperBoundMatches(value: unknown, bound: unknown): boolean {
  if (bound instanceof Date || isIsoDateString(bound)) {
    const current = timestampOf(value);
    const limit = typeof bound === 'string' && DATE_ONLY_PATTERN.test(bound)
      ? endOfLocalDayMs(bound)
      : timestampOf(bound);
    if (current == null || limit == null || !Number.isFinite(current) || !Number.isFinite(limit)) return false;
    return current <= limit;
  }
  const currentNumber = finiteNumber(value);
  const boundNumber = finiteNumber(bound);
  if (currentNumber != null && boundNumber != null) return currentNumber <= boundNumber;
  return String(value) <= String(bound);
}
function compareBetween(value: unknown, low: unknown, high: unknown): boolean {
  if (isBlankOrNaN(value) || isBlankOrNaN(low) || isBlankOrNaN(high)) return false;
  return lowerBoundMatches(value, low) && upperBoundMatches(value, high);
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
    case 'equals': {
      const leftDay = calendarDayKey(value);
      const rightDay = calendarDayKey(filterValue);
      if (leftDay != null && rightDay != null) return leftDay === rightDay;
      return String(value) === String(filterValue);
    }
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'greaterThan':
      return compareOrdered(value, filterValue, 'gt');
    case 'lessThan':
      return compareOrdered(value, filterValue, 'lt');
    case 'between':
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        return compareBetween(value, filterValue[0], filterValue[1]);
      }
      return false;
    default:
      return true;
  }
}
const valuePathCache = new Map<string, string[]>();
export function getValueFromPath(obj: any, path: string): any {
  if (path.indexOf('.') === -1) {
    return obj?.[path];
  }
  let keys = valuePathCache.get(path);
  if (!keys) {
    keys = path.split('.');
    valuePathCache.set(path, keys);
  }
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (current == null) return undefined;
    current = current[keys[i]];
  }
  return current;
}
export function setValueAtPath(obj: any, path: string, value: any): any {
  if (path.indexOf('.') === -1) {
    return { ...obj, [path]: value };
  }
  let keys = valuePathCache.get(path);
  if (!keys) {
    keys = path.split('.');
    valuePathCache.set(path, keys);
  }
  const result = { ...obj };
  let current = result;
  const last = keys.length - 1;
  for (let i = 0; i < last; i++) {
    const child = { ...current[keys[i]] };
    current[keys[i]] = child;
    current = child;
  }
  current[keys[last]] = value;
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
function neutralizeFormula(value: string): string {
  if (value.length === 0) return value;
  const first = value.charAt(0);
  if (first === '=' || first === '@' || first === '\t' || first === '\r') {
    return `'${value}`;
  }
  if ((first === '+' || first === '-') && !PLAIN_NUMBER_REST.test(value.slice(1))) {
    return `'${value}`;
  }
  return value;
}
function escapeCSV(value: string): string {
  const safe = neutralizeFormula(value);
  if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
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
      const formatted = col.valueFormatter ? col.valueFormatter(value, row.data) : value;
      return neutralizeFormula(String(formatted ?? ''));
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
  switch (aggFunc) {
    case 'sum':
    case 'avg':
    case 'min':
    case 'max': {
      let sum = 0;
      let count = 0;
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value !== 'number' || !Number.isFinite(value)) continue;
        count++;
        sum += value;
        if (value < min) min = value;
        if (value > max) max = value;
      }
      if (aggFunc === 'sum') return sum;
      if (aggFunc === 'avg') return count > 0 ? sum / count : 0;
      if (aggFunc === 'min') return min;
      return max;
    }
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
function isBlockedMergeKey(key: string): boolean {
  return key === '__proto__' || key === 'prototype' || key === 'constructor';
}
export function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
    return source;
  }
  if (Array.isArray(source)) {
    return [...source];
  }
  const result: any = {};
  Object.keys(target).forEach(key => {
    if (isBlockedMergeKey(key)) return;
    result[key] = target[key];
  });
  Object.keys(source).forEach(key => {
    if (isBlockedMergeKey(key)) return;
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
