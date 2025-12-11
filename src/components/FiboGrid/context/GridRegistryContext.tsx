import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { GridApi } from '../types';

interface GridRegistryContextValue<T = any> {
    registerGrid: (id: string, api: GridApi<T>) => void;
    unregisterGrid: (id: string) => void;
    getGridApi: (id: string) => GridApi<T> | undefined;
}

const GridRegistryContext = createContext<GridRegistryContextValue | null>(null);

export function GridRegistryProvider({ children }: { children: ReactNode }) {
    const gridsRef = useRef<Map<string, GridApi<any>>>(new Map());

    const registerGrid = useCallback((id: string, api: GridApi<any>) => {
        gridsRef.current.set(id, api);
    }, []);

    const unregisterGrid = useCallback((id: string) => {
        gridsRef.current.delete(id);
    }, []);

    const getGridApi = useCallback((id: string) => {
        return gridsRef.current.get(id);
    }, []);

    return (
        <GridRegistryContext.Provider value={{
            registerGrid,
            unregisterGrid,
            getGridApi,
        }}>
            {children}
        </GridRegistryContext.Provider>
    );
}

export function useGridRegistry<T = any>() {
    const context = useContext(GridRegistryContext);

    if (!context) {
        return {
            registerGrid: () => { },
            unregisterGrid: () => { },
            getGridApi: () => undefined,
        } as GridRegistryContextValue<T>;
    }

    return context as GridRegistryContextValue<T>;
}
