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
import { cn } from '@/lib/utils';
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
import { useGridContext } from '../context/GridContext';
interface ColumnMenuProps<T> {
  column: ProcessedColumn<T>;
  onSort?: (field: string, direction?: 'asc' | 'desc') => void;
  onHide?: (field: string) => void;
  onPin?: (field: string, pinned: 'left' | 'right' | null) => void;
  onAutoSize?: (field: string) => void;
  onAutoSizeAll?: () => void;
  onFilterClick?: (column: ProcessedColumn<T>, rect: DOMRect) => void;
  children: React.ReactNode;
  className?: string;
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
  className,
}: ColumnMenuProps<T>) {
  const { locale } = useGridContext<T>()!;
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
      <DropdownMenuContent align="start" className={cn("fibogrid w-52 bg-popover border border-border fibogrid-z-column-menu", className)}>
        { }
        {column.sortable !== false && onSort && (
          <>
            <DropdownMenuItem onClick={() => onSort(column.field, 'asc')}>
              <ArrowUp className="h-4 w-4 mr-2" />
              {locale.columnMenu.sortAsc}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort(column.field, 'desc')}>
              <ArrowDown className="h-4 w-4 mr-2" />
              {locale.columnMenu.sortDesc}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        { }
        {onPin && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Pin className="h-4 w-4 mr-2" />
                {locale.columnMenu.pinColumn}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border border-border fibogrid-z-popover-nested">
                <DropdownMenuItem onClick={() => onPin(column.field, null)}>
                  {!column.pinned && <Check className="h-4 w-4 mr-2" />}
                  {column.pinned && <span className="w-4 mr-2" />}
                  {locale.columnMenu.noPin}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin(column.field, 'left')}>
                  {column.pinned === 'left' && <Check className="h-4 w-4 mr-2" />}
                  {column.pinned !== 'left' && <ArrowLeftToLine className="h-4 w-4 mr-2" />}
                  {locale.columnMenu.pinLeft}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin(column.field, 'right')}>
                  {column.pinned === 'right' && <Check className="h-4 w-4 mr-2" />}
                  {column.pinned !== 'right' && <ArrowRightToLine className="h-4 w-4 mr-2" />}
                  {locale.columnMenu.pinRight}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}
        { }
        {onAutoSize && (
          <DropdownMenuItem onClick={() => onAutoSize(column.field)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {locale.columnMenu.autosizeColumn}
          </DropdownMenuItem>
        )}
        {onAutoSizeAll && (
          <DropdownMenuItem onClick={onAutoSizeAll}>
            <Columns className="h-4 w-4 mr-2" />
            {locale.columnMenu.autosizeAll}
          </DropdownMenuItem>
        )}
        {(onAutoSize || onAutoSizeAll) && <DropdownMenuSeparator />}
        { }
        {column.filterable !== false && onFilterClick && (
          <>
            <DropdownMenuItem onClick={handleFilterClick}>
              <Filter className="h-4 w-4 mr-2" />
              {locale.columnMenu.filter}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        { }
        {onHide && (
          <DropdownMenuItem onClick={() => onHide(column.field)}>
            <EyeOff className="h-4 w-4 mr-2" />
            {locale.columnMenu.hideColumn}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
