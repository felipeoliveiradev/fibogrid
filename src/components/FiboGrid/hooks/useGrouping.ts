import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { RowNode } from '../types';
import {
  GroupableRowNode,
  RegularRowNode,
  groupRowsByFields,
  splitRowsByField,
  flattenGroupedRows,
  isGroupNode,
  addChildRows,
} from '../utils/grouping';
import { setValueAtPath } from '../utils/helpers';
const EMPTY_GROUP_DISPLAY: GroupableRowNode<never>[] = [];
type GroupAgg = 'sum' | 'avg' | 'min' | 'max' | 'count';
function sameStringList(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function finiteGroupAggregate<T>(
  rows: Array<{ data: T }>,
  field: string,
  aggFunc: Exclude<GroupAgg, 'count'>,
): number | null {
  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < rows.length; i++) {
    const data = rows[i].data as Record<string, unknown> | null | undefined;
    const value = data == null ? undefined : data[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    sum += value;
    count += 1;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (count === 0) return null;
  switch (aggFunc) {
    case 'sum':
      return sum;
    case 'avg':
      return sum / count;
    case 'min':
      return min;
    case 'max':
      return max;
  }
}
function groupIdsOf<T>(rows: GroupableRowNode<T>[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (isGroupNode(row)) ids.add(row.id);
  }
  return ids;
}
interface UseGroupingOptions<T> {
  rows: RowNode<T>[];
  groupByFields?: string[];
  splitByField?: string;
  aggregations?: Record<string, GroupAgg>;
  getRowId?: (data: T) => string;
  overrides?: Record<string, Record<string, any>>;
  getChildRows?: (data: T) => T[] | Promise<T[]>;
  skipFullFlatten?: boolean;
}
export interface UseGroupingResult<T> {
  hasChildren: boolean;
  displayRows: GroupableRowNode<T>[];
  groupedRows: GroupableRowNode<T>[];
  splitPoints: number[];
  expandedGroups: Set<string>;
  toggleGroupExpand: (groupId: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  setGroupByFields: (fields: string[]) => void;
  groupByFields: string[];
  isGroupRow: (row: RowNode<T>) => boolean;
  addChildToRow: (parentId: string, childData: T[]) => void;
  expandedRows: Set<string>;
  toggleRowExpand: (rowId: string) => void;
}
export function useGrouping<T>({
  rows,
  groupByFields: initialGroupFields = [],
  splitByField,
  aggregations,
  getRowId = (data: T) => (data as any).id || String(Math.random()),
  overrides = {},
  getChildRows,
  skipFullFlatten = false,
}: UseGroupingOptions<T>): UseGroupingResult<T> {
  const [groupByFields, setGroupByFieldsState] = useState<string[]>(initialGroupFields);
  const [expandedOverride, setExpandedOverride] = useState<Set<string>>(() => new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [childRowsMap, setChildRowsMap] = useState<Map<string, T[]>>(new Map());
  const [loadingRowIds, setLoadingRowIds] = useState<Set<string>>(new Set());
  const expandedRowsRef = useRef(expandedRows);
  expandedRowsRef.current = expandedRows;
  const initialFieldsRef = useRef(initialGroupFields);
  initialFieldsRef.current = initialGroupFields;
  const propFieldsKey = JSON.stringify(initialGroupFields);
  useEffect(() => {
    const nextFields = initialFieldsRef.current;
    setGroupByFieldsState((prev) => (sameStringList(prev, nextFields) ? prev : nextFields));
  }, [propFieldsKey]);
  const groupFieldsKey = JSON.stringify(groupByFields);
  const groupFieldsKeyRef = useRef(groupFieldsKey);
  useEffect(() => {
    if (groupFieldsKeyRef.current === groupFieldsKey) return;
    groupFieldsKeyRef.current = groupFieldsKey;
    setExpandedOverride(new Set());
  }, [groupFieldsKey]);
  const setGroupByFields = useCallback((fields: string[]) => {
    setGroupByFieldsState((prev) => (sameStringList(prev, fields) ? prev : fields));
  }, []);
  const rowsWithChildren = useMemo(() => {
    if (childRowsMap.size === 0) {
      return rows as RegularRowNode<T>[];
    }
    let result = rows as RegularRowNode<T>[];
    childRowsMap.forEach((children, parentId) => {
      const processedChildren = children.map(childData => {
        let finalData = childData;
        const childId = getRowId(childData);
        if (overrides && overrides[childId]) {
          Object.entries(overrides[childId]).forEach(([field, value]) => {
            finalData = setValueAtPath(finalData, field, value);
          });
        }
        return finalData;
      });
      result = addChildRows(result, parentId, processedChildren, getRowId);
    });
    return result;
  }, [rows, childRowsMap, getRowId, overrides]);
  const groupedRows = useMemo(() => {
    if (groupByFields.length === 0) {
      return rowsWithChildren;
    }
    const grouped = groupRowsByFields(rowsWithChildren, groupByFields, aggregations);
    if (!aggregations) return grouped;
    const fields = Object.entries(aggregations);
    if (fields.length === 0) return grouped;
    return grouped.map((row) => {
      if (!isGroupNode(row)) return row;
      const aggregatedValues = { ...(row.aggregatedValues ?? {}) };
      for (let i = 0; i < fields.length; i++) {
        const [field, aggFunc] = fields[i];
        if (aggFunc === 'count') continue;
        aggregatedValues[field] = finiteGroupAggregate(row.groupChildren, field, aggFunc);
      }
      return { ...row, aggregatedValues };
    });
  }, [rowsWithChildren, groupByFields, aggregations]);
  const groupedRowsRef = useRef(groupedRows);
  groupedRowsRef.current = groupedRows;
  const expandedGroups = expandedOverride;
  const { rows: splitRows, splitPoints } = useMemo(() => {
    if (splitByField && groupByFields.length === 0) {
      return splitRowsByField(rowsWithChildren, splitByField);
    }
    return { rows: rowsWithChildren, splitPoints: [] };
  }, [rowsWithChildren, splitByField, groupByFields]);
  const displayRows = useMemo(() => {
    if (skipFullFlatten && groupByFields.length > 0) {
      return EMPTY_GROUP_DISPLAY as GroupableRowNode<T>[];
    }
    if (groupByFields.length > 0) {
      return flattenGroupedRows(groupedRows, expandedGroups);
    }
    if (expandedRows.size === 0) {
      return splitByField ? splitRows : rowsWithChildren;
    }
    const result: RegularRowNode<T>[] = [];
    (splitByField ? splitRows : rowsWithChildren).forEach(row => {
      result.push(row);
      const regularRow = row as RegularRowNode<T>;
      if (regularRow.childRows && expandedRows.has(row.id)) {
        regularRow.childRows.forEach(child => {
          result.push({
            ...child,
            rowIndex: result.length,
          } as RegularRowNode<T>);
        });
      }
    });
    return result;
  }, [groupedRows, expandedGroups, splitRows, splitByField, rowsWithChildren, expandedRows, groupByFields, skipFullFlatten]);
  const toggleGroupExpand = useCallback((groupId: string) => {
    setExpandedOverride(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);
  const expandAllGroups = useCallback(() => {
    setExpandedOverride(groupIdsOf(groupedRowsRef.current));
  }, []);
  const collapseAllGroups = useCallback(() => {
    setExpandedOverride(new Set());
  }, []);
  const isGroupRow = useCallback((row: RowNode<T>) => {
    return isGroupNode(row);
  }, []);
  const addChildToRow = useCallback((parentId: string, childData: T[]) => {
    setChildRowsMap(prev => {
      const next = new Map(prev);
      const existing = next.get(parentId) || [];
      next.set(parentId, [...existing, ...childData]);
      return next;
    });
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });
  }, []);
  const toggleRowExpand = useCallback((rowId: string) => {
    const opening = !expandedRowsRef.current.has(rowId);
    const nextExpanded = new Set(expandedRowsRef.current);
    if (opening) nextExpanded.add(rowId);
    else nextExpanded.delete(rowId);
    expandedRowsRef.current = nextExpanded;
    setExpandedRows(nextExpanded);
    if (!opening || !getChildRows || childRowsMap.has(rowId) || loadingRowIds.has(rowId)) return;
    const row = rows.find((item) => item.id === rowId);
    if (!row) return;
    let loaded: T[] | Promise<T[]>;
    try {
      loaded = getChildRows(row.data);
    } catch {
      return;
    }
    if (loaded instanceof Promise) {
      setLoadingRowIds((prev) => {
        const next = new Set(prev);
        next.add(rowId);
        return next;
      });
      loaded.then(
        (children) => {
          setLoadingRowIds((prev) => {
            if (!prev.has(rowId)) return prev;
            const next = new Set(prev);
            next.delete(rowId);
            return next;
          });
          if (!expandedRowsRef.current.has(rowId)) return;
          setChildRowsMap((prev) => {
            if (prev.has(rowId)) return prev;
            const next = new Map(prev);
            next.set(rowId, children);
            return next;
          });
        },
        () => {
          setLoadingRowIds((prev) => {
            if (!prev.has(rowId)) return prev;
            const next = new Set(prev);
            next.delete(rowId);
            return next;
          });
        }
      );
      return;
    }
    addChildToRow(rowId, loaded);
  }, [getChildRows, childRowsMap, loadingRowIds, rows, addChildToRow]);
  return {
    displayRows,
    groupedRows,
    splitPoints,
    expandedGroups,
    toggleGroupExpand,
    expandAllGroups,
    collapseAllGroups,
    setGroupByFields,
    groupByFields,
    isGroupRow,
    addChildToRow,
    expandedRows,
    toggleRowExpand,
    hasChildren: childRowsMap.size > 0,
  };
}
