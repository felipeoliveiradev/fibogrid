import { GridManagerBuilder } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function updateCellManager<T>(
    state: GridApiUpdateState,
    managerBuilder: GridManagerBuilder<T>,
    rowId: string,
    field: string,
    value: any
): GridManagerBuilder<T> {
    console.warn("updateCell not fully ported in this snippet - see execution function");
    return managerBuilder;
}
