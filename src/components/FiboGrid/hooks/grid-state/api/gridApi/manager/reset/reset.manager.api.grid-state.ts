import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function resetManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>
): GridManagerBuilder<T> {
    state.pendingReset = true;
    state.pendingAdds = [];
    state.pendingUpdates.clear();
    state.pendingRemoves.clear();
    state.pendingUpAdds = [];
    state.pendingReplaceAll = [];
    return managerBuilder;
}
