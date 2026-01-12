import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function resetEditsManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>
): GridManagerBuilder<T> {
    state.pendingResetEdits = true;
    return managerBuilder;
}
