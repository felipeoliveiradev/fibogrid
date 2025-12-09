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
  // Tree/hierarchy support
  indent?: number;
  showExpandIcon?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  // Cell ref for auto-size
  registerCellRef?: (field: string, rowId: string, element: HTMLElement | null) => void;
  // Row height for 100% height
  rowHeight?: number;
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
  indent = 0,
  showExpandIcon,
  isExpanded,
  onToggleExpand,
  registerCellRef,
  rowHeight,
}: GridCellProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const value = getValueFromPath(row.data, column.field);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Register cell ref for measuring
  useEffect(() => {
    if (registerCellRef && contentRef.current) {
      registerCellRef(column.field, row.id, contentRef.current);
      return () => registerCellRef(column.field, row.id, null);
    }
  }, [registerCellRef, column.field, row.id]);

  // Track if we're currently stopping to prevent double-calls
  const isStoppingRef = useRef(false);

  // Get the current value from the input element directly to avoid stale closure
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
    // Prevent double-calling onStopEdit when Enter/Tab/Escape was pressed
    if (!isStoppingRef.current) {
      const currentValue = getCurrentValue();
      onStopEdit(false, currentValue);
    }
    isStoppingRef.current = false;
  };

  const handleCellClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    onClick(e);
  };

  const handleCellDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row double click
    onDoubleClick(e);
    if (column.editable) {
      onStartEdit();
    }
  };

  const handleMouseDownInternal = (e: React.MouseEvent) => {
    // Don't trigger range selection on normal clicks
    // Range selection requires Shift key
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const formattedValue = column.valueFormatter
    ? column.valueFormatter(value, row.data)
    : value;

  const cellClass =
    typeof column.cellClass === 'function'
      ? column.cellClass({ value, data: row.data, rowIndex: row.rowIndex, colDef: column, column, api })
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
        'flex items-center border-r border-border px-3 overflow-hidden text-sm flex-shrink-0 whitespace-nowrap min-w-0',
        column.editable && !isEditing && 'cursor-pointer hover:bg-muted/50',
        isEditing && 'ring-2 ring-primary ring-inset p-0',
        isSelected && 'bg-primary/20',
        isFocused && !isEditing && 'ring-2 ring-primary/50 ring-inset',
        cellClass
      )}
      style={{ 
        width: '100%',
        minWidth: '100%',
        height: rowHeight ? `${rowHeight}px` : '100%',
        paddingLeft: indent > 0 ? `${indent + 12}px` : undefined,
      }}
      onClick={handleCellClick}
      onDoubleClick={handleCellDoubleClick}
      onMouseDown={handleMouseDownInternal}
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
