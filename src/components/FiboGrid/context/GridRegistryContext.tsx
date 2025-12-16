import React, { createContext, useContext, useCallback, ReactNode, useRef, useSyncExternalStore } from 'react';
import { GridApi } from '../types';

interface GridRegistryContextValue<T = any> {
    registerGrid: (id: string, api: GridApi<T>) => void;
    unregisterGrid: (id: string) => void;
    getGridApi: (id: string) => GridApi<T> | undefined;
    subscribe: (id: string, callback: () => void) => () => void;
    notify: (id: string) => void;
    getSnapshot: (id: string) => T[];
}

const EMPTY_ARRAY: any[] = [];

const GridRegistryContext = createContext<GridRegistryContextValue | null>(null);

export function GridRegistryProvider({ children }: { children: ReactNode }) {
    const gridsRef = useRef<Map<string, GridApi<any>>>(new Map());
    const listenersRef = useRef<Map<string, Set<() => void>>>(new Map());
    const snapshotsRef = useRef<Map<string, any[]>>(new Map());

    const registerGrid = useCallback((id: string, api: GridApi<any>) => {
        gridsRef.current.set(id, api);
    }, []);

    const unregisterGrid = useCallback((id: string) => {
        gridsRef.current.delete(id);
        snapshotsRef.current.delete(id);
        listenersRef.current.delete(id);
    }, []);

    const getGridApi = useCallback((id: string) => {
        return gridsRef.current.get(id);
    }, []);

    const subscribe = useCallback((id: string, callback: () => void) => {
        if (!listenersRef.current.has(id)) {
            listenersRef.current.set(id, new Set());
        }
        const listeners = listenersRef.current.get(id)!;
        listeners.add(callback);
        return () => {
            listeners.delete(callback);
            if (listeners.size === 0) {
                listenersRef.current.delete(id);
            }
        };
    }, []);

    const notify = useCallback((id: string) => {
        const api = gridsRef.current.get(id);
        if (api) {
            // Update snapshot before notifying
            const selected = api.getSelectedRows().map(r => r.data);
            snapshotsRef.current.set(id, selected);
        }

        const listeners = listenersRef.current.get(id);
        if (listeners) {
            listeners.forEach(callback => callback());
        }
    }, []);

    const getSnapshot = useCallback((id: string) => {
        return snapshotsRef.current.get(id) || EMPTY_ARRAY;
    }, []);

    return (
        <GridRegistryContext.Provider value={{
            registerGrid,
            unregisterGrid,
            getGridApi,
            subscribe,
            notify,
            getSnapshot
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
            subscribe: () => () => { },
            notify: () => { },
            getSnapshot: () => EMPTY_ARRAY,
        } as GridRegistryContextValue<T>;
    }

    return context as GridRegistryContextValue<T>;
}

export function useGridSelection<T = any>(gridId: string): T[] {
    const { subscribe, getSnapshot } = useGridRegistry<T>();

    // Modern optimization: useSyncExternalStore avoids useEffect and handles subscription/tearing
    return useSyncExternalStore(
        (cb) => subscribe(gridId, cb),
        () => getSnapshot(gridId),
        () => EMPTY_ARRAY // Server snapshot
    );
}
