import { GridApi, GridApiBuilder, GridManagerBuilder, GridRefreshBuilder, DispatchAction } from '../types';

export class GridRefreshBuilderImpl<T = any> implements GridRefreshBuilder<T> {
    private shouldDispatch: boolean = false;
    private dispatchAction?: string;

    constructor(
        private gridId: string,
        private api: GridApi<T>,
        private dispatchFn: (action: string | DispatchAction, data?: any) => void,
        private refreshFn: () => void,
        private getManagerBuilder: () => GridManagerBuilder<T>,
        private getParamsBuilder: () => GridApiBuilder<T>
    ) { }

    withDispatch(action?: string): GridRefreshBuilder<T> {
        this.shouldDispatch = true;
        this.dispatchAction = action || 'refresh';
        return this;
    }

    manager(): GridManagerBuilder<T> {
        return this.getManagerBuilder();
    }

    params(): GridApiBuilder<T> {
        return this.getParamsBuilder();
    }

    execute(): void {
        this.refreshFn();

        if (this.shouldDispatch) {
            this.dispatchFn(this.dispatchAction || 'refresh', {
                timestamp: Date.now()
            });
        }
    }
}
