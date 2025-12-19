import { useCallback } from 'react';

const globalEventListeners = new Map<string, Map<string, Set<(event: any) => void>>>();

export function useGridEventSystem(gridId?: string) {
    const gridIdForEvents = gridId || 'default';

    if (!globalEventListeners.has(gridIdForEvents)) {
        globalEventListeners.set(gridIdForEvents, new Map());
    }
    const eventListenersMap = globalEventListeners.get(gridIdForEvents)!;

    const addEventListener = useCallback((eventType: string, listener: (event: any) => void) => {
        if (!eventListenersMap.has(eventType)) {
            eventListenersMap.set(eventType, new Set());
        }
        eventListenersMap.get(eventType)?.add(listener);
    }, [eventListenersMap]);

    const removeEventListener = useCallback((eventType: string, listener: (event: any) => void) => {
        eventListenersMap.get(eventType)?.delete(listener);
    }, [eventListenersMap]);

    const fireEvent = useCallback((eventType: string, eventData: any) => {
        const listeners = eventListenersMap.get(eventType);
        if (listeners && listeners.size > 0) {
            listeners.forEach(listener => listener(eventData));
        }
    }, [eventListenersMap]);

    const hasListeners = useCallback((eventType: string) => {
        const listeners = eventListenersMap.get(eventType);
        return listeners !== undefined && listeners.size > 0;
    }, [eventListenersMap]);

    return {
        addEventListener,
        removeEventListener,
        fireEvent,
        hasListeners,
    };
}
