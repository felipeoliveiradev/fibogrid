import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  copyToClipboard,
  defaultComparator,
  defaultFilterComparator,
  exportToCsv,
  fastComparator,
  getValueFromPath,
  mergeUnique,
  sortRows,
} from './helpers';
import type { FilterModel, FilterType, ProcessedColumn, RowNode } from '../types';

function row<T>(id: string, data: T, rowIndex = 0): RowNode<T> {
  return { id, data, rowIndex, selected: false };
}

function column<T>(field: string, headerName = field): ProcessedColumn<T> {
  return {
    field,
    headerName,
    computedWidth: 120,
    left: 0,
    index: 0,
  };
}

function filter(
  operator: NonNullable<FilterModel['operator']>,
  value: FilterModel['value'],
  filterType: FilterType,
): FilterModel {
  return { field: 'v', filterType, operator, value };
}

function csvFromExport<T>(rows: RowNode<T>[], columns: ProcessedColumn<T>[]): string {
  const parts: string[] = [];
  const NativeBlob = globalThis.Blob;

  class RecordingBlob extends NativeBlob {
    constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
      super(blobParts, options);
      for (const part of blobParts ?? []) {
        if (typeof part === 'string') parts.push(part);
      }
    }
  }

  vi.stubGlobal('Blob', RecordingBlob);
  vi.stubGlobal('document', {
    createElement: () => ({
      href: '',
      download: '',
      click() {},
    }),
  });
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:fibogrid-test',
    revokeObjectURL: () => {},
  });

  try {
    exportToCsv(rows, columns);
  } finally {
    vi.unstubAllGlobals();
  }

  return parts.join('');
}

function unquoteCsvCell(cell: string): string {
  if (cell.startsWith('"') && cell.endsWith('"')) {
    return cell.slice(1, -1).replace(/""/g, '"');
  }
  return cell;
}

describe('mergeUnique', () => {
  it('keeps the incoming row when ids collide and does not throw', () => {
    const merged = mergeUnique([{ id: 1, v: 'a' }], [{ id: 1, v: 'b' }], 'id');
    expect(merged).toEqual([{ id: 1, v: 'b' }]);
    expect(merged).toHaveLength(1);
  });

  it('returns incoming when the original list is empty', () => {
    expect(mergeUnique([], [{ id: 2 }], 'id')).toEqual([{ id: 2 }]);
  });

  it('returns the original when incoming is empty', () => {
    expect(mergeUnique([{ id: 1 }], [], 'id')).toEqual([{ id: 1 }]);
  });
});

describe('defaultFilterComparator', () => {
  it('compares ISO dates with greaterThan', () => {
    expect(defaultFilterComparator(filter('greaterThan', '2020-01-01', 'date'), '2020-01-02')).toBe(true);
    expect(defaultFilterComparator(filter('greaterThan', '2020-01-02', 'date'), '2020-01-01')).toBe(false);
  });

  it('compares numbers with greaterThan and lessThan', () => {
    expect(defaultFilterComparator(filter('greaterThan', 3, 'number'), 10)).toBe(true);
    expect(defaultFilterComparator(filter('lessThan', 10, 'number'), 3)).toBe(true);
  });

  it('treats a date-only value as the same local calendar day as a timestamp', () => {
    expect(
      defaultFilterComparator(filter('equals', '2024-06-01T15:30:00', 'date'), '2024-06-01'),
    ).toBe(true);
    expect(
      defaultFilterComparator(filter('equals', '2024-06-01', 'date'), '2024-06-01T15:30:00'),
    ).toBe(true);
  });

  it('includes a timestamp on the date-only end bound and rejects a single between value', () => {
    expect(
      defaultFilterComparator(filter('between', ['2024-06-01', '2024-06-01'], 'date'), '2024-06-01T15:30:00'),
    ).toBe(true);
    expect(
      defaultFilterComparator(filter('between', '2024-06-01', 'date'), '2024-06-01T15:30:00'),
    ).toBe(false);
    expect(
      defaultFilterComparator(filter('between', [Number.NaN, 10], 'number'), 5),
    ).toBe(false);
  });
});

describe('numeric string sort', () => {
  it('orders numeric strings by value', () => {
    expect(fastComparator('10', '2')).toBeGreaterThan(0);
    expect(defaultComparator('10', '2')).toBeGreaterThan(0);
    expect(fastComparator('10a', '2')).toBe('10a'.localeCompare('2'));
  });
});

describe('sortRows', () => {
  it('places the earlier Date first when sorting ascending', () => {
    const older = new Date('2020-01-01T00:00:00.000Z');
    const newer = new Date('2020-06-15T00:00:00.000Z');
    const sorted = sortRows(
      [row('newer', { when: newer }, 0), row('older', { when: older }, 1)],
      [{ field: 'when', direction: 'asc' }],
      [column<{ when: Date }>('when')],
    );

    expect(sorted.map((node) => node.id)).toEqual(['older', 'newer']);
    expect((sorted[0].data as { when: Date }).when.getTime()).toBe(older.getTime());
  });
});

describe('exportToCsv formula cells', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not emit a cell Excel would execute for =1+1', () => {
    const csv = csvFromExport(
      [row('1', { formula: '=1+1' })],
      [column('formula', 'Formula')],
    );
    const dataLine = csv.trim().split('\n').at(-1) ?? '';
    const cell = unquoteCsvCell(dataLine.split(',')[0] ?? '');

    expect(cell.includes('1+1')).toBe(true);
    expect(cell.startsWith('=')).toBe(false);
    expect(cell.startsWith("'")).toBe(true);
  });

  it('keeps a formatted -5 as a number instead of a quoted formula', () => {
    const amount = column<{ amount: number }>('amount', 'Amount');
    amount.valueFormatter = () => '-5';
    const csv = csvFromExport([row('1', { amount: -5 })], [amount]);
    const dataLine = csv.trim().split('\n').at(-1) ?? '';
    const cell = unquoteCsvCell(dataLine.split(',')[0] ?? '');

    expect(cell.startsWith("'")).toBe(false);
    expect(cell).toContain('-5');
  });
});

describe('copyToClipboard formula cells', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('neutralizes = formulas the same way CSV export does', async () => {
    let written = '';
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: async (text: string) => {
          written = text;
        },
      },
    });

    await copyToClipboard(
      [row('1', { formula: '=1+1', amount: -5 })],
      [column('formula', 'Formula'), column<{ amount: number }>('amount', 'Amount')],
    );

    const dataLine = written.trim().split('\n').at(-1) ?? '';
    const [formulaCell, amountCell] = dataLine.split('\t');
    expect(formulaCell?.startsWith('=')).toBe(false);
    expect(formulaCell?.startsWith("'")).toBe(true);
    expect(amountCell).toBe('-5');
  });
});

describe('getValueFromPath', () => {
  it('reads nested and top-level paths', () => {
    expect(getValueFromPath({ a: { b: 1 } }, 'a.b')).toBe(1);
    expect(getValueFromPath({ a: 1 }, 'a')).toBe(1);
  });
});
