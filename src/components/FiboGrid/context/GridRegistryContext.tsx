import React, { createContext, useContext, useCallback, ReactNode, useRef, useLayoutEffect } from 'react';
import { GridApi } from '../types';

export interface GridRegistryContextValue<T = any> {
    registerGrid: (id: string, api: GridApi<T>) => void;
    unregisterGrid: (id: string) => void;
    getGridApi: (id: string) => GridApi<T> | undefined;
    subscribeToGridEvent: (gridId: string, eventName: string, callback: (event: any) => void) => () => void;
}

const GridRegistryContext = createContext<GridRegistryContextValue<any> | null>(null);

export function GridRegistryProvider({ children }: { children: ReactNode }) {
    const gridsRef = useRef<Map<string, GridApi<any>>>(new Map());
    const eventSubscriptionsRef = useRef<Map<string, Map<string, Set<(event: any) => void>>>>(new Map());

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

        const api = gridsRef.current.get(gridId);
        if (api && callbacks.size === 1) {
            const listener = (e: any) => {
                const currentCallbacks = eventSubscriptionsRef.current.get(gridId)?.get(eventName);
                currentCallbacks?.forEach(cb => cb(e));
            };
            api.addEventListener(eventName, listener);
            gridEvents.set(`__listener__${eventName}`, listener as any);
        }

        return () => {
            callbacks.delete(callback);

            if (callbacks.size === 0) {
                const api = gridsRef.current.get(gridId);
                const listener = gridEvents.get(`__listener__${eventName}`) as any;
                if (api && listener) {
                    api.removeEventListener(eventName, listener);
                    gridEvents.delete(`__listener__${eventName}`);
                }
                gridEvents.delete(eventName);
            }
        };
    }, []);

    const registerGrid = useCallback((id: string, api: GridApi<any>) => {
        gridsRef.current.set(id, api);

        const gridEvents = eventSubscriptionsRef.current.get(id);
        if (gridEvents) {
            gridEvents.forEach((callbacks, eventName) => {
                if (eventName.startsWith('__listener__')) return;

                const listener = (e: any) => {
                    callbacks.forEach(cb => cb(e));
                };
                api.addEventListener(eventName, listener);
                gridEvents.set(`__listener__${eventName}`, listener as any);
            });
        }
    }, []);

    const unregisterGrid = useCallback((id: string) => {
        const api = gridsRef.current.get(id);
        const gridEvents = eventSubscriptionsRef.current.get(id);

        if (api && gridEvents) {
            gridEvents.forEach((value, key) => {
                if (key.startsWith('__listener__')) {
                    const eventName = key.replace('__listener__', '');
                    try {
                        api.removeEventListener(eventName, value as any);
                    } catch (e) {
                    }
                    gridEvents.delete(key);
                }
            });
        }

        gridsRef.current.delete(id);
    }, []);

    const getGridApi = useCallback((id: string) => {
        return gridsRef.current.get(id);
    }, []);

    const contextValue = React.useMemo(() => ({
        registerGrid,
        unregisterGrid,
        getGridApi,
        subscribeToGridEvent,
    }), [registerGrid, unregisterGrid, getGridApi, subscribeToGridEvent]);

    return (
        <GridRegistryContext.Provider value={contextValue}>
            {children}
        </GridRegistryContext.Provider>
    );
}

export function useGridRegistry<T = any>(): GridRegistryContextValue<T> {
    const context = useContext(GridRegistryContext);

    if (!context) {
        return {
            registerGrid: () => { },
            unregisterGrid: () => { },
            getGridApi: () => undefined,
            subscribeToGridEvent: () => () => { },
        } as GridRegistryContextValue<T>;
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
