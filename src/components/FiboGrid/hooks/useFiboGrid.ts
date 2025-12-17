import { useGridRegistry } from '../context/GridRegistryContext';
import { UseFiboGridReturn } from '../types';
import { useGridEvents } from './useGridEvents';

export function useFiboGrid<T = any>(gridId: string): UseFiboGridReturn<T> {
    const registry = useGridRegistry<T>();
    const grid = registry.getGridApi(gridId);
    const events = useGridEvents<T>(gridId);

    return {
        registry,
        events,
        grid
    };
}
