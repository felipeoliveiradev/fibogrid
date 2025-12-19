import { FilterModel, SortModel } from '../../../types';

export interface GridApiUpdateState {
    filterUpdates: ((current: FilterModel[]) => FilterModel[])[];
    pendingQuickFilter: string | null;
    sortUpdates: ((current: SortModel[]) => SortModel[])[];
    pendingPage: number | null;
    pendingPageSize: number | null;
    pendingSelection: { ids: string[]; selected: boolean; mode: 'single' | 'multiple' | 'all' | 'none' } | null;
    pendingReset: boolean;
    pendingResetEdits: boolean;
    pendingResetCells: { rowId: string, field: string }[];
    pendingResetRows: string[];
    pendingUpAdds: any[];
    pendingReplaceAll: any[];
    pendingUpdates: Map<string, any>;
    pendingRemoves: Set<string>;
    pendingAdds: any[];
}

export function createInitialUpdateState(): GridApiUpdateState {
    return {
        filterUpdates: [],
        pendingQuickFilter: null,
        sortUpdates: [],
        pendingPage: null,
        pendingPageSize: null,
        pendingSelection: null,
        pendingReset: false,
        pendingResetEdits: false,
        pendingResetCells: [],
        pendingResetRows: [],
        pendingUpAdds: [],
        pendingReplaceAll: [],
        pendingUpdates: new Map<string, any>(),
        pendingRemoves: new Set<string>(),
        pendingAdds: [],
    };
}
