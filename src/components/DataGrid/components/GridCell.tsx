import React, { useRef, useEffect } from 'react';
import { ProcessedColumn, RowNode, GridApi } from '../types';
import { getValueFromPath } from '../utils/helpers';
import { cn } from '@/lib/utils';

interface GridCellProps<T> {
  column: ProcessedColumn<T>;
  row: RowNode<T>;
  api: GridApi<T>;
  isEditing: boolean;
  editValue?: any;
  onStartEdit: () => void;
  onEditChange: (value: any) => void;
  onStopEdit: (cancel?: boolean) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  isFocused?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
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
}: GridCellProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const value = getValueFromPath(row.data, column.field);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onStopEdit(false);
    } else if (e.key === 'Escape') {
      onStopEdit(true);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onStopEdit(false);
      // Could trigger edit on next cell
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
      <span className="truncate">{String(formattedValue ?? '')}</span>
    );
  };

  const renderEditor = () => {
    const editorType = column.cellEditor || 'text';

    switch (editorType) {
      case 'select':
        return (
          <select
            value={editValue ?? ''}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={() => onStopEdit(false)}
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
            value={editValue ?? ''}
            onChange={(e) => onEditChange(parseFloat(e.target.value) || 0)}
            onBlur={() => onStopEdit(false)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef}
            type="date"
            value={editValue ?? ''}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={() => onStopEdit(false)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
          />
        );

      default:
        return (
          <input
            ref={inputRef}
            type="text"
            value={editValue ?? ''}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={() => onStopEdit(false)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-background border-none outline-none px-1"
          />
        );
    }
  };

  return (
    <div
      className={cn(
        'flex items-center border-r border-border px-3 overflow-hidden text-sm',
        column.editable && !isEditing && 'cursor-pointer hover:bg-muted/50',
        isEditing && 'ring-2 ring-primary ring-inset p-0',
        isSelected && 'bg-primary/20',
        isFocused && !isEditing && 'ring-2 ring-primary/50 ring-inset',
        cellClass
      )}
      style={{ width: column.computedWidth, minWidth: column.minWidth || 50 }}
      onClick={onClick}
      onDoubleClick={(e) => {
        onDoubleClick(e);
        if (column.editable) {
          onStartEdit();
        }
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {renderContent()}
    </div>
  );
}
