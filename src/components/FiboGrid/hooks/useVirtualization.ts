import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const { rowHeight, overscan = 5, containerHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const scrollTopRef = useRef(0);
  const totalHeight = useMemo(() => rows.length * rowHeight, [rows.length, rowHeight]);
  const { startIndex, endIndex, virtualRows, offsetTop } = useMemo(() => {
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    // Cap overscan so a typical viewport renders ~40 rows, not ~90.
    const effectiveOverscan = Math.min(overscan, 8);
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - effectiveOverscan);
    const end = Math.min(rows.length, start + visibleRowCount + effectiveOverscan * 2);
    return {
      startIndex: start,
      endIndex: end,
      virtualRows: rows.slice(start, end),
      offsetTop: start * rowHeight,
    };
  }, [rows, scrollTop, rowHeight, containerHeight, overscan]);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    if (Math.abs(newScrollTop - scrollTopRef.current) < 1) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      scrollTopRef.current = newScrollTop;
      setScrollTop(newScrollTop);
      rafIdRef.current = null;
    });
  }, []);
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  const scrollToRow = useCallback(
    (index: number) => {
      if (index < 0) return;
      const rowCount = rows.length;
      if (rowCount === 0) return;
      const clampedIndex = index >= rowCount ? rowCount - 1 : index;
      if (containerRef.current) {
        containerRef.current.scrollTop = clampedIndex * rowHeight;
      }
    },
    [rowHeight, rows.length]
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
