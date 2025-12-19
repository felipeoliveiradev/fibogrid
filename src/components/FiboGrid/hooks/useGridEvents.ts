import { useRef, useEffect, useMemo } from 'react';
import { useGridRegistry } from '../context/GridRegistryContext';
import { EventBuilder } from '../types';
import { EventBuilder as EventBuilderClass } from '../utils/EventBuilder';

export function useGridEvents<T = any>(gridId: string): EventBuilder<T> {
    const { subscribeToGridEvent } = useGridRegistry<T>();

    // We need to keep track of unsub functions for each listener
    // Key: listener function, Value: unsubscription function
    const activeListeners = useRef<Map<any, () => void>>(new Map());

    // Cleanup all listeners on unmount
    useEffect(() => {
        return () => {
            activeListeners.current.forEach(unsub => unsub());
            activeListeners.current.clear();
        };
    }, []);

    return useMemo(() => {
        const add = (evt: string, fn: any) => {
            // If already subscribed, don't duplicate (or maybe we should allow? EventBuilder handles Sets usually)
            // EventBuilder manages its own Set of listeners, so we will receive unique calls for each handler.
            // But if the same handler is added twice to the DOM (mock), it's usually once?
            // EventBuilder logic: `self.listeners.get(eventName)!.add(wrappedHandler);`
            // It calls `addEventListener` every time `listen` is called?
            // Yes: `self.addEventListener(eventName, wrappedHandler);` in EventBuilder.ts line 45.

            const unsub = subscribeToGridEvent(gridId, evt, fn);

            // If we have existing unsub for this exact function/evt combo, we might override it, 
            // but usually fn is a new closure from EventBuilder each time.
            activeListeners.current.set(fn, unsub);
        };

        const rm = (evt: string, fn: any) => {
            const unsub = activeListeners.current.get(fn);
            if (unsub) {
                unsub();
                activeListeners.current.delete(fn);
            }
        };

        const fire = (evt: string, data: any) => {
            console.warn(`[useGridEvents] Triggering events (${evt}) is not supported via this hook. Use gridApi.events().calls() instead.`);
        };

        return new EventBuilderClass<T>(add, rm, fire);
    }, [gridId, subscribeToGridEvent]);
}
