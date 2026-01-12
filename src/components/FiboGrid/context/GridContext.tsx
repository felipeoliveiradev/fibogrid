import React, { createContext, useContext, useState, useCallback, useRef, useMemo, ReactNode } from 'react';
import { RowNode, GridApi } from '../types';
import { FiboGridLocale } from '../locales/types';
import { enUS } from '../locales/enUS';
interface GridContextValue<T = any> {
  selectedRow: RowNode<T> | null;
  setSelectedRow: (row: RowNode<T> | null) => void;
  registerGrid: (id: string, api: GridApi<T>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<T> | undefined;
  onRowSelect: (gridId: string, row: RowNode<T>) => void;
  subscribeToRowSelect: (callback: (gridId: string, row: RowNode<T>) => void) => () => void;
  locale: FiboGridLocale;
}
const GridContext = createContext<GridContextValue | null>(null);
interface GridProviderProps {
  children: ReactNode;
  onRowSelectChange?: (gridId: string, row: RowNode<any>) => void;
  locale?: FiboGridLocale;
}
export function GridProvider<T = any>({ children, onRowSelectChange, locale = enUS }: GridProviderProps) {
  const [selectedRow, setSelectedRow] = useState<RowNode<T> | null>(null);
  const gridsRef = useRef<Map<string, GridApi<T>>>(new Map());
  const subscribersRef = useRef<Set<(gridId: string, row: RowNode<T>) => void>>(new Set());
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
    setSelectedRow(row);
    onRowSelectChange?.(gridId, row);
    subscribersRef.current.forEach(sub => sub(gridId, row));
  }, [onRowSelectChange]);
  const subscribeToRowSelect = useCallback((callback: (gridId: string, row: RowNode<T>) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);
  const contextValue = useMemo<GridContextValue<T>>(() => ({
    selectedRow,
    setSelectedRow,
    registerGrid,
    unregisterGrid,
    getGridApi,
    onRowSelect,
    subscribeToRowSelect,
    locale,
  }), [
    selectedRow,
    registerGrid,
    unregisterGrid,
    getGridApi,
    onRowSelect,
    subscribeToRowSelect,
    locale,
  ]);
  return (
    <GridContext.Provider value={contextValue}>
      {children}
    </GridContext.Provider>
  );
}
export function useGridContext<T = any>() {
  return useContext(GridContext) as GridContextValue<T> | null;
}
