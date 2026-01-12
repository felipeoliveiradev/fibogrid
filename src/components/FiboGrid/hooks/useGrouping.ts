import { useState, useCallback, useMemo } from 'react';
import { RowNode } from '../types';
import {
  GroupableRowNode,
  GroupRowNode,
  RegularRowNode,
  groupRowsByFields,
  splitRowsByField,
  flattenGroupedRows,
  isGroupNode,
  addChildRows,
} from '../utils/grouping';
import { setValueAtPath } from '../utils/helpers';
interface UseGroupingOptions<T> {
  rows: RowNode<T>[];
  groupByFields?: string[];
  splitByField?: string;
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count'>;
  getRowId?: (data: T) => string;
  overrides?: Record<string, Record<string, any>>;
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
  overrides = {}
}: UseGroupingOptions<T>): UseGroupingResult<T> {
  const [groupByFields, setGroupByFields] = useState<string[]>(initialGroupFields);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [childRowsMap, setChildRowsMap] = useState<Map<string, T[]>>(new Map());
  const rowsWithChildren = useMemo(() => {
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
    if (groupByFields.length > 0) {
      return groupRowsByFields(rowsWithChildren, groupByFields, aggregations);
    }
    return rowsWithChildren;
  }, [rowsWithChildren, groupByFields, aggregations]);
  const { rows: splitRows, splitPoints } = useMemo(() => {
    if (splitByField && groupByFields.length === 0) {
      return splitRowsByField(rowsWithChildren, splitByField);
    }
    return { rows: rowsWithChildren, splitPoints: [] };
  }, [rowsWithChildren, splitByField, groupByFields]);
  const displayRows = useMemo(() => {
    if (groupByFields.length > 0) {
      const allGroupIds = groupedRows
        .filter(r => isGroupNode(r))
        .map(r => r.id);
      const effectiveExpanded = expandedGroups.size === 0
        ? new Set(allGroupIds)
        : expandedGroups;
      return flattenGroupedRows(groupedRows, effectiveExpanded);
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
  }, [groupedRows, expandedGroups, splitRows, splitByField, rowsWithChildren, expandedRows, groupByFields]);
  const toggleGroupExpand = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);
  const expandAllGroups = useCallback(() => {
    const allGroupIds = groupedRows
      .filter(r => isGroupNode(r))
      .map(r => r.id);
    setExpandedGroups(new Set(allGroupIds));
  }, [groupedRows]);
  const collapseAllGroups = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);
  const isGroupRow = useCallback((row: RowNode<T>) => {
    return isGroupNode(row);
  }, []);
  const addChildToRow = useCallback((parentId: string, childData: T[]) => {
    console.log('[UseGrouping] addChildToRow called', parentId, childData.length);
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
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);
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