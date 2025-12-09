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
  const dataSourceRef = useRef<ServerSideDataSource<T> | undefined>(undefined);


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


      stateRef.current = { ...stateRef.current, loading: true, error: null };
      listenersRef.current.forEach((listener) => listener());

      try {
        const response = await dataSource.getRows(req);
        

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


  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
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
    
    return stateRef.current;
  }, [request, dataSource, getCacheKey, fetchData]);


  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return state;
}
