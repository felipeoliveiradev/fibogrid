import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { RowNode } from '../types';
import { throttle } from '../utils/helpers';

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

export function useVirtualization<T>(
  rows: RowNode<T>[],
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const { rowHeight, overscan = 5, containerHeight } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = rows.length * rowHeight;
  
  const { startIndex, endIndex, virtualRows, offsetTop } = useMemo(() => {
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(rows.length, start + visibleRowCount + overscan * 2);
    
    return {
      startIndex: start,
      endIndex: end,
      virtualRows: rows.slice(start, end),
      offsetTop: start * rowHeight,
    };
  }, [rows, scrollTop, rowHeight, containerHeight, overscan]);

  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 16),
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
