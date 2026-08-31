import { ServerSideDataSourceRequest } from '../types';

export function serverQueryIdentity(
  req: Pick<ServerSideDataSourceRequest, 'pageSize' | 'sortModel' | 'filterModel' | 'quickFilterText'>,
): string {
  return JSON.stringify({
    pageSize: req.pageSize,
    sortModel: req.sortModel,
    filterModel: req.filterModel,
    quickFilterText: req.quickFilterText || '',
  });
}

export function mergeInfiniteRows<T>(
  previous: T[],
  incoming: T[],
  getRowId?: (row: T) => string,
): T[] {
  if (previous.length === 0) return incoming;
  if (incoming.length === 0) return previous;
  if (!getRowId) return [...previous, ...incoming];
  const seen = new Set(previous.map((row) => getRowId(row)));
  const extra = incoming.filter((row) => {
    const id = getRowId(row);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return extra.length === 0 ? previous : [...previous, ...extra];
}

export function shouldLoadMoreOnScroll(
  remainingPx: number,
  thresholdPx: number,
  loading: boolean,
  currentPage: number,
  totalPages: number,
): boolean {
  if (loading) return false;
  if (totalPages <= 1) return false;
  if (currentPage >= totalPages - 1) return false;
  return remainingPx <= thresholdPx;
}
