import { describe, expect, it } from 'vitest';
import type { RowNode } from '../types';
import { binarySearchInsertIndex, compareNumeric, repositionRows } from './sortedIndex';

type Data = { id: string; price?: unknown };

function node(id: string, price: unknown, rowIndex = 0): RowNode<Data> {
  return { id, data: { id, price }, rowIndex, selected: false };
}

function sortedNodes(prices: number[], dir: 'asc' | 'desc' = 'asc'): RowNode<Data>[] {
  const ordered = prices.slice().sort((a, b) => (dir === 'asc' ? a - b : b - a));
  return ordered.map((p, i) => node(`r${p}`, p, i));
}

function prices(rows: RowNode<Data>[]): number[] {
  return rows.map((r) => r.data.price as number);
}

function expectOrdered(rows: RowNode<Data>[], dir: 'asc' | 'desc') {
  for (let i = 1; i < rows.length; i++) {
    expect(compareNumeric(rows[i - 1], rows[i], 'price', dir)).toBeLessThanOrEqual(0);
  }
  rows.forEach((r, i) => expect(r.rowIndex).toBe(i));
}

describe('compareNumeric', () => {
  it('orders asc and desc', () => {
    expect(compareNumeric(node('a', 1), node('b', 2), 'price', 'asc')).toBeLessThan(0);
    expect(compareNumeric(node('a', 1), node('b', 2), 'price', 'desc')).toBeGreaterThan(0);
    expect(compareNumeric(node('a', 2), node('b', 2), 'price', 'asc')).toBe(0);
  });

  it('treats missing / non-number as +Infinity', () => {
    const missing = node('m', undefined);
    expect(compareNumeric(node('a', 5), missing, 'price', 'asc')).toBeLessThan(0);
    expect(compareNumeric(missing, node('s', 'x'), 'price', 'asc')).toBe(0);
    expect(compareNumeric(node('n', NaN), node('a', 5), 'price', 'asc')).toBeGreaterThan(0);
  });
});

describe('binarySearchInsertIndex', () => {
  it('finds insertion points asc', () => {
    const rows = sortedNodes([10, 20, 30]);
    expect(binarySearchInsertIndex(rows, node('x', 5), 'price', 'asc')).toBe(0);
    expect(binarySearchInsertIndex(rows, node('x', 25), 'price', 'asc')).toBe(2);
    expect(binarySearchInsertIndex(rows, node('x', 99), 'price', 'asc')).toBe(3);
  });

  it('finds insertion points desc', () => {
    const rows = sortedNodes([10, 20, 30], 'desc');
    expect(binarySearchInsertIndex(rows, node('x', 99), 'price', 'desc')).toBe(0);
    expect(binarySearchInsertIndex(rows, node('x', 15), 'price', 'desc')).toBe(2);
    expect(binarySearchInsertIndex(rows, node('x', 1), 'price', 'desc')).toBe(3);
  });

  it('inserts after equal values', () => {
    const rows = sortedNodes([10, 20, 30]);
    expect(binarySearchInsertIndex(rows, node('x', 20), 'price', 'asc')).toBe(2);
  });
});

describe('repositionRows', () => {
  it('moves a changed row and keeps order (asc)', () => {
    const sorted = sortedNodes([10, 20, 30, 40]);
    const updated = node('r10', 35);
    const out = repositionRows(sorted, ['r10'], new Map([['r10', updated]]), 'price', 'asc');
    expect(prices(out)).toEqual([20, 30, 35, 40]);
    expectOrdered(out, 'asc');
    expect(out).not.toBe(sorted);
    expect(prices(sorted)).toEqual([10, 20, 30, 40]);
    expect(sorted[0].rowIndex).toBe(0);
  });

  it('moves a changed row and keeps order (desc)', () => {
    const sorted = sortedNodes([10, 20, 30, 40], 'desc');
    const updated = node('r40', 5);
    const out = repositionRows(sorted, ['r40'], new Map([['r40', updated]]), 'price', 'desc');
    expect(prices(out)).toEqual([30, 20, 10, 5]);
    expectOrdered(out, 'desc');
  });

  it('in-place fast path swaps the node without moving others', () => {
    const sorted = sortedNodes([10, 20, 30]);
    const updated = node('r20', 21, 1);
    const out = repositionRows(sorted, ['r20'], new Map([['r20', updated]]), 'price', 'asc');
    expect(prices(out)).toEqual([10, 21, 30]);
    expect(out[0]).toBe(sorted[0]);
    expect(out[2]).toBe(sorted[2]);
    expect(out[1]).toBe(updated);
    expectOrdered(out, 'asc');
  });

  it('assigns rowIndex to replacement nodes from the base index', () => {
    const sorted = sortedNodes([10, 20, 30]);
    const updated = node('r10', 25, 99);
    const out = repositionRows(sorted, ['r10'], new Map([['r10', updated]]), 'price', 'asc');
    expect(out.map((r) => r.id)).toEqual(['r20', 'r10', 'r30']);
    expectOrdered(out, 'asc');
  });

  it('ignores unknown ids and returns same array when nothing applies', () => {
    const sorted = sortedNodes([1, 2, 3]);
    expect(repositionRows(sorted, [], new Map(), 'price', 'asc')).toBe(sorted);
    expect(repositionRows(sorted, ['nope'], new Map([['nope', node('nope', 1)]]), 'price', 'asc')).toBe(sorted);
    expect(repositionRows(sorted, ['r1'], new Map(), 'price', 'asc')).toBe(sorted);
  });

  it('handles duplicate changed ids', () => {
    const sorted = sortedNodes([10, 20, 30]);
    const updated = node('r10', 40);
    const out = repositionRows(sorted, ['r10', 'r10'], new Map([['r10', updated]]), 'price', 'asc');
    expect(prices(out)).toEqual([20, 30, 40]);
    expect(out).toHaveLength(3);
  });

  it.each(['asc', 'desc'] as const)('1000 items, 10 updated ids stay sorted (%s)', (dir) => {
    const n = 1000;
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const values = Array.from({ length: n }, () => Math.round(rand() * 100000));
    const base = values.map((v, i) => node(`id${i}`, v, i));
    const initial = base
      .slice()
      .sort((a, b) => compareNumeric(a, b, 'price', dir))
      .map((r, i) => ({ ...r, rowIndex: i }));

    const changed = Array.from({ length: 10 }, (_, i) => `id${i * 97}`);
    const rowById = new Map<string, RowNode<Data>>();
    changed.forEach((id) => rowById.set(id, node(id, Math.round(rand() * 100000))));

    const out = repositionRows(initial, changed, rowById, 'price', dir);
    expect(out).toHaveLength(n);
    expectOrdered(out, 'asc' === dir ? 'asc' : 'desc');
    expect(new Set(out.map((r) => r.id)).size).toBe(n);

    // Equivalent to a full sort of the updated data.
    const full = initial
      .map((r) => rowById.get(r.id) ?? r)
      .sort((a, b) => compareNumeric(a, b, 'price', dir));
    expect(prices(out)).toEqual(prices(full));
    changed.forEach((id) => {
      expect(out.find((r) => r.id === id)!.data.price).toBe(rowById.get(id)!.data.price);
    });
  });
});
