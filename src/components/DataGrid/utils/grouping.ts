import { RowNode } from '../types';

export interface GroupRowNode<T = any> extends RowNode<T> {
  isGroup: true;
  groupField: string;
  groupValue: any;
  groupChildren: RowNode<T>[];
  aggregatedValues?: Record<string, any>;
}

export interface RegularRowNode<T = any> extends RowNode<T> {
  isGroup?: false;
  parentGroupId?: string;
  childRows?: RowNode<T>[];
  isChildRow?: boolean;
  parentRowId?: string;
}

export type GroupableRowNode<T = any> = GroupRowNode<T> | RegularRowNode<T>;

export function isGroupNode<T>(node: RowNode<T>): node is GroupRowNode<T> {
  return (node as GroupRowNode<T>).isGroup === true;
}

// Group rows by one or more fields
export function groupRowsByFields<T>(
  rows: RowNode<T>[],
  groupFields: string[],
  aggregations?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count'>
): GroupableRowNode<T>[] {
  if (groupFields.length === 0) {
    return rows as RegularRowNode<T>[];
  }

  const groupMap = new Map<string, RowNode<T>[]>();
  
  rows.forEach(row => {
    const groupKey = groupFields
      .map(field => String((row.data as any)[field] ?? 'undefined'))
      .join('|||');
    
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }
    groupMap.get(groupKey)!.push(row);
  });

  const result: GroupableRowNode<T>[] = [];
  
  groupMap.forEach((groupRows, groupKey) => {
    const keyParts = groupKey.split('|||');
    const groupValues: Record<string, any> = {};
    groupFields.forEach((field, i) => {
      groupValues[field] = keyParts[i];
    });

    // Calculate aggregations
    const aggregatedValues: Record<string, any> = {};
    if (aggregations) {
      Object.entries(aggregations).forEach(([field, aggFunc]) => {
        const values = groupRows.map(r => (r.data as any)[field]).filter(v => v != null);
        switch (aggFunc) {
          case 'sum':
            aggregatedValues[field] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregatedValues[field] = values.length > 0 
              ? values.reduce((a, b) => a + b, 0) / values.length 
              : 0;
            break;
          case 'min':
            aggregatedValues[field] = Math.min(...values);
            break;
          case 'max':
            aggregatedValues[field] = Math.max(...values);
            break;
          case 'count':
            aggregatedValues[field] = values.length;
            break;
        }
      });
    }

    const groupNode: GroupRowNode<T> = {
      id: `group-${groupKey}`,
      data: groupRows[0].data, // Use first row's data as representative
      rowIndex: result.length,
      selected: false,
      expanded: true,
      level: 0,
      isGroup: true,
      groupField: groupFields.join(','),
      groupValue: groupFields.length === 1 ? groupValues[groupFields[0]] : groupValues,
      groupChildren: groupRows,
      aggregatedValues,
    };

    result.push(groupNode);
  });

  return result;
}

// Split/expand rows - create visual separation between groups
export function splitRowsByField<T>(
  rows: RowNode<T>[],
  splitField: string
): { rows: RegularRowNode<T>[]; splitPoints: number[] } {
  if (rows.length === 0) {
    return { rows: [], splitPoints: [] };
  }

  const result: RegularRowNode<T>[] = [];
  const splitPoints: number[] = [];
  let lastValue: any = undefined;

  rows.forEach((row, index) => {
    const currentValue = (row.data as any)[splitField];
    
    if (lastValue !== undefined && currentValue !== lastValue) {
      splitPoints.push(result.length);
    }
    
    result.push({
      ...row,
      isGroup: false,
    } as RegularRowNode<T>);
    
    lastValue = currentValue;
  });

  return { rows: result, splitPoints };
}

// Add child rows to a parent row
export function addChildRows<T>(
  rows: RowNode<T>[],
  parentId: string,
  childData: T[],
  getRowId: (data: T) => string
): RegularRowNode<T>[] {
  const result: RegularRowNode<T>[] = [];
  
  rows.forEach(row => {
    const regularRow: RegularRowNode<T> = {
      ...row,
      isGroup: false,
    };
    result.push(regularRow);
    
    if (row.id === parentId) {
      regularRow.childRows = childData.map((data, index) => ({
        id: getRowId(data),
        data,
        rowIndex: -1,
        selected: false,
        level: (row.level || 0) + 1,
        parent: row,
        isChildRow: true,
        parentRowId: parentId,
      } as RegularRowNode<T>));
    }
  });
  
  return result;
}

// Flatten grouped rows (when group is expanded)
export function flattenGroupedRows<T>(
  groupedRows: GroupableRowNode<T>[],
  expandedGroups: Set<string>
): RegularRowNode<T>[] {
  const result: RegularRowNode<T>[] = [];
  
  groupedRows.forEach(row => {
    if (isGroupNode(row)) {
      result.push({
        ...row,
        rowIndex: result.length,
      } as unknown as RegularRowNode<T>);
      
      if (expandedGroups.has(row.id)) {
        row.groupChildren.forEach(child => {
          result.push({
            ...child,
            rowIndex: result.length,
            level: 1,
            parentGroupId: row.id,
            isGroup: false,
          } as RegularRowNode<T>);
        });
      }
    } else {
      result.push({
        ...row,
        rowIndex: result.length,
        isGroup: false,
      } as RegularRowNode<T>);
      
      // Add child rows if parent is expanded
      const regularRow = row as RegularRowNode<T>;
      if (regularRow.childRows && regularRow.expanded !== false) {
        regularRow.childRows.forEach(child => {
          result.push({
            ...child,
            rowIndex: result.length,
            isGroup: false,
          } as RegularRowNode<T>);
        });
      }
    }
  });
  
  return result;
}