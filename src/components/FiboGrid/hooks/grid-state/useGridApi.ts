import { validateIngress, validateEgress } from '../../utils/permissionValidator';
import { useMemo, useRef, MutableRefObject } from 'react';
import {
    GridApi,
    FiboGridProps,
    GridManagerBuilder,
    GridApiBuilder
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
import { useGridRegistry } from '../../context/GridRegistryContext';
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
    const contextRef = useRef<UseGridApiContext<T>>(props);
    contextRef.current = props;
    // Create once: methods close over contextRef and always read .current (same pattern as params/manager).
    const methodsRef = useRef<Partial<GridApi<T>> | null>(null);
    if (methodsRef.current === null) {
        methodsRef.current = createGridApiMethods(contextRef);
    }
    const registry = useGridRegistry<T>();
    const registryRef = useRef(registry);
    registryRef.current = registry;
    const api = useMemo(() => {
        const coreTarget = {
            params: () => createGridApiBuilder(contextRef.current),
            manager: () => {
                let managerBuilderInstance: GridManagerBuilder<T> | undefined;
                createGridApiBuilder(contextRef.current).gridManager((mb) => {
                    managerBuilderInstance = mb;
                    return mb;
                });
                if (managerBuilderInstance === undefined) {
                    throw new Error('Grid manager builder was not created. createGridApiBuilder().gridManager() did not provide an instance.');
                }
                return managerBuilderInstance;
            }
        };
        const baseApi = new Proxy(coreTarget, {
            get(target, prop, receiver) {
                if (prop in target) {
                    return Reflect.get(target, prop, receiver);
                }
                return Reflect.get(methodsRef.current!, prop);
            },
            has(target, prop) {
                return (prop in target) || (prop in methodsRef.current!);
            }
        }) as unknown as GridApi<T>;

        const checkPermission = (callerId: string | undefined, action: string): boolean => {
            const currentProps = contextRef.current.props;
            const origin = callerId || 'undefined';
            const targetGridId = currentProps.gridId || 'undefined';

            // 1. If target grid defines ingress rules, validate caller against target's ingress
            if (currentProps.ingress !== undefined) {
                if (!validateIngress(currentProps.ingress, origin, action)) {
                    return false;
                }
            }

            // 2. If caller grid is registered in GridRegistry and defines egress rules,
            //    validate that caller allows sending/performing this action on targetGridId
            if (callerId && registryRef.current.getGridMeta) {
                const callerMeta = registryRef.current.getGridMeta(callerId);
                if (callerMeta?.egress !== undefined) {
                    if (!validateEgress(callerMeta.egress, targetGridId, action)) {
                        return false;
                    }
                }
            }

            // 3. If target grid defines egress rules (and no ingress rules), also validate
            //    direct connections against target's egress rules for callerId
            if (currentProps.ingress === undefined && currentProps.egress !== undefined) {
                if (!validateEgress(currentProps.egress, origin, action)) {
                    return false;
                }
            }

            return true;
        };

        const wrapManagerBuilder = (mgrBuilder: GridManagerBuilder<T>, actionsQueue: string[], id: string | undefined, onExecute: () => void): GridManagerBuilder<T> => {
            const proxyMgr: GridManagerBuilder<T> = new Proxy(mgrBuilder, {
                get(mgrTarget, mgrProp) {
                    if (mgrProp === 'execute') {
                        return () => {
                            const allowed = actionsQueue.every(action => checkPermission(id, action));
                            if (allowed) {
                                onExecute();
                            } else {
                                console.warn(`[Grid Security] Blocked manager execution from '${id || 'undefined'}'. Queued actions: ${actionsQueue.join(', ')}`);
                            }
                        };
                    }
                    const val = Reflect.get(mgrTarget, mgrProp);
                    if (typeof val === 'function') {
                        return (...args: any[]) => {
                            if (mgrProp !== 'key' && mgrProp !== 'mergeUnique') {
                                actionsQueue.push(`manager.${String(mgrProp)}`);
                            }
                            val.apply(mgrTarget, args);
                            return proxyMgr;
                        };
                    }
                    return val;
                }
            });
            return proxyMgr;
        };

        const createSecureProxy = (targetApi: GridApi<T>, id: string | undefined): GridApi<T> => {
            return new Proxy(targetApi, {
                get(target, prop, receiver) {
                    if (prop === 'connect') {
                        return (newSourceId: string) => createSecureProxy(target, newSourceId);
                    }
                    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
                    if (descriptor && !descriptor.configurable && !descriptor.writable) {
                        return Reflect.get(target, prop, receiver);
                    }
                    if (prop === 'events') {
                        return () => {
                            const evtBuilder = target.events();
                            const wrapSubscription = (sub: any, eventName: string) => {
                                return new Proxy(sub, {
                                    get(subTarget, subProp) {
                                        if (subProp === 'listen' || subProp === 'once') {
                                            return (handler: any) => {
                                                if (checkPermission(id, eventName)) {
                                                    return subTarget[subProp](handler);
                                                }
                                                return () => { };
                                            };
                                        }
                                        const result = Reflect.get(subTarget, subProp);
                                        if (typeof result === 'function') {
                                            return (...args: any[]) => {
                                                const res = result.apply(subTarget, args);
                                                if (res && res.listen) {
                                                    return wrapSubscription(res, eventName);
                                                }
                                                return res;
                                            };
                                        }
                                        return result;
                                    }
                                });
                            };
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
                        };
                    }
                    if (prop === 'manager') {
                        return () => {
                            const mgrBuilder = target.manager();
                            const actionsQueue: string[] = [];
                            return wrapManagerBuilder(mgrBuilder, actionsQueue, id, () => mgrBuilder.execute());
                        };
                    }
                    if (prop === 'params') {
                        return () => {
                            const apiBuilder = target.params();
                            const actionsQueue: string[] = [];
                            const proxyBuilder: GridApiBuilder<T> = new Proxy(apiBuilder, {
                                get(bTarget, bProp) {
                                    if (bProp === 'execute') {
                                        return () => {
                                            const allowed = actionsQueue.every(action => checkPermission(id, action));
                                            if (allowed) {
                                                bTarget.execute();
                                            } else {
                                                console.warn(`[Grid Security] Blocked params() execution from '${id || 'undefined'}'. Queued actions: ${actionsQueue.join(', ')}`);
                                            }
                                        };
                                    }
                                    if (bProp === 'gridManager') {
                                        return (callback: (manager: GridManagerBuilder<T>) => GridManagerBuilder<T>) => {
                                            bTarget.gridManager((realMgr) => {
                                                const wrappedMgr = wrapManagerBuilder(realMgr, actionsQueue, id, () => realMgr.execute());
                                                callback(wrappedMgr);
                                                return realMgr;
                                            });
                                            return proxyBuilder;
                                        };
                                    }
                                    const val = Reflect.get(bTarget, bProp);
                                    if (typeof val === 'function') {
                                        return (...args: any[]) => {
                                            actionsQueue.push(`api.${String(bProp)}`);
                                            val.apply(bTarget, args);
                                            return proxyBuilder;
                                        };
                                    }
                                    return val;
                                }
                            });
                            return proxyBuilder;
                        };
                    }
                    if (prop === 'removeEventListener') {
                        return (...args: any[]) => (target.removeEventListener as any)(...args);
                    }
                    if (prop === 'addEventListener') {
                        return (eventType: string, listener: any) => {
                            const eventPermName = eventType.startsWith('on')
                                ? eventType
                                : `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
                            if (checkPermission(id, eventPermName) || checkPermission(id, 'api.addEventListener')) {
                                return target.addEventListener(eventType, listener);
                            } else {
                                console.warn(`[Grid Security] Blocked event listener '${eventPermName}' from '${id || 'undefined'}'.`);
                            }
                        };
                    }
                    const val = Reflect.get(target, prop);
                    if (typeof val === 'function') {
                        return (...args: any[]) => {
                            if (checkPermission(id, `api.${String(prop)}`)) {
                                return val.apply(target, args);
                            } else {
                                console.warn(`[Grid Security] Blocked api call 'api.${String(prop)}' from '${id || 'undefined'}'.`);
                            }
                        };
                    }
                    return val;
                }
            });
        };
        const secureApi = createSecureProxy(baseApi, undefined);
        return { api: secureApi, internalApi: baseApi };
    }, []);
    return api;
}
