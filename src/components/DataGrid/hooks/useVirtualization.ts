import { useCallback, useMemo, useRef, useState } from 'react';
import { RowNode } from '../types';

interface VirtualizationOptions {
  rowHeight: number;
  overscan?: number;
  containerHeight: number;
}

interface VirtualizationResult<T> {
  virtualRows: RowNode<T>[];
  totalHeight: number;
  offsetTop: number;
  startIndex: number;
  endIndex: number;
  scrollTop: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollToRow: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

// Optimized throttle for high-performance scrolling
function throttleRAF<T extends (...args: any[]) => void>(fn: T): T {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs);
        }
        rafId = null;
      });
    }
  };

  return throttled as T;
}

export function useVirtualization<T>(
  rows: RowNode<T>[],
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const { rowHeight, overscan = 10, containerHeight } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize total height calculation
  const totalHeight = useMemo(() => rows.length * rowHeight, [rows.length, rowHeight]);
  
  // Optimized virtual rows calculation with larger overscan for smoother scrolling
  const { startIndex, endIndex, virtualRows, offsetTop } = useMemo(() => {
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    // Increase overscan for 100k rows to prevent flicker
    const dynamicOverscan = Math.min(overscan * 2, 30);
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - dynamicOverscan);
    const end = Math.min(rows.length, start + visibleRowCount + dynamicOverscan * 2);
    
    return {
      startIndex: start,
      endIndex: end,
      virtualRows: rows.slice(start, end),
      offsetTop: start * rowHeight,
    };
  }, [rows, scrollTop, rowHeight, containerHeight, overscan]);

  // Use RAF-throttled scroll handler for smooth 60fps scrolling
  const handleScroll = useCallback(
    throttleRAF((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }),
    []
  );

  const scrollToRow = useCallback(
    (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * rowHeight;
      }
    },
    [rowHeight]
  );

  return {
    virtualRows,
    totalHeight,
    offsetTop,
    startIndex,
    endIndex,
    scrollTop,
    handleScroll,
    scrollToRow,
    containerRef,
  };
}