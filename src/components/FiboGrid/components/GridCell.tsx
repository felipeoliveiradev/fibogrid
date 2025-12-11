import React, { useRef, useEffect } from 'react';
import { ProcessedColumn, RowNode, GridApi } from '../types';
import { getValueFromPath } from '../utils/helpers';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface GridCellProps<T> {
  column: ProcessedColumn<T>;
  row: RowNode<T>;
  api: GridApi<T>;
  isEditing: boolean;
  editValue?: any;
  onStartEdit: () => void;
  onEditChange: (value: any) => void;
  onStopEdit: (cancel?: boolean, currentValue?: any) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  isFocused?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  indent?: number;
  showExpandIcon?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  registerCellRef?: (field: string, rowId: string, element: HTMLElement | null) => void;
  rowHeight?: number;
  isFirstPinnedRight?: boolean;
  isLastCenterBeforeRight?: boolean;
}

export function GridCell<T>({
  column,
  row,
  api,
  isEditing,
  editValue,
  onStartEdit,
  onEditChange,
  onStopEdit,
  onClick,
  onDoubleClick,
  isSelected,
  isFocused,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
  indent = 0,
  showExpandIcon,
  isExpanded,
  onToggleExpand,
  registerCellRef,
  rowHeight,
  isFirstPinnedRight = false,
  isLastCenterBeforeRight = false,
}: GridCellProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const value = getValueFromPath(row.data, column.field);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (registerCellRef && contentRef.current) {
      registerCellRef(column.field, row.id, contentRef.current);
      return () => registerCellRef(column.field, row.id, null);
    }
  }, [registerCellRef, column.field, row.id]);

  const isStoppingRef = useRef(false);

  const getCurrentValue = () => {
    if (inputRef.current) {
      const inputType = inputRef.current.type;
      if (inputType === 'checkbox') {
        return inputRef.current.checked;
      } else if (inputType === 'number') {
        return parseFloat(inputRef.current.value) || 0;
      }
      return inputRef.current.value;
    }
    if (selectRef.current) {
      return selectRef.current.value;
    }
    return editValue;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      isStoppingRef.current = true;
      const currentValue = getCurrentValue();
      onStopEdit(false, currentValue);
    } else if (e.key === 'Escape') {
      isStoppingRef.current = true;
      onStopEdit(true);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      isStoppingRef.current = true;
      const currentValue = getCurrentValue();
      onStopEdit(false, currentValue);
    }
  };

  const handleBlur = () => {
    if (!isStoppingRef.current) {
      const currentValue = getCurrentValue();
      onStopEdit(false, currentValue);
    }
    isStoppingRef.current = false;
  };

  const handleCellClick = (e: React.MouseEvent) => {
    onClick(e);
  };

  const handleCellDoubleClick = (e: React.MouseEvent) => {
    onDoubleClick(e);
    if (column.editable) {
      onStartEdit();
    }
  };

  const handleMouseDownInternal = (e: React.MouseEvent) => {
    if (isEditing) {
      return;
    }

    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const formattedValue = column.valueFormatter
    ? column.valueFormatter(value, row.data)
    : value;

  const cellClass =
    typeof column.cellClass === 'function'
      ? column.cellClass({ value, data: row.data, rowIndex: row.rowIndex, colDef: column, column, api, rowNode: row })
      : column.cellClass;

  const renderContent = () => {
    if (isEditing) {
      return renderEditor();
    }

    if (column.cellRenderer) {
      return column.cellRenderer({
        value,
        data: row.data,
        rowIndex: row.rowIndex,
        colDef: column,
        column,
        api,
        rowNode: row,
      });
    }

    return (
      <span className="truncate whitespace-nowrap">{String(formattedValue ?? '')}</span>
    );
  };

  const renderEditor = () => {
    const editorType = column.cellEditor || 'text';

    switch (editorType) {
      case 'select':
        return (
          <select
            ref={selectRef}
            value={editValue ?? ''}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
          >
            {column.cellEditorParams?.values?.map((v: string) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!editValue}
            onChange={(e) => {
              onEditChange(e.target.checked);
              onStopEdit(false);
            }}
            onKeyDown={handleKeyDown}
            className="h-4 w-4"
            autoFocus
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef}
            type="number"
            defaultValue={editValue ?? ''}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
            autoFocus
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef}
            type="date"
            defaultValue={editValue ?? ''}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
            autoFocus
          />
        );

      default:
        return (
          <input
            ref={inputRef}
            type="text"
            defaultValue={editValue ?? ''}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
            autoFocus
          />
        );
    }
  };

  return (
    <div
      className={cn(
        'flex items-center px-3 overflow-hidden text-sm flex-shrink-0 whitespace-nowrap min-w-0',
        !isLastCenterBeforeRight && 'border-r border-border',
        'fibogrid-cell-full-width',
        isFirstPinnedRight && 'border-l border-border',
        column.editable && !isEditing && 'cursor-pointer hover:bg-muted/50',
        isEditing && 'fibogrid-cell-editing',
        isSelected && 'fibogrid-cell-selected',
        isFocused && !isEditing && 'fibogrid-cell-focused',
        cellClass
      )}
      style={{
        height: rowHeight ? `${rowHeight}px` : '100%',
        paddingLeft: indent > 0 ? `calc(var(--fibogrid-cell-indent-level) * ${indent} + var(--fibogrid-cell-indent-base))` : undefined,
      }}
      onClick={handleCellClick}
      onDoubleClick={handleCellDoubleClick}
      onMouseDown={handleMouseDownInternal}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
    >
      {showExpandIcon && (
        <button
          className="mr-1 p-0.5 rounded hover:bg-muted-foreground/20 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      )}
      <div ref={contentRef} className="flex-1 overflow-hidden h-full flex items-center min-w-0 whitespace-nowrap">
        {renderContent()}
      </div>
    </div>
  );
}
