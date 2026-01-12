import { useRef, useEffect, useMemo } from 'react';
import { useGridRegistry } from '../context/GridRegistryContext';
import { EventBuilder } from '../types';
import { EventBuilder as EventBuilderClass } from '../utils/EventBuilder';
export function useGridEvents<T = any>(gridId: string): EventBuilder<T> {
    const { subscribeToGridEvent } = useGridRegistry<T>();
    const activeListeners = useRef<Map<any, () => void>>(new Map());
    useEffect(() => {
        return () => {
            activeListeners.current.forEach(unsub => unsub());
            activeListeners.current.clear();
        };
    }, []);
    return useMemo(() => {
        const add = (evt: string, fn: any) => {
            const unsub = subscribeToGridEvent(gridId, evt, fn);
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
