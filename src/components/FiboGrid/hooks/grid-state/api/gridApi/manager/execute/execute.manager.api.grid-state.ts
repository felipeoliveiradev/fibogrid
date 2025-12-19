import { GridApiBuilder } from '../../../../../../types';

export function executeManager<T>(
    builder: GridApiBuilder<T>
): void {
    builder.execute();
}
