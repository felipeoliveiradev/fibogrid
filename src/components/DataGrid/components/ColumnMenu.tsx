import React, { useRef } from 'react';
import { ProcessedColumn } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUp,
  ArrowDown,
  EyeOff,
  Pin,
  Columns,
  ArrowLeftToLine,
  ArrowRightToLine,
  Maximize2,
  Filter,
  Check,
} from 'lucide-react';

interface ColumnMenuProps<T> {
  column: ProcessedColumn<T>;
  onSort?: (field: string, direction?: 'asc' | 'desc') => void;
  onHide?: (field: string) => void;
  onPin?: (field: string, pinned: 'left' | 'right' | null) => void;
  onAutoSize?: (field: string) => void;
  onAutoSizeAll?: () => void;
  onFilterClick?: (column: ProcessedColumn<T>, rect: DOMRect) => void;
  children: React.ReactNode;
}

export function ColumnMenu<T>({
  column,
  onSort,
  onHide,
  onPin,
  onAutoSize,
  onAutoSizeAll,
  onFilterClick,
  children,
}: ColumnMenuProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleFilterClick = () => {
    if (triggerRef.current && onFilterClick) {
      const rect = triggerRef.current.getBoundingClientRect();
      onFilterClick(column, rect);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild ref={triggerRef}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 bg-popover border border-border z-[100]">
        {/* Sort Options */}
        {column.sortable !== false && onSort && (
          <>
            <DropdownMenuItem onClick={() => onSort(column.field, 'asc')}>
              <ArrowUp className="h-4 w-4 mr-2" />
              Sort Ascending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort(column.field, 'desc')}>
              <ArrowDown className="h-4 w-4 mr-2" />
              Sort Descending
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Pin Column Submenu */}
        {onPin && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Pin className="h-4 w-4 mr-2" />
                Pin Column
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border border-border z-[110]">
                <DropdownMenuItem onClick={() => onPin(column.field, null)}>
                  {!column.pinned && <Check className="h-4 w-4 mr-2" />}
                  {column.pinned && <span className="w-4 mr-2" />}
                  No Pin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin(column.field, 'left')}>
                  {column.pinned === 'left' && <Check className="h-4 w-4 mr-2" />}
                  {column.pinned !== 'left' && <ArrowLeftToLine className="h-4 w-4 mr-2" />}
                  Pin Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin(column.field, 'right')}>
                  {column.pinned === 'right' && <Check className="h-4 w-4 mr-2" />}
                  {column.pinned !== 'right' && <ArrowRightToLine className="h-4 w-4 mr-2" />}
                  Pin Right
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Auto-size Options */}
        {onAutoSize && (
          <DropdownMenuItem onClick={() => onAutoSize(column.field)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Autosize This Column
          </DropdownMenuItem>
        )}
        
        {onAutoSizeAll && (
          <DropdownMenuItem onClick={onAutoSizeAll}>
            <Columns className="h-4 w-4 mr-2" />
            Autosize All Columns
          </DropdownMenuItem>
        )}

        {(onAutoSize || onAutoSizeAll) && <DropdownMenuSeparator />}

        {/* Filter */}
        {column.filterable !== false && onFilterClick && (
          <>
            <DropdownMenuItem onClick={handleFilterClick}>
              <Filter className="h-4 w-4 mr-2" />
              Filter...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Hide Column */}
        {onHide && (
          <DropdownMenuItem onClick={() => onHide(column.field)}>
            <EyeOff className="h-4 w-4 mr-2" />
            Hide Column
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
