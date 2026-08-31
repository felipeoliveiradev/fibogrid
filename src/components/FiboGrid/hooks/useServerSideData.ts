import { useRef, useCallback, useSyncExternalStore } from 'react';
import { ServerSideDataSource, ServerSideDataSourceRequest } from '../types';
import { mergeInfiniteRows, serverQueryIdentity } from '../utils/infiniteScroll';
export interface ServerSideDataState<T> {
  data: T[];
  totalRows: number;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  updateData: (updater: (data: T[]) => T[]) => void;
}
export interface UseServerSideDataOptions<T> {
  append?: boolean;
  getRowId?: (row: T) => string;
}
export function useServerSideData<T>(
  enabled: boolean,
  dataSource: ServerSideDataSource<T> | undefined,
  request: ServerSideDataSourceRequest,
  options: UseServerSideDataOptions<T> = {},
) {
  const stateRef = useRef<ServerSideDataState<T>>({
    data: [],
    totalRows: 0,
    loading: false,
    error: null,
    refresh: () => { },
    updateData: () => { },
  });
  const listenersRef = useRef<Set<() => void>>(new Set());
  const currentRequestRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const dataSourceRef = useRef<ServerSideDataSource<T> | undefined>(undefined);
  const queryIdentityRef = useRef<string>('');
  const getCacheKey = useCallback((req: ServerSideDataSourceRequest): string => {
    const sortHash = JSON.stringify(req.sortModel);
    const filterHash = JSON.stringify(req.filterModel);
    return `${req.page}-${req.pageSize}-${sortHash}-${filterHash}-${req.quickFilterText || ''}`;
  }, []);
  const fetchData = useCallback(
    async (req: ServerSideDataSourceRequest) => {
      if (!enabled || !dataSource) return;
      const cacheKey = getCacheKey(req);
      if (currentRequestRef.current === cacheKey) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      currentRequestRef.current = cacheKey;
      abortControllerRef.current = new AbortController();
      const identity = serverQueryIdentity(req);
      const append = Boolean(options.append) && identity === queryIdentityRef.current && req.page > 0;
      stateRef.current = { ...stateRef.current, loading: true, error: null };
      listenersRef.current.forEach((listener) => listener());
      try {
        const response = await dataSource.getRows(req);
        if (currentRequestRef.current === cacheKey) {
          queryIdentityRef.current = identity;
          const data = append
            ? mergeInfiniteRows(stateRef.current.data, response.data, options.getRowId)
            : response.data;
          stateRef.current = {
            data,
            totalRows: response.totalRows,
            loading: false,
            error: null,
            refresh: stateRef.current.refresh,
            updateData: stateRef.current.updateData,
          };
          listenersRef.current.forEach((listener) => listener());
        }
      } catch (error) {
        if (currentRequestRef.current === cacheKey) {
          stateRef.current = {
            ...stateRef.current,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          };
          listenersRef.current.forEach((listener) => listener());
        }
      }
    },
    [enabled, dataSource, getCacheKey, options.append, options.getRowId]
  );
  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);
  const refresh = useCallback(() => {
    currentRequestRef.current = '';
    queryIdentityRef.current = '';
    listenersRef.current.forEach((listener) => listener());
  }, []);
  const updateData = useCallback((updater: (data: T[]) => T[]) => {
    stateRef.current = {
      ...stateRef.current,
      data: updater(stateRef.current.data)
    };
    listenersRef.current.forEach((listener) => listener());
  }, []);
  const getSnapshot = useCallback(() => {
    const cacheKey = getCacheKey(request);
    const dataSourceChanged = dataSourceRef.current !== dataSource;
    if (dataSourceChanged) {
      dataSourceRef.current = dataSource;
      currentRequestRef.current = '';
    }
    if (currentRequestRef.current !== cacheKey || dataSourceChanged) {
      queueMicrotask(() => fetchData(request));
    }
    if (stateRef.current.refresh !== refresh) {
      stateRef.current = { ...stateRef.current, refresh };
    }
    if (stateRef.current.updateData !== updateData) {
      stateRef.current = { ...stateRef.current, updateData };
    }
    return stateRef.current;
  }, [request, dataSource, getCacheKey, fetchData, refresh, updateData]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
