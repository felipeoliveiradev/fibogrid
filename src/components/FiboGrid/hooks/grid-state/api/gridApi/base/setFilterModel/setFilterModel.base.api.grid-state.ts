import { GridApiBuilder, FilterModel, SetFilterOptions } from '../../../../../../types';
import { GridApiUpdateState } from '../../../gridApiUpdateState';

export function setFilterModelBase<T>(
    state: GridApiUpdateState,
    builder: GridApiBuilder<T>,
    model: FilterModel[],
    options?: SetFilterOptions
): GridApiBuilder<T> {
    state.filterUpdates.push((prev) => {
        if (options?.behavior === 'merge') {
            const newModel = [...prev];
            model.forEach(newFilter => {
                const existingIndex = newModel.findIndex(f => f.field === newFilter.field);
                if (existingIndex >= 0) {
                    newModel[existingIndex] = newFilter;
                } else {
                    newModel.push(newFilter);
                }
            });
            return newModel;
        }
        return model;
    });
    return builder;
}
