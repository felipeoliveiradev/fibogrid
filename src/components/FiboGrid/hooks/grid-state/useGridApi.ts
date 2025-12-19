import { validateIngress } from '../../utils/permissionValidator';

import { useMemo, MutableRefObject } from 'react';
import {
    GridApi,
    FiboGridProps,
    GridManagerBuilder
} from '../../types';
import { useGridEventSystem } from './useGridEventSystem';
import { UseGridSortFilterResult } from './useGridSortFilter';
import { UseGridPaginationInfoResult } from './useGridPagination';
import { UseGridColumnsResult } from './useGridColumns';
import { UseGridRowsResult } from './useGridRows';
import { UseGridSelectionResult } from './useGridSelection';
import { UseGridEditingResult } from './useGridEditing';
import { UseGridApiContext } from './api/apiTypes';
import { createGridApiMethods } from './api/gridApiMethods';
import { createGridApiBuilder } from './api/createGridApiBuilder';
import { UseGroupingResult } from '../useGrouping';

interface UseGridApiProps<T> {
    props: FiboGridProps<T>;
    events: ReturnType<typeof useGridEventSystem>;
    sortFilter: UseGridSortFilterResult;
    pagination: UseGridPaginationInfoResult;
    columns: UseGridColumnsResult<T>;
    rows: UseGridRowsResult<T>;
    selection: UseGridSelectionResult;
    editing: UseGridEditingResult;
    apiRef: MutableRefObject<GridApi<T> | undefined>;
    grouping: UseGroupingResult<T>;
}

export function useGridApi<T>(props: UseGridApiProps<T>): { api: GridApi<T>, internalApi: GridApi<T> } {

    // Create a context object to pass around
    const context: UseGridApiContext<T> = props;

    const api = useMemo(() => {
        const methods = createGridApiMethods(context);

        const baseApi = {
            ...methods,
            params: () => createGridApiBuilder(context),
            manager: () => {
                let managerBuilderInstance: GridManagerBuilder<T> | undefined;
                createGridApiBuilder(context).gridManager((mb) => {
                    managerBuilderInstance = mb;
                    return mb;
                });
                return managerBuilderInstance!;
            }
        } as unknown as GridApi<T>;

        const createSecureProxy = (targetApi: GridApi<T>, id: string | undefined): GridApi<T> => {
            return new Proxy(targetApi, {
                get(target, prop, receiver) {
                    // Allow 'connect' to pass through or be intercepted?
                    // connect is defined on baseApi.
                    if (prop === 'connect') {
                        return (newSourceId: string) => createSecureProxy(target, newSourceId);
                    }

                    // Intercept 'events'
                    if (prop === 'events') {
                        return () => {
                            const evtBuilder = target.events();
                            const wrapSubscription = (sub: any, eventName: string) => {
                                return new Proxy(sub, {
                                    get(subTarget, subProp) {
                                        if (subProp === 'listen' || subProp === 'once') {
                                            return (handler: any) => {
                                                // If id is undefined (default API), validateIngress checks for 'undefined' origin rules
                                                // permissionValidator was updated to allow ALL if ingress is undefined.
                                                // If ingress is defined, it validates against id.
                                                if (validateIngress(context.props.ingress, id || 'undefined', eventName)) {
                                                    return subTarget[subProp](handler);
                                                }
                                                return () => { };
                                            }
                                        }
                                        const result = Reflect.get(subTarget, subProp);
                                        if (typeof result === 'function') {
                                            return (...args: any[]) => {
                                                const res = result.apply(subTarget, args);
                                                if (res && res.listen) {
                                                    return wrapSubscription(res, eventName);
                                                }
                                                return res;
                                            }
                                        }
                                        return result;
                                    }
                                });
                            }

                            return new Proxy(evtBuilder, {
                                get(ebTarget, ebProp) {
                                    const val = Reflect.get(ebTarget, ebProp);
                                    if (typeof val === 'function' && String(ebProp).startsWith('on')) {
                                        return (...args: any[]) => {
                                            const sub = val.apply(ebTarget, args);
                                            return wrapSubscription(sub, String(ebProp));
                                        };
                                    }
                                    return val;
                                }
                            });
                        }
                    }

                    // Intercept 'manager'
                    if (prop === 'manager') {
                        return () => {
                            const mgrBuilder = target.manager();
                            const actionsQueue: string[] = [];

                            const proxyMgr = new Proxy(mgrBuilder, {
                                get(mgrTarget, mgrProp) {
                                    if (mgrProp === 'execute') {
                                        return () => {
                                            const allowed = actionsQueue.every(action => validateIngress(context.props.ingress, id || 'undefined', action));
                                            if (allowed) {
                                                mgrTarget.execute();
                                            } else {
                                                console.warn(`[Grid Security] Blocked manager execution from '${id || 'undefined'}'. Queued actions: ${actionsQueue.join(', ')}`);
                                            }
                                        }
                                    }

                                    const val = Reflect.get(mgrTarget, mgrProp);
                                    if (typeof val === 'function') {
                                        return (...args: any[]) => {
                                            actionsQueue.push(`manager.${String(mgrProp)}`);
                                            val.apply(mgrTarget, args);
                                            return proxyMgr; // Return proxy to keep chaining intercepted
                                        }
                                    }
                                    return val;
                                }
                            });
                            return proxyMgr;
                        }
                    }

                    // Intercept direct API calls
                    const val = Reflect.get(target, prop);
                    if (typeof val === 'function') {
                        return (...args: any[]) => {
                            if (validateIngress(context.props.ingress, id || 'undefined', `api.${String(prop)}`)) {
                                return val.apply(target, args);
                            } else {
                                console.warn(`[Grid Security] Blocked api call 'api.${String(prop)}' from '${id || 'undefined'}'.`);
                            }
                        }
                    }

                    return val;
                }
            });
        };

        // Wrap the base API with the secure proxy, keeping 'undefined' as the default sourceId
        const secureApi = createSecureProxy(baseApi, undefined);

        return { api: secureApi, internalApi: baseApi };

    }, [
        props.events,
        props.sortFilter,
        props.pagination,
        props.columns,
        props.rows,
        props.selection,
        props.editing,
        props.props.getRowId,
        props.props.paginationMode,
        props.apiRef,
        props.props.ingress
    ]);

    return api;
}
