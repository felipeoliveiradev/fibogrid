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

export function useVirtualization<T>(
  rows: RowNode<T>[],
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const { rowHeight, overscan = 10, containerHeight } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);


  const totalHeight = useMemo(() => rows.length * rowHeight, [rows.length, rowHeight]);
  

  const { startIndex, endIndex, virtualRows, offsetTop } = useMemo(() => {
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);

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


  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    

    rafIdRef.current = requestAnimationFrame(() => {
      setScrollTop(newScrollTop);
      rafIdRef.current = null;
    });
  }, []);

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
