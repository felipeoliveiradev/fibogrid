import { useRef, useCallback, useSyncExternalStore } from 'react';
import { ServerSideDataSource, ServerSideDataSourceRequest } from '../types';
import { mergeInfiniteRows, serverQueryIdentity } from '../utils/infiniteScroll';
import { createLazyPageCache, LazyPageCache } from '../utils/lazyPageCache';

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: string }).name === 'AbortError';
}
function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unknown error');
}
function emitListeners(listeners: Set<() => void>) {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Subscriber failures must not reject the fetch.
    }
  });
}
function scheduleIdleTask(task: () => void): () => void {
  if (typeof globalThis.requestIdleCallback === 'function') {
    const id = globalThis.requestIdleCallback(() => {
      task();
    });
    return () => {
      globalThis.cancelIdleCallback?.(id);
    };
  }
  const id = setTimeout(task, 1);
  return () => {
    clearTimeout(id);
  };
}
interface PageEntry<T> {
  data: T[];
  totalRows: number;
}
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
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dataSourceRef = useRef<ServerSideDataSource<T> | undefined>(undefined);
  const queryIdentityRef = useRef<string>('');
  const pageCacheRef = useRef<LazyPageCache<PageEntry<T>> | null>(null);
  if (pageCacheRef.current === null) {
    pageCacheRef.current = createLazyPageCache<PageEntry<T>>();
  }
  const cacheIdentityRef = useRef('');
  const prefetchAbortRef = useRef<AbortController | null>(null);
  const backgroundAbortRef = useRef<AbortController | null>(null);
  const cancelPrefetchIdleRef = useRef<(() => void) | null>(null);
  const getCacheKey = useCallback((req: ServerSideDataSourceRequest): string => {
    const sortHash = JSON.stringify(req.sortModel);
    const filterHash = JSON.stringify(req.filterModel);
    return `${req.page}-${req.pageSize}-${sortHash}-${filterHash}-${req.quickFilterText || ''}`;
  }, []);
  const publishError = useCallback((error: unknown) => {
    stateRef.current = {
      ...stateRef.current,
      loading: false,
      error: toError(error),
    };
    emitListeners(listenersRef.current);
  }, []);
  const abortBackgroundRefresh = useCallback(() => {
    if (!backgroundAbortRef.current) return;
    backgroundAbortRef.current.abort();
    backgroundAbortRef.current = null;
  }, []);
  const cancelPrefetch = useCallback(() => {
    if (prefetchAbortRef.current) {
      prefetchAbortRef.current.abort();
      prefetchAbortRef.current = null;
    }
    if (cancelPrefetchIdleRef.current) {
      cancelPrefetchIdleRef.current();
      cancelPrefetchIdleRef.current = null;
    }
  }, []);
  const clearPageCache = useCallback(() => {
    if (!cacheIdentityRef.current || !pageCacheRef.current) return;
    pageCacheRef.current.clearPrefix(cacheIdentityRef.current);
    cacheIdentityRef.current = '';
  }, []);
  const fetchData = useCallback(
    (req: ServerSideDataSourceRequest): Promise<void> => {
      if (!enabled || !dataSource) return Promise.resolve();
      const source = dataSource;
      const cache = pageCacheRef.current;
      const schedulePrefetch = (pageReq: ServerSideDataSourceRequest, totalRows: number) => {
        if (options.append || !cache) return;
        if ((pageReq.page + 1) * pageReq.pageSize >= totalRows) return;
        const nextReq: ServerSideDataSourceRequest = {
          page: pageReq.page + 1,
          pageSize: pageReq.pageSize,
          sortModel: pageReq.sortModel.slice(),
          filterModel: pageReq.filterModel.slice(),
          quickFilterText: pageReq.quickFilterText,
        };
        const nextKey = cache.key(nextReq);
        if (cache.has(nextKey)) return;
        const scheduledIdentity = cache.identity(nextReq);
        cancelPrefetch();
        const controller = new AbortController();
        prefetchAbortRef.current = controller;
        cancelPrefetchIdleRef.current = scheduleIdleTask(() => {
          cancelPrefetchIdleRef.current = null;
          if (controller.signal.aborted) return;
          void Promise.resolve()
            .then(() => source.getRows({ ...nextReq, signal: controller.signal }))
            .then((response) => {
              if (controller.signal.aborted) return;
              if (cacheIdentityRef.current !== scheduledIdentity) return;
              cache.set(nextKey, { data: response.data, totalRows: response.totalRows });
            })
            .catch(() => {
              // Prefetch never publishes loading, data, or errors.
            });
        });
      };
      if (!options.append && cache) {
        const pageKey = cache.key(req);
        if (currentRequestRef.current === pageKey) return Promise.resolve();
        cancelPrefetch();
        const nextIdentity = cache.identity(req);
        if (cacheIdentityRef.current !== nextIdentity) {
          if (cacheIdentityRef.current) cache.clearPrefix(cacheIdentityRef.current);
          cacheIdentityRef.current = nextIdentity;
        }
        const cached = cache.get(pageKey);
        if (cached) {
          abortBackgroundRefresh();
          const refreshController = new AbortController();
          backgroundAbortRef.current = refreshController;
          const refreshId = ++requestIdRef.current;
          currentRequestRef.current = pageKey;
          stateRef.current = {
            ...stateRef.current,
            data: cached.data,
            totalRows: cached.totalRows,
            loading: false,
            error: null,
          };
          emitListeners(listenersRef.current);
          schedulePrefetch(req, cached.totalRows);
          void Promise.resolve()
            .then(() => source.getRows({ ...req, signal: refreshController.signal }))
            .then((response) => {
              if (refreshController.signal.aborted) return;
              if (refreshId !== requestIdRef.current) return;
              if (currentRequestRef.current !== pageKey) return;
              cache.set(pageKey, { data: response.data, totalRows: response.totalRows });
              stateRef.current = {
                data: response.data,
                totalRows: response.totalRows,
                loading: false,
                error: null,
                refresh: stateRef.current.refresh,
                updateData: stateRef.current.updateData,
              };
              emitListeners(listenersRef.current);
              schedulePrefetch(req, response.totalRows);
            })
            .catch(() => {
              // A stale or failed refresh must not dim or replace the visible page.
            });
          return Promise.resolve();
        }
        abortBackgroundRefresh();
        let requestId = 0;
        let controller: AbortController | null = null;
        try {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          requestId = ++requestIdRef.current;
          currentRequestRef.current = pageKey;
          controller = new AbortController();
          abortControllerRef.current = controller;
          const identity = serverQueryIdentity(req);
          stateRef.current = { ...stateRef.current, loading: true, error: null };
          emitListeners(listenersRef.current);
          const activeId = requestId;
          const activeController = controller;
          return Promise.resolve()
            .then(() => source.getRows({ ...req, signal: activeController.signal }))
            .then((response) => {
              if (activeId !== requestIdRef.current) return;
              if (activeController.signal.aborted) {
                stateRef.current = { ...stateRef.current, loading: false };
                emitListeners(listenersRef.current);
                return;
              }
              queryIdentityRef.current = identity;
              cache.set(pageKey, { data: response.data, totalRows: response.totalRows });
              stateRef.current = {
                data: response.data,
                totalRows: response.totalRows,
                loading: false,
                error: null,
                refresh: stateRef.current.refresh,
                updateData: stateRef.current.updateData,
              };
              emitListeners(listenersRef.current);
              schedulePrefetch(req, response.totalRows);
            })
            .catch((error: unknown) => {
              if (activeId !== requestIdRef.current) return;
              if (activeController.signal.aborted || isAbortError(error)) {
                stateRef.current = { ...stateRef.current, loading: false };
                emitListeners(listenersRef.current);
                return;
              }
              publishError(error);
            });
        } catch (error) {
          if (isAbortError(error)) return Promise.resolve();
          if (requestId !== 0 && requestId !== requestIdRef.current) return Promise.resolve();
          publishError(error);
          return Promise.resolve();
        }
      }
      let requestId = 0;
      let controller: AbortController | null = null;
      try {
        const cacheKey = getCacheKey(req);
        if (currentRequestRef.current === cacheKey) return Promise.resolve();
        abortBackgroundRefresh();
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        requestId = ++requestIdRef.current;
        currentRequestRef.current = cacheKey;
        controller = new AbortController();
        abortControllerRef.current = controller;
        const identity = serverQueryIdentity(req);
        const append = Boolean(options.append) && identity === queryIdentityRef.current && req.page > 0;
        stateRef.current = { ...stateRef.current, loading: true, error: null };
        emitListeners(listenersRef.current);
        const activeId = requestId;
        const activeController = controller;
        return Promise.resolve()
          .then(() => dataSource.getRows({ ...req, signal: activeController.signal }))
          .then((response) => {
            if (activeId !== requestIdRef.current) return;
            if (activeController.signal.aborted) {
              stateRef.current = { ...stateRef.current, loading: false };
              emitListeners(listenersRef.current);
              return;
            }
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
            emitListeners(listenersRef.current);
          })
          .catch((error: unknown) => {
            if (activeId !== requestIdRef.current) return;
            if (activeController.signal.aborted || isAbortError(error)) {
              stateRef.current = { ...stateRef.current, loading: false };
              emitListeners(listenersRef.current);
              return;
            }
            publishError(error);
          });
      } catch (error) {
        if (isAbortError(error)) return Promise.resolve();
        if (requestId !== 0 && requestId !== requestIdRef.current) return Promise.resolve();
        publishError(error);
        return Promise.resolve();
      }
    },
    [enabled, dataSource, getCacheKey, options.append, options.getRowId, publishError, cancelPrefetch, abortBackgroundRefresh]
  );
  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);
  const refresh = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortBackgroundRefresh();
    cancelPrefetch();
    requestIdRef.current += 1;
    currentRequestRef.current = '';
    queryIdentityRef.current = '';
    clearPageCache();
    emitListeners(listenersRef.current);
  }, [cancelPrefetch, clearPageCache, abortBackgroundRefresh]);
  const updateData = useCallback((updater: (data: T[]) => T[]) => {
    stateRef.current = {
      ...stateRef.current,
      data: updater(stateRef.current.data)
    };
    listenersRef.current.forEach((listener) => listener());
  }, []);
  const getSnapshot = useCallback(() => {
    const cacheKey = options.append || !pageCacheRef.current
      ? getCacheKey(request)
      : pageCacheRef.current.key(request);
    const dataSourceChanged = dataSourceRef.current !== dataSource;
    if (dataSourceChanged) {
      dataSourceRef.current = dataSource;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortBackgroundRefresh();
      cancelPrefetch();
      requestIdRef.current += 1;
      currentRequestRef.current = '';
      clearPageCache();
    }
    if (currentRequestRef.current !== cacheKey || dataSourceChanged) {
      queueMicrotask(() => {
        const scheduledId = requestIdRef.current;
        void fetchData(request).catch((error: unknown) => {
          if (isAbortError(error)) return;
          if (requestIdRef.current > scheduledId + 1) return;
          publishError(error);
        });
      });
    }
    if (stateRef.current.refresh !== refresh) {
      stateRef.current = { ...stateRef.current, refresh };
    }
    if (stateRef.current.updateData !== updateData) {
      stateRef.current = { ...stateRef.current, updateData };
    }
    return stateRef.current;
  }, [request, dataSource, getCacheKey, fetchData, refresh, updateData, options.append, cancelPrefetch, clearPageCache, publishError, abortBackgroundRefresh]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
