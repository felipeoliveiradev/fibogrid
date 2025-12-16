import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { GridApi } from '../types';

interface GridRegistryContextValue<T = any> {
    registerGrid: (id: string, api: GridApi<T>) => void;
    unregisterGrid: (id: string) => void;
    getGridApi: (id: string) => GridApi<T> | undefined;
    subscribeToGrid: (id: string, callback: (api: GridApi<T>) => void) => () => void;
}

const GridRegistryContext = createContext<GridRegistryContextValue | null>(null);

export function GridRegistryProvider({ children }: { children: ReactNode }) {
    const gridsRef = useRef<Map<string, GridApi<any>>>(new Map());
    const listenersRef = useRef<Map<string, Set<(api: GridApi<any>) => void>>>(new Map());
    const eventListenersRef = useRef<Map<string, Set<() => void>>>(new Map());

    const subscribeToGrid = useCallback((id: string, callback: (api: GridApi<any>) => void) => {
        if (!listenersRef.current.has(id)) {
            listenersRef.current.set(id, new Set());
        }
        listenersRef.current.get(id)?.add(callback);

        // If grid already exists, call immediately
        const existing = gridsRef.current.get(id);
        if (existing) {
            callback(existing);
        }

        return () => {
            listenersRef.current.get(id)?.delete(callback);
        };
    }, []);

    const registerGrid = useCallback((id: string, api: GridApi<any>) => {
        gridsRef.current.set(id, api);

        // Notify listeners waiting for this grid
        listenersRef.current.get(id)?.forEach(cb => cb(api));
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
            subscribeToGrid,
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
            subscribeToGrid: () => () => { },
        } as any;
    }

    return context as GridRegistryContextValue<T> & { subscribeToGrid: (id: string, cb: (api: GridApi<T>) => void) => () => void };
}

export function useGridEvent<T = any>(
    gridId: string,
    eventName: string,
    handler: (event: any) => void
) {
    const { subscribeToGrid } = useGridRegistry();
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    React.useEffect(() => {
        let cleanupFn: (() => void) | undefined;

        const unsubscribeFromGrid = subscribeToGrid(gridId, (api) => {
            // Found the api! Now subscribe to the event
            const eventListener = (e: any) => handlerRef.current(e);

            api.addEventListener(eventName, eventListener);

            // Cleanup just for the event listener on the api
            cleanupFn = () => {
                api.removeEventListener(eventName, eventListener);
            };
        });

        return () => {
            unsubscribeFromGrid();
            if (cleanupFn) cleanupFn();
        };
    }, [gridId, eventName, subscribeToGrid]);
}
