import React, { useState } from 'react';
import { ProcessedColumn } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search, Eye, EyeOff, Pin, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
interface ColumnPanelProps<T> {
  columns: ProcessedColumn<T>[];
  onClose: () => void;
  onColumnVisibilityChange: (field: string, visible: boolean) => void;
  onColumnPinChange: (field: string, pinned: 'left' | 'right' | null) => void;
  onColumnOrderChange: (fromIndex: number, toIndex: number) => void;
}
export function ColumnPanel<T>({
  columns,
  onClose,
  onColumnVisibilityChange,
  onColumnPinChange,
  onColumnOrderChange,
}: ColumnPanelProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const filteredColumns = columns.filter(col =>
    col.headerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onColumnOrderChange(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  return (
    <div className="fixed right-0 top-0 bottom-0 w-72 fibogrid-column-panel fibogrid-z-column-panel flex flex-col">
      { }
      <div className="flex items-center justify-between px-4 py-3 fibogrid-column-panel-header">
        <h3 className="font-semibold">Columns</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      { }
      <div className="p-3 fibogrid-column-panel-search">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 fibogrid-column-panel-icon" />
          <Input
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 fibogrid-column-panel-search-input"
          />
        </div>
      </div>
      { }
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredColumns.map((column, index) => (
            <div
              key={column.field}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 fibogrid-column-panel-item cursor-pointer group',
                draggedIndex === index && 'fibogrid-column-panel-item-dragging',
                dragOverIndex === index && 'fibogrid-column-panel-item-drag-over'
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className="h-4 w-4 fibogrid-column-panel-icon opacity-0 group-hover:opacity-100 cursor-grab" />
              <Checkbox
                checked={!column.hide}
                onCheckedChange={(checked) =>
                  onColumnVisibilityChange(column.field, checked as boolean)
                }
              />
              <span className="flex-1 text-sm truncate">
                {column.headerName}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => onColumnPinChange(column.field, column.pinned === 'left' ? null : 'left')}
                  className={cn(
                    'p-1 rounded',
                    column.pinned === 'left' && 'text-primary'
                  )}
                  title={column.pinned === 'left' ? 'Unpin' : 'Pin Left'}
                >
                  <Pin className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      { }
      <div className="p-3 fibogrid-column-panel-footer flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => columns.forEach(col => onColumnVisibilityChange(col.field, false))}
        >
          <EyeOff className="h-4 w-4 mr-1" />
          Hide All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => columns.forEach(col => onColumnVisibilityChange(col.field, true))}
        >
          <Eye className="h-4 w-4 mr-1" />
          Show All
        </Button>
      </div>
    </div>
  );
}
