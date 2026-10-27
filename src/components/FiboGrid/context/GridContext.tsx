import React, { createContext, useContext, useCallback, useRef, useMemo, ReactNode } from 'react';
import { RowNode, GridApi } from '../types';
import { FiboGridLocale } from '../locales/types';
import { enUS } from '../locales/enUS';

interface GridContextApi<T = any> {
  /** Snapshot from provider ref — reading it does not subscribe to selection changes. */
  readonly selectedRow: RowNode<T> | null;
  setSelectedRow: (row: RowNode<T> | null) => void;
  registerGrid: (id: string, api: GridApi<T>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<T> | undefined;
  onRowSelect: (gridId: string, row: RowNode<T>) => void;
  subscribeToRowSelect: (callback: (gridId: string, row: RowNode<T>) => void) => () => void;
}

export interface GridContextValue<T = any> extends GridContextApi<T> {
  locale: FiboGridLocale;
}

const GridContext = createContext<GridContextApi | null>(null);
const GridLocaleContext = createContext<FiboGridLocale>(enUS);

interface GridProviderProps {
  children: ReactNode;
  onRowSelectChange?: (gridId: string, row: RowNode<any>) => void;
  locale?: FiboGridLocale;
}

export function GridProvider<T = any>({ children, onRowSelectChange, locale = enUS }: GridProviderProps) {
  // Selection in a ref keeps GridContext identity stable across row select so
  // React.memo on GridRow is not defeated by useContext. Locale is a separate
  // stable context for row/cell label consumers.
  const selectedRowRef = useRef<RowNode<T> | null>(null);
  const gridsRef = useRef<Map<string, GridApi<T>>>(new Map());
  const subscribersRef = useRef<Set<(gridId: string, row: RowNode<T>) => void>>(new Set());

  const setSelectedRow = useCallback((row: RowNode<T> | null) => {
    selectedRowRef.current = row;
  }, []);

  const registerGrid = useCallback((id: string, api: GridApi<T>) => {
    gridsRef.current.set(id, api);
  }, []);

  const unregisterGrid = useCallback((id: string) => {
    gridsRef.current.delete(id);
  }, []);

  const getGridApi = useCallback((id: string) => {
    return gridsRef.current.get(id);
  }, []);

  const onRowSelect = useCallback((gridId: string, row: RowNode<T>) => {
    selectedRowRef.current = row;
    onRowSelectChange?.(gridId, row);
    subscribersRef.current.forEach(sub => sub(gridId, row));
  }, [onRowSelectChange]);

  const subscribeToRowSelect = useCallback((callback: (gridId: string, row: RowNode<T>) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const contextValue = useMemo<GridContextApi<T>>(() => ({
    get selectedRow() {
      return selectedRowRef.current;
    },
    setSelectedRow,
    registerGrid,
    unregisterGrid,
    getGridApi,
    onRowSelect,
    subscribeToRowSelect,
  }), [
    setSelectedRow,
    registerGrid,
    unregisterGrid,
    getGridApi,
    onRowSelect,
    subscribeToRowSelect,
  ]);

  return (
    <GridLocaleContext.Provider value={locale}>
      <GridContext.Provider value={contextValue}>
        {children}
      </GridContext.Provider>
    </GridLocaleContext.Provider>
  );
}

/** Locale-only subscription — safe for memoized rows/cells. */
export function useGridLocale(): FiboGridLocale {
  return useContext(GridLocaleContext);
}

export function useGridContext<T = any>(): GridContextValue<T> | null {
  const ctx = useContext(GridContext) as GridContextApi<T> | null;
  const locale = useContext(GridLocaleContext);
  return useMemo(() => {
    if (!ctx) return null;
    return {
      setSelectedRow: ctx.setSelectedRow,
      registerGrid: ctx.registerGrid,
      unregisterGrid: ctx.unregisterGrid,
      getGridApi: ctx.getGridApi,
      onRowSelect: ctx.onRowSelect,
      subscribeToRowSelect: ctx.subscribeToRowSelect,
      get selectedRow() {
        return ctx.selectedRow;
      },
      locale,
    };
  }, [ctx, locale]);
}
