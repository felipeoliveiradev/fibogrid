import { describe, expect, it } from 'vitest';
import { mergeInfiniteRows, shouldLoadMoreOnScroll } from './infiniteScroll';

describe('fibogrid infinite scroll helpers', () => {
  it('appends incoming rows and skips duplicates by id', () => {
    const prev = [{ id: 1 }, { id: 2 }];
    const next = [{ id: 2 }, { id: 3 }];
    expect(mergeInfiniteRows(prev, next, (row) => String(row.id))).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
  });

  it('loads more only near the bottom while pages remain', () => {
    expect(shouldLoadMoreOnScroll(100, 240, false, 0, 5)).toBe(true);
    expect(shouldLoadMoreOnScroll(400, 240, false, 0, 5)).toBe(false);
    expect(shouldLoadMoreOnScroll(100, 240, true, 0, 5)).toBe(false);
    expect(shouldLoadMoreOnScroll(100, 240, false, 4, 5)).toBe(false);
  });
});
