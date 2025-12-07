import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RowNode, GridApi } from '../types';

interface GridContextValue<T = any> {
  // Shared selection state
  selectedRow: RowNode<T> | null;
  setSelectedRow: (row: RowNode<T> | null) => void;
  
  // Grid API registry
  registerGrid: (id: string, api: GridApi<T>) => void;
  unregisterGrid: (id: string) => void;
  getGridApi: (id: string) => GridApi<T> | undefined;
  
  // Event handlers for cross-grid communication
  onRowSelect: (gridId: string, row: RowNode<T>) => void;
  subscribeToRowSelect: (callback: (gridId: string, row: RowNode<T>) => void) => () => void;
}

const GridContext = createContext<GridContextValue | null>(null);

interface GridProviderProps {
  children: ReactNode;
  onRowSelectChange?: (gridId: string, row: RowNode<any>) => void;
}

export function GridProvider<T = any>({ children, onRowSelectChange }: GridProviderProps) {
  const [selectedRow, setSelectedRow] = useState<RowNode<T> | null>(null);
  const [grids, setGrids] = useState<Map<string, GridApi<T>>>(new Map());
  const [subscribers, setSubscribers] = useState<Array<(gridId: string, row: RowNode<T>) => void>>([]);

  const registerGrid = useCallback((id: string, api: GridApi<T>) => {
    setGrids(prev => {
      const next = new Map(prev);
      next.set(id, api);
      return next;
    });
  }, []);

  const unregisterGrid = useCallback((id: string) => {
    setGrids(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getGridApi = useCallback((id: string) => {
    return grids.get(id);
  }, [grids]);

  const onRowSelect = useCallback((gridId: string, row: RowNode<T>) => {
    setSelectedRow(row);
    onRowSelectChange?.(gridId, row);
    subscribers.forEach(sub => sub(gridId, row));
  }, [onRowSelectChange, subscribers]);

  const subscribeToRowSelect = useCallback((callback: (gridId: string, row: RowNode<T>) => void) => {
    setSubscribers(prev => [...prev, callback]);
    return () => {
      setSubscribers(prev => prev.filter(s => s !== callback));
    };
  }, []);

  return (
    <GridContext.Provider value={{
      selectedRow,
      setSelectedRow,
      registerGrid,
      unregisterGrid,
      getGridApi,
      onRowSelect,
      subscribeToRowSelect,
    }}>
      {children}
    </GridContext.Provider>
  );
}

export function useGridContext<T = any>() {
  return useContext(GridContext) as GridContextValue<T> | null;
}