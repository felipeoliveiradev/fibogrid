import type { ServerSideDataSourceRequest } from '../types';

const SEP = '\u001f';

export interface LazyPageCache<T> {
  key(req: ServerSideDataSourceRequest): string;
  identity(req: ServerSideDataSourceRequest): string;
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  has(key: string): boolean;
  clearPrefix(identityWithoutPage: string): void;
  peek(key: string): T | undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function dateStamp(value: Date): string {
  const time = value.getTime();
  return Number.isNaN(time) ? '' : value.toISOString();
}

function stableJson(value: unknown): string {
  if (value instanceof Date) {
    const stamp = dateStamp(value);
    return stamp === '' ? 'null' : JSON.stringify(stamp);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => (item === undefined ? 'null' : stableJson(item))).join(',')}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort();
    const body = keys
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',');
    return `{${body}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function formatFilterValue(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return dateStamp(value);
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.some((part) => isPlainObject(part) || Array.isArray(part))) {
      return stableJson(value);
    }
    return value.map((part) => formatFilterValue(part)).join('|');
  }
  if (isPlainObject(value)) return stableJson(value);
  return '';
}

function buildIdentity(req: ServerSideDataSourceRequest): string {
  const quick = req.quickFilterText || '';
  const sorts = (req.sortModel ?? [])
    .map((sort) => `${sort.field}:${sort.direction}`)
    .join(',');
  const filters = (req.filterModel ?? [])
    .map((filter) => `${filter.field}:${filter.operator ?? ''}:${formatFilterValue(filter.value)}`)
    .join(',');
  return `${req.pageSize}${SEP}${quick}${SEP}${sorts}${SEP}${filters}`;
}

function buildKey(req: ServerSideDataSourceRequest): string {
  return `${req.page}${SEP}${buildIdentity(req)}`;
}

export function createLazyPageCache<T>(maxEntries = 6): LazyPageCache<T> {
  const entries = new Map<string, T>();

  const key = (req: ServerSideDataSourceRequest): string => buildKey(req);
  const identity = (req: ServerSideDataSourceRequest): string => buildIdentity(req);

  const peek = (cacheKey: string): T | undefined => entries.get(cacheKey);

  const has = (cacheKey: string): boolean => entries.has(cacheKey);

  const promote = (cacheKey: string, value: T) => {
    entries.delete(cacheKey);
    entries.set(cacheKey, value);
  };

  const get = (cacheKey: string): T | undefined => {
    if (!entries.has(cacheKey)) return undefined;
    const value = entries.get(cacheKey) as T;
    promote(cacheKey, value);
    return value;
  };

  const set = (cacheKey: string, value: T): void => {
    promote(cacheKey, value);
    while (entries.size > maxEntries) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  };

  const clearPrefix = (identityWithoutPage: string): void => {
    const suffix = `${SEP}${identityWithoutPage}`;
    for (const cacheKey of [...entries.keys()]) {
      if (!cacheKey.endsWith(suffix)) continue;
      const pagePart = cacheKey.slice(0, cacheKey.length - suffix.length);
      if (pagePart.includes(SEP)) continue;
      entries.delete(cacheKey);
    }
  };

  return { key, identity, get, set, has, clearPrefix, peek };
}
