import { describe, expect, it } from 'vitest';
import type { ServerSideDataSourceRequest } from '../types';
import { createLazyPageCache } from './lazyPageCache';

function request(overrides: Partial<ServerSideDataSourceRequest> = {}): ServerSideDataSourceRequest {
  return {
    page: 0,
    pageSize: 25,
    sortModel: [{ field: 'name', direction: 'asc' }],
    filterModel: [{ field: 'status', filterType: 'select', operator: 'equals', value: ['open', 'pending'] }],
    quickFilterText: 'bolt',
    ...overrides,
  };
}

describe('lazyPageCache', () => {
  it('evicts the oldest entry once maxEntries is exceeded', () => {
    const cache = createLazyPageCache<string>(2);
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.set('c', 'C');

    expect(cache.has('a')).toBe(false);
    expect(cache.peek('b')).toBe('B');
    expect(cache.peek('c')).toBe('C');
  });

  it('promotes a get so the next insert evicts the other entry', () => {
    const cache = createLazyPageCache<string>(2);
    cache.set('a', 'A');
    cache.set('b', 'B');

    expect(cache.get('a')).toBe('A');
    cache.set('c', 'C');

    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);
  });

  it('does not share an entry across different identities', () => {
    const cache = createLazyPageCache<{ data: number[]; totalRows: number }>(6);
    const byName = request();
    const byDate = request({
      sortModel: [{ field: 'date', direction: 'desc' }],
    });

    cache.set(cache.key(byName), { data: [1], totalRows: 1 });

    expect(cache.identity(byName)).not.toBe(cache.identity(byDate));
    expect(cache.has(cache.key(byDate))).toBe(false);
    expect(cache.get(cache.key(byName))).toEqual({ data: [1], totalRows: 1 });
  });

  it('builds a stable key for the same request and keeps identity free of page', () => {
    const cache = createLazyPageCache<number>();
    const first = request({ page: 2 });
    const second = request({ page: 2 });
    const otherPage = request({ page: 3 });

    expect(cache.key(first)).toBe(cache.key(second));
    expect(cache.identity(first)).toBe(cache.identity(second));
    expect(cache.identity(first)).toBe(cache.identity(otherPage));
    expect(cache.key(first)).not.toBe(cache.key(otherPage));
    expect(cache.key(first).slice(`${first.page}`.length + 1)).toBe(cache.identity(first));
    expect(cache.key(first)).toContain('status:equals:open|pending');
    expect(cache.key(first)).toContain('name:asc');
    expect(cache.key(first)).toContain('bolt');
  });

  it('clearPrefix drops only pages of that identity and peek does not promote', () => {
    const cache = createLazyPageCache<string>();
    const namePage0 = request({ page: 0 });
    const namePage1 = request({ page: 1 });
    const datePage0 = request({ page: 0, sortModel: [{ field: 'date', direction: 'desc' }] });

    cache.set(cache.key(namePage0), 'n0');
    cache.set(cache.key(namePage1), 'n1');
    cache.set(cache.key(datePage0), 'd0');
    cache.clearPrefix(cache.identity(namePage0));

    expect(cache.has(cache.key(namePage0))).toBe(false);
    expect(cache.has(cache.key(namePage1))).toBe(false);
    expect(cache.peek(cache.key(datePage0))).toBe('d0');

    const lru = createLazyPageCache<string>(2);
    lru.set('a', 'A');
    lru.set('b', 'B');
    expect(lru.peek('a')).toBe('A');
    lru.set('c', 'C');
    expect(lru.has('a')).toBe(false);
    expect(lru.has('b')).toBe(true);
  });

  it('builds the same key when object fields change order and a Date uses a stable ISO', () => {
    const cache = createLazyPageCache<number>();
    const iso = '2026-10-13T11:45:00.000Z';
    const insertionOrder = request({
      filterModel: [{
        field: 'meta',
        filterType: 'text',
        operator: 'equals',
        value: { zeta: 2, alpha: { b: 1, a: 'x' } },
      }],
    });
    const otherOrder = request({
      filterModel: [{
        field: 'meta',
        filterType: 'text',
        operator: 'equals',
        value: { alpha: { a: 'x', b: 1 }, zeta: 2 },
      }],
    });
    const dated = request({
      filterModel: [{
        field: 'when',
        filterType: 'date',
        operator: 'equals',
        value: new Date(iso),
      }],
    });
    const datedAgain = request({
      filterModel: [{
        field: 'when',
        filterType: 'date',
        operator: 'equals',
        value: new Date(iso),
      }],
    });

    expect(cache.key(insertionOrder)).toBe(cache.key(otherOrder));
    expect(cache.key(insertionOrder)).not.toContain('[object Object]');
    expect(cache.key(dated)).toBe(cache.key(datedAgain));
    expect(cache.key(dated)).toContain(iso);
  });

  it('uses a default capacity of 6', () => {
    const cache = createLazyPageCache<number>();
    for (let i = 0; i < 7; i += 1) cache.set(String(i), i);
    expect(cache.has('0')).toBe(false);
    expect(cache.has('1')).toBe(true);
    expect(cache.has('6')).toBe(true);
  });
});
