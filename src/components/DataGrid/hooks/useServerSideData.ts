import { useRef, useCallback, useSyncExternalStore } from 'react';
import { ServerSideDataSource, ServerSideDataSourceRequest } from '../types';

interface ServerSideDataState<T> {
  data: T[];
  totalRows: number;
  loading: boolean;
  error: Error | null;
}

interface CacheKey {
  page: number;
  pageSize: number;
  sortHash: string;
  filterHash: string;
  quickFilter: string;
}

/**
 * Hook to manage server-side data fetching without useEffect
 * Uses useSyncExternalStore for optimal re-render control
 */
export function useServerSideData<T>(
  enabled: boolean,
  dataSource: ServerSideDataSource<T> | undefined,
  request: ServerSideDataSourceRequest
) {
  const stateRef = useRef<ServerSideDataState<T>>({
    data: [],
    totalRows: 0,
    loading: false,
    error: null,
  });

  const listenersRef = useRef<Set<() => void>>(new Set());
  const currentRequestRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create cache key from request
  const getCacheKey = useCallback((req: ServerSideDataSourceRequest): string => {
    const sortHash = JSON.stringify(req.sortModel);
    const filterHash = JSON.stringify(req.filterModel);
    return `${req.page}-${req.pageSize}-${sortHash}-${filterHash}-${req.quickFilterText || ''}`;
  }, []);

  // Fetch data function
  const fetchData = useCallback(
    async (req: ServerSideDataSourceRequest) => {
      if (!enabled || !dataSource) return;

      const cacheKey = getCacheKey(req);
      
      // Skip if same request is already in progress
      if (currentRequestRef.current === cacheKey) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      currentRequestRef.current = cacheKey;
      abortControllerRef.current = new AbortController();

      // Set loading state
      stateRef.current = { ...stateRef.current, loading: true, error: null };
      listenersRef.current.forEach((listener) => listener());

      try {
        const response = await dataSource.getRows(req);
        
        // Only update if this is still the current request
        if (currentRequestRef.current === cacheKey) {
          stateRef.current = {
            data: response.data,
            totalRows: response.totalRows,
            loading: false,
            error: null,
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
    [enabled, dataSource, getCacheKey]
  );

  // Subscribe function for useSyncExternalStore
  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Get snapshot function for useSyncExternalStore
  const getSnapshot = useCallback(() => {
    const cacheKey = getCacheKey(request);
    
    // Trigger fetch if needed (only when key changes)
    if (currentRequestRef.current !== cacheKey) {
      // Use queueMicrotask to avoid setState during render
      queueMicrotask(() => fetchData(request));
    }
    
    return stateRef.current;
  }, [request, getCacheKey, fetchData]);

  // Use sync external store for optimal re-render control
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return state;
}
