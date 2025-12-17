import { useRef, useEffect, useMemo } from 'react';
import { useGridRegistry } from '../context/GridRegistryContext';
import { EventBuilder } from '../types';
import { EventBuilder as EventBuilderClass } from '../utils/EventBuilder';

export function useGridEvents<T = any>(gridId: string): EventBuilder<T> {
    const { subscribeToGridEvent } = useGridRegistry<T>();

    const pendingSubscriptionsRef = useRef<Array<{ event: string, listener: any }>>([]);

    const activeUnsubscribersRef = useRef<Array<() => void>>([]);

    pendingSubscriptionsRef.current = [];

    useEffect(() => {
        const currentPending = pendingSubscriptionsRef.current;

        activeUnsubscribersRef.current.forEach(unsub => unsub());
        activeUnsubscribersRef.current = [];

        currentPending.forEach(({ event, listener }) => {
            const unsub = subscribeToGridEvent(gridId, event, listener);
            activeUnsubscribersRef.current.push(unsub);
        });

        return () => {
            activeUnsubscribersRef.current.forEach(unsub => unsub());
            activeUnsubscribersRef.current = [];
        };
    });

    return useMemo(() => {
        const add = (evt: string, fn: any) => {
            pendingSubscriptionsRef.current.push({ event: evt, listener: fn });
            return () => { };
        };

        const rm = (evt: string, fn: any) => {
        };

        return new EventBuilderClass<T>(add, rm);
    }, [gridId, subscribeToGridEvent]);
}
