import React, { createContext, useContext, useCallback, ReactNode, useRef, useLayoutEffect } from 'react';
import { GridApi, GridEgress, GridIngress } from '../types';
export interface GridRegistrationMeta<T = any> {
    internalApi?: GridApi<T>;
    egress?: GridEgress[];
    ingress?: GridIngress[];
}
export interface GridRegistryContextValue<T = any> {
    registerGrid: (id: string, api: GridApi<T>, meta?: GridRegistrationMeta<T>) => void;
    unregisterGrid: (id: string) => void;
    getGridApi: (id: string) => GridApi<T> | undefined;
    getGridMeta?: (id: string) => GridRegistrationMeta<T> | undefined;
    subscribeToGridEvent: (gridId: string, eventName: string, callback: (event: any) => void) => () => void;
    /** Subscribe to register/unregister changes (for useSyncExternalStore). */
    subscribe: (onStoreChange: () => void) => () => void;
    /** Monotonic version bumped on register/unregister. */
    getVersion: () => number;
}
const GridRegistryContext = createContext<GridRegistryContextValue<any> | null>(null);
export function GridRegistryProvider({ children }: { children: ReactNode }) {
    const gridsRef = useRef<Map<string, GridApi<any>>>(new Map());
    const gridMetaRef = useRef<Map<string, GridRegistrationMeta<any>>>(new Map());
    const eventSubscriptionsRef = useRef<Map<string, Map<string, Set<(event: any) => void>>>>(new Map());
    const versionRef = useRef(0);
    const registryListenersRef = useRef(new Set<() => void>());
    const bumpVersion = useCallback(() => {
        versionRef.current += 1;
        registryListenersRef.current.forEach(listener => listener());
    }, []);
    const subscribe = useCallback((onStoreChange: () => void) => {
        registryListenersRef.current.add(onStoreChange);
        return () => {
            registryListenersRef.current.delete(onStoreChange);
        };
    }, []);
    const getVersion = useCallback(() => versionRef.current, []);
    const subscribeToGridEvent = useCallback((gridId: string, eventName: string, callback: (event: any) => void) => {
        if (!eventSubscriptionsRef.current.has(gridId)) {
            eventSubscriptionsRef.current.set(gridId, new Map());
        }
        const gridEvents = eventSubscriptionsRef.current.get(gridId)!;
        if (!gridEvents.has(eventName)) {
            gridEvents.set(eventName, new Set());
        }
        const callbacks = gridEvents.get(eventName)!;
        callbacks.add(callback);
        const eventHostApi = gridMetaRef.current.get(gridId)?.internalApi ?? gridsRef.current.get(gridId);
        if (eventHostApi && callbacks.size === 1) {
            const listener = (e: any) => {
                const currentCallbacks = eventSubscriptionsRef.current.get(gridId)?.get(eventName);
                currentCallbacks?.forEach(cb => cb(e));
            };
            eventHostApi.addEventListener(eventName, listener);
            gridEvents.set(`__listener__${eventName}`, listener as any);
        }
        return () => {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                const hostApi = gridMetaRef.current.get(gridId)?.internalApi ?? gridsRef.current.get(gridId);
                const listener = gridEvents.get(`__listener__${eventName}`) as any;
                if (hostApi && listener) {
                    hostApi.removeEventListener(eventName, listener);
                    gridEvents.delete(`__listener__${eventName}`);
                }
                gridEvents.delete(eventName);
            }
        };
    }, []);
    const registerGrid = useCallback((id: string, api: GridApi<any>, meta?: GridRegistrationMeta<any>) => {
        gridsRef.current.set(id, api);
        if (meta) {
            gridMetaRef.current.set(id, meta);
        }
        const eventHostApi = meta?.internalApi ?? api;
        const gridEvents = eventSubscriptionsRef.current.get(id);
        if (gridEvents) {
            gridEvents.forEach((callbacks, eventName) => {
                if (eventName.startsWith('__listener__')) return;
                const listenerKey = `__listener__${eventName}`;
                const previousListener = gridEvents.get(listenerKey) as any;
                if (previousListener) {
                    try {
                        eventHostApi.removeEventListener(eventName, previousListener);
                    } catch {
                        // Host may already have dropped the listener on remount.
                    }
                    gridEvents.delete(listenerKey);
                }
                const listener = (e: any) => {
                    callbacks.forEach(cb => cb(e));
                };
                eventHostApi.addEventListener(eventName, listener);
                gridEvents.set(listenerKey, listener as any);
            });
        }
        bumpVersion();
    }, [bumpVersion]);
    const unregisterGrid = useCallback((id: string) => {
        const hostApi = gridMetaRef.current.get(id)?.internalApi ?? gridsRef.current.get(id);
        const gridEvents = eventSubscriptionsRef.current.get(id);
        if (hostApi && gridEvents) {
            gridEvents.forEach((value, key) => {
                if (key.startsWith('__listener__')) {
                    const eventName = key.replace('__listener__', '');
                    try {
                        hostApi.removeEventListener(eventName, value as any);
                    } catch (e) {
                        const message = e instanceof Error ? e.message : String(e);
                        const listenerAlreadyGone = /listener/i.test(message)
                            && /(não existe|nao existe|does not exist|not found|already removed|ausente)/i.test(message);
                        if (!listenerAlreadyGone) {
                            throw e;
                        }
                    }
                    gridEvents.delete(key);
                }
            });
        }
        // Drop callback sets so a remount starts with a clean subscription table
        // (external hooks must re-subscribe after remount).
        eventSubscriptionsRef.current.delete(id);
        gridsRef.current.delete(id);
        gridMetaRef.current.delete(id);
        bumpVersion();
    }, [bumpVersion]);
    const getGridApi = useCallback((id: string) => {
        return gridsRef.current.get(id);
    }, []);
    const getGridMeta = useCallback((id: string) => {
        return gridMetaRef.current.get(id);
    }, []);
    const contextValue = React.useMemo(() => ({
        registerGrid,
        unregisterGrid,
        getGridApi,
        getGridMeta,
        subscribeToGridEvent,
        subscribe,
        getVersion,
    }), [registerGrid, unregisterGrid, getGridApi, getGridMeta, subscribeToGridEvent, subscribe, getVersion]);
    return (
        <GridRegistryContext.Provider value={contextValue}>
            {children}
        </GridRegistryContext.Provider>
    );
}
const EMPTY_REGISTRY: GridRegistryContextValue<any> = {
    registerGrid: () => { },
    unregisterGrid: () => { },
    getGridApi: () => undefined,
    getGridMeta: () => undefined,
    subscribeToGridEvent: () => () => { },
    subscribe: () => () => { },
    getVersion: () => 0,
};

export function useGridRegistry<T = any>(): GridRegistryContextValue<T> {
    const context = useContext(GridRegistryContext);
    if (!context) {
        return EMPTY_REGISTRY as GridRegistryContextValue<T>;
    }
    return context as GridRegistryContextValue<T>;
}
export function useGridEvent<T = any>(
    gridId: string,
    eventName: string,
    handler: (event: any) => void
) {
    const { subscribeToGridEvent } = useGridRegistry();
    const handlerRef = useRef(handler);
    handlerRef.current = handler;
    const stableCallback = useCallback((event: any) => {
        handlerRef.current(event);
    }, []);
    useLayoutEffect(() => {
        const unsubscribe = subscribeToGridEvent(gridId, eventName, stableCallback);
        return unsubscribe;
    }, [gridId, eventName, subscribeToGridEvent, stableCallback]);
}
