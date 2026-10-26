import type { RowNode } from '../types';
import { getValueFromPath } from './helpers';

export type NumericSortDirection = 'asc' | 'desc';

/**
 * Numeric sort key. Missing / non-number / NaN values map to +Infinity so
 * they cluster deterministically at one end instead of breaking binary search.
 */
function numericKey(row: RowNode, field: string): number {
  const value = getValueFromPath(row.data, field);
  return typeof value === 'number' && !Number.isNaN(value) ? value : Infinity;
}

export function compareNumeric(
  a: RowNode,
  b: RowNode,
  field: string,
  dir: NumericSortDirection,
): number {
  const ka = numericKey(a, field);
  const kb = numericKey(b, field);
  if (ka === kb) return 0;
  const asc = ka < kb ? -1 : 1;
  return dir === 'desc' ? -asc : asc;
}

/**
 * Upper-bound binary search: index where `row` should be inserted so the array
 * stays sorted, placing it AFTER any rows that compare equal (stable w.r.t.
 * existing order). O(log n).
 */
export function binarySearchInsertIndex<T = any>(
  sorted: readonly RowNode<T>[],
  row: RowNode<T>,
  field: string,
  dir: NumericSortDirection,
): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compareNumeric(sorted[mid], row, field, dir) <= 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Reposition only the rows listed in `changedIds` inside an already-sorted
 * array. Replacement nodes are taken from `rowById` (fresh node objects after
 * a data update). Ids missing from `sorted` or `rowById` are ignored.
 *
 * Returns a NEW array; the input is never mutated. `rowIndex` is rewritten to
 * the final position (0..n-1) only for nodes whose index actually changed.
 */
export function repositionRows<T = any>(
  sorted: RowNode<T>[],
  changedIds: readonly string[],
  rowById: ReadonlyMap<string, RowNode<T>>,
  field: string,
  dir: NumericSortDirection,
): RowNode<T>[] {
  const n = sorted.length;
  if (n === 0 || changedIds.length === 0) return sorted;

  // id -> current index, built once.
  const indexById = new Map<string, number>();
  for (let i = 0; i < n; i++) indexById.set(sorted[i].id, i);

  const changedIdx: number[] = [];
  const seen = new Set<string>();
  const replacements = new Map<number, RowNode<T>>();
  for (let c = 0; c < changedIds.length; c++) {
    const id = changedIds[c];
    if (seen.has(id)) continue;
    seen.add(id);
    const idx = indexById.get(id);
    const node = rowById.get(id);
    if (idx === undefined || node === undefined) continue;
    changedIdx.push(idx);
    replacements.set(idx, node);
  }
  if (changedIdx.length === 0) return sorted;

  // Fast path: every changed row is still ordered relative to its neighbours
  // at its old position -> no movement needed, just swap the nodes in place.
  const inPlace = sorted.slice();
  for (let c = 0; c < changedIdx.length; c++) {
    const i = changedIdx[c];
    inPlace[i] = replacements.get(i)!;
  }
  let stable = true;
  for (let c = 0; c < changedIdx.length && stable; c++) {
    const i = changedIdx[c];
    const cur = inPlace[i];
    if (i > 0 && compareNumeric(inPlace[i - 1], cur, field, dir) > 0) stable = false;
    else if (i < n - 1 && compareNumeric(cur, inPlace[i + 1], field, dir) > 0) stable = false;
  }

  let result: RowNode<T>[];
  if (stable) {
    result = inPlace;
  } else {
    // General path: drop changed rows, then binary-insert each one.
    const removed = new Set<number>(changedIdx);
    const rest: RowNode<T>[] = [];
    for (let i = 0; i < n; i++) {
      if (!removed.has(i)) rest.push(sorted[i]);
    }
    for (let c = 0; c < changedIdx.length; c++) {
      const node = replacements.get(changedIdx[c])!;
      rest.splice(binarySearchInsertIndex(rest, node, field, dir), 0, node);
    }
    result = rest;
  }

  // Reassign rowIndex only where it differs (allocates only for moved nodes).
  for (let i = 0; i < n; i++) {
    const node = result[i];
    if (node.rowIndex !== i) result[i] = { ...node, rowIndex: i };
  }
  return result;
}
