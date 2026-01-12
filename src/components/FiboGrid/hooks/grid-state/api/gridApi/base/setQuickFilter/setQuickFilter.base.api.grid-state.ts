import { GridApiBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';
export function setQuickFilterBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    text: string
): GridApiBuilder<T> {
    state.pendingQuickFilter = text;
    return builder;
}
