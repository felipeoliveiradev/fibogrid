import React from 'react';
import { ProcessedColumn, GridApi } from '../types';
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
  ArrowUpDown,
  EyeOff,
  Pin,
  PinOff,
  Columns,
  ArrowLeftToLine,
  ArrowRightToLine,
  Maximize2,
} from 'lucide-react';

interface ColumnMenuProps<T> {
  column: ProcessedColumn<T>;
  api: GridApi<T>;
  onSort: (field: string) => void;
  onHide: (field: string) => void;
  onPin: (field: string, pinned: 'left' | 'right' | null) => void;
  onAutoSize: (field: string) => void;
  onAutoSizeAll: () => void;
  children: React.ReactNode;
}

export function ColumnMenu<T>({
  column,
  api,
  onSort,
  onHide,
  onPin,
  onAutoSize,
  onAutoSizeAll,
  children,
}: ColumnMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {column.sortable !== false && (
          <>
            <DropdownMenuItem onClick={() => onSort(column.field)}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pin className="h-4 w-4 mr-2" />
            Pin Column
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onPin(column.field, 'left')}>
              <ArrowLeftToLine className="h-4 w-4 mr-2" />
              Pin Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPin(column.field, 'right')}>
              <ArrowRightToLine className="h-4 w-4 mr-2" />
              Pin Right
            </DropdownMenuItem>
            {column.pinned && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPin(column.field, null)}>
                  <PinOff className="h-4 w-4 mr-2" />
                  Unpin
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onAutoSize(column.field)}>
          <Maximize2 className="h-4 w-4 mr-2" />
          Auto-size Column
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onAutoSizeAll}>
          <Columns className="h-4 w-4 mr-2" />
          Auto-size All Columns
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onHide(column.field)}>
          <EyeOff className="h-4 w-4 mr-2" />
          Hide Column
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
