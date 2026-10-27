import { useCallback, useEffect, useMemo, useRef } from 'react';

type GridEventListener = (event: any) => void;

const globalEventListeners = new Map<string, Map<string, Set<GridEventListener>>>();
let anonymousGridIdCounter = 0;

function eventMapFor(gridId: string): Map<string, Set<GridEventListener>> {
    let eventMap = globalEventListeners.get(gridId);
    if (!eventMap) {
        eventMap = new Map();
        globalEventListeners.set(gridId, eventMap);
    }
    return eventMap;
}

function dropEventKeyIfEmpty(gridId: string, eventType: string): void {
    const eventMap = globalEventListeners.get(gridId);
    if (!eventMap) {
        return;
    }
    const listeners = eventMap.get(eventType);
    if (listeners && listeners.size === 0) {
        eventMap.delete(eventType);
    }
    if (eventMap.size === 0 && globalEventListeners.get(gridId) === eventMap) {
        globalEventListeners.delete(gridId);
    }
}

export function useGridEventSystem(gridId?: string) {
    const anonymousIdRef = useRef<string | undefined>(undefined);
    let gridIdForEvents: string;
    if (gridId) {
        gridIdForEvents = gridId;
    } else if (anonymousIdRef.current !== undefined) {
        gridIdForEvents = anonymousIdRef.current;
    } else {
        anonymousGridIdCounter += 1;
        anonymousIdRef.current = `__fibogrid_events_${anonymousGridIdCounter}`;
        gridIdForEvents = anonymousIdRef.current;
    }
    const ownedListenersRef = useRef<Map<string, Map<string, Set<GridEventListener>>>>(new Map());
    const addEventListener = useCallback((eventType: string, listener: GridEventListener) => {
        const eventMap = eventMapFor(gridIdForEvents);
        let listeners = eventMap.get(eventType);
        if (!listeners) {
            listeners = new Set();
            eventMap.set(eventType, listeners);
        }
        listeners.add(listener);
        let ownedByEvent = ownedListenersRef.current.get(gridIdForEvents);
        if (!ownedByEvent) {
            ownedByEvent = new Map();
            ownedListenersRef.current.set(gridIdForEvents, ownedByEvent);
        }
        let owned = ownedByEvent.get(eventType);
        if (!owned) {
            owned = new Set();
            ownedByEvent.set(eventType, owned);
        }
        owned.add(listener);
    }, [gridIdForEvents]);
    const removeEventListener = useCallback((eventType: string, listener: GridEventListener) => {
        globalEventListeners.get(gridIdForEvents)?.get(eventType)?.delete(listener);
        dropEventKeyIfEmpty(gridIdForEvents, eventType);
        const ownedByEvent = ownedListenersRef.current.get(gridIdForEvents);
        const owned = ownedByEvent?.get(eventType);
        if (!owned) {
            return;
        }
        owned.delete(listener);
        if (owned.size === 0) {
            ownedByEvent.delete(eventType);
        }
        if (ownedByEvent.size === 0) {
            ownedListenersRef.current.delete(gridIdForEvents);
        }
    }, [gridIdForEvents]);
    const fireEvent = useCallback((eventType: string, eventData: any) => {
        const listeners = globalEventListeners.get(gridIdForEvents)?.get(eventType);
        if (listeners && listeners.size > 0) {
            listeners.forEach(listener => listener(eventData));
        }
    }, [gridIdForEvents]);
    const hasListeners = useCallback((eventType: string) => {
        const listeners = globalEventListeners.get(gridIdForEvents)?.get(eventType);
        return listeners !== undefined && listeners.size > 0;
    }, [gridIdForEvents]);
    useEffect(() => {
        const id = gridIdForEvents;
        return () => {
            const ownedByEvent = ownedListenersRef.current.get(id);
            const eventMap = globalEventListeners.get(id);
            if (ownedByEvent && eventMap) {
                ownedByEvent.forEach((owned, eventType) => {
                    const listeners = eventMap.get(eventType);
                    if (!listeners) {
                        return;
                    }
                    owned.forEach(listener => listeners.delete(listener));
                    if (listeners.size === 0) {
                        eventMap.delete(eventType);
                    }
                });
            }
            ownedListenersRef.current.delete(id);
            if (eventMap && eventMap.size === 0 && globalEventListeners.get(id) === eventMap) {
                globalEventListeners.delete(id);
            }
        };
    }, [gridIdForEvents]);
    return useMemo(
        () => ({
            addEventListener,
            removeEventListener,
            fireEvent,
            hasListeners,
        }),
        [addEventListener, removeEventListener, fireEvent, hasListeners]
    );
}
