import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface VirtualFilterListProps {
  values: string[];
  selectedValues: Set<string>;
  onToggle: (value: string) => void;
  height?: number;
  itemHeight?: number;
  overscan?: number;
}


 
export function VirtualFilterList({
  values,
  selectedValues,
  onToggle,
  height = 192,
  itemHeight = 36,
  overscan = 5,
}: VirtualFilterListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalHeight = values.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(values.length, startIndex + visibleCount + overscan * 2);
  const visibleItems = values.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="border border-border rounded bg-background overflow-auto"
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((val, idx) => {
            const actualIndex = startIndex + idx;
            return (
              <label
                key={`${val}-${actualIndex}`}
                className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer"
                style={{ height: itemHeight }}
              >
                <Checkbox
                  checked={selectedValues.has(val)}
                  onCheckedChange={() => onToggle(val)}
                />
                <span className="text-sm truncate">{val || '(Blank)'}</span>
              </label>
            );
          })}
        </div>
      </div>

      {values.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No values found
        </div>
      )}
    </div>
  );
}
