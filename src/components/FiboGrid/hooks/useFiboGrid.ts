import { useSyncExternalStore } from 'react';
import { useGridRegistry } from '../context/GridRegistryContext';
import { UseFiboGridReturn } from '../types';
import { useGridEvents } from './useGridEvents';

/**
 * Reactive access to a registered grid by id.
 * `grid` is undefined until registerGrid runs (and again after unregister).
 * Re-renders when the registry version changes via useSyncExternalStore.
 */
export function useFiboGrid<T = any>(gridId: string): UseFiboGridReturn<T> {
    const registry = useGridRegistry<T>();
    useSyncExternalStore(registry.subscribe, registry.getVersion, () => 0);
    const grid = registry.getGridApi(gridId);
    const events = useGridEvents<T>(gridId);
    return {
        registry,
        events,
        grid,
    };
}
