import { UseGridApiContext } from '../../../apiTypes';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
import { executeGridUpdates } from '../../../gridApiExecutor';

export function executeBase<T>(
    context: UseGridApiContext<T>,
    state: GridApiUpdateState
): void {
    executeGridUpdates(context, state);
}
