import React, { createContext, useContext, useCallback, ReactNode, useRef, useLayoutEffect } from 'react';
import { GridApi, DispatchAction } from '../types';

interface DependencyConfig {
    childId: string;
    parentId: string;
    receiveActions: string[];
    receiveHandlers: Record<string, (parentApi: GridApi, action: DispatchAction) => void>;
    autoRefresh: boolean | string[];
}

export interface GridRegistryContextValue<T = any> {
    registerGrid: (id: string, api: GridApi<T>) => void;
    unregisterGrid: (id: string) => void;
    getGridApi: (id: string) => GridApi<T> | undefined;
    subscribeToGridEvent: (gridId: string, eventName: string, callback: (event: any) => void) => () => void;

    registerDependency: (config: DependencyConfig) => () => void;
    dispatchAction: (sourceId: string, action: DispatchAction) => void;
    getDependents: (gridId: string) => string[];
    getParents: (gridId: string) => string[];
}

const GridRegistryContext = createContext<GridRegistryContextValue<any> | null>(null);

export function GridRegistryProvider({ children }: { children: ReactNode }) {
    const gridsRef = useRef<Map<string, GridApi<any>>>(new Map());
    const eventSubscriptionsRef = useRef<Map<string, Map<string, Set<(event: any) => void>>>>(new Map());
    const dependenciesRef = useRef<Map<string, Set<DependencyConfig>>>(new Map());
    const parentToChildrenRef = useRef<Map<string, Set<string>>>(new Map());

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

    const registerDependency = useCallback((config: DependencyConfig) => {
        if (!dependenciesRef.current.has(config.childId)) {
            dependenciesRef.current.set(config.childId, new Set());
        }
        dependenciesRef.current.get(config.childId)!.add(config);

        if (!parentToChildrenRef.current.has(config.parentId)) {
            parentToChildrenRef.current.set(config.parentId, new Set());
        }
        parentToChildrenRef.current.get(config.parentId)!.add(config.childId);

        return () => {
            dependenciesRef.current.get(config.childId)?.delete(config);
            if (dependenciesRef.current.get(config.childId)?.size === 0) {
                dependenciesRef.current.delete(config.childId);
            }

            parentToChildrenRef.current.get(config.parentId)?.delete(config.childId);
            if (parentToChildrenRef.current.get(config.parentId)?.size === 0) {
                parentToChildrenRef.current.delete(config.parentId);
            }
        };
    }, []);

    const dispatchAction = useCallback((sourceId: string, action: DispatchAction) => {
        const children = parentToChildrenRef.current.get(sourceId);
        if (!children) return;

        children.forEach(childId => {
            const dependencies = dependenciesRef.current.get(childId);
            if (!dependencies) return;

            dependencies.forEach(dep => {
                if (dep.parentId !== sourceId) return;

                const shouldHandle = dep.receiveActions.includes(action.type);
                const shouldAutoRefresh =
                    dep.autoRefresh === true ||
                    (Array.isArray(dep.autoRefresh) && dep.autoRefresh.includes(action.type));

                if (shouldHandle && dep.receiveHandlers[action.type]) {
                    const parentApi = gridsRef.current.get(sourceId);
                    if (parentApi) {
                        dep.receiveHandlers[action.type](parentApi, action);
                    }
                }

                if (shouldAutoRefresh) {
                    const childApi = gridsRef.current.get(childId);
                    if (childApi) {
                        childApi.refresh().execute();
                    }
                }
            });
        });
    }, []);

    const getDependents = useCallback((gridId: string) => {
        return Array.from(parentToChildrenRef.current.get(gridId) || []);
    }, []);

    const getParents = useCallback((gridId: string) => {
        const parents = new Set<string>();
        const dependencies = dependenciesRef.current.get(gridId);
        if (dependencies) {
            dependencies.forEach(dep => parents.add(dep.parentId));
        }
        return Array.from(parents);
    }, []);

    const contextValue = React.useMemo(() => ({
        registerGrid,
        unregisterGrid,
        getGridApi,
        subscribeToGridEvent,
        registerDependency,
        dispatchAction,
        getDependents,
        getParents,
    }), [registerGrid, unregisterGrid, getGridApi, subscribeToGridEvent, registerDependency, dispatchAction, getDependents, getParents]);

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
            registerDependency: () => () => { },
            dispatchAction: () => { },
            getDependents: () => [],
            getParents: () => [],
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
