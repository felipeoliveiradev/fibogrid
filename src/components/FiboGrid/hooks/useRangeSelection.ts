import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

export interface UseRangeSelectionOptions {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  rowHeight?: number;
  totalRows?: number;
}

interface RangeSelectionResult {
  isSelecting: boolean;
  selectionStart: CellPosition | null;
  selectionEnd: CellPosition | null;
  /** Lazily derived for API compat — prefer isCellSelected (O(1)). */
  selectedCells: Set<string>;
  /** Bumped on every range change so memoized rows can repaint. */
  selectionVersion: number;
  handleCellMouseDown: (rowIndex: number, colIndex: number, e: React.MouseEvent) => void;
  handleCellMouseEnter: (rowIndex: number, colIndex: number) => void;
  handleMouseUp: () => void;
  clearSelection: () => void;
  isCellSelected: (rowIndex: number, colIndex: number) => boolean;
}

const AUTO_SCROLL_EDGE_PX = 40;
const AUTO_SCROLL_MAX_SPEED = 24;

function isSamePosition(a: CellPosition | null, b: CellPosition | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.rowIndex === b.rowIndex && a.colIndex === b.colIndex;
}

function cellInBounds(
  rowIndex: number,
  colIndex: number,
  start: CellPosition | null,
  end: CellPosition | null
): boolean {
  if (!start || !end) return false;
  const minRow = Math.min(start.rowIndex, end.rowIndex);
  const maxRow = Math.max(start.rowIndex, end.rowIndex);
  const minCol = Math.min(start.colIndex, end.colIndex);
  const maxCol = Math.max(start.colIndex, end.colIndex);
  return (
    rowIndex >= minRow &&
    rowIndex <= maxRow &&
    colIndex >= minCol &&
    colIndex <= maxCol
  );
}

function stickyHeaderOffset(container: HTMLElement): number {
  const sticky = container.querySelector('.sticky') as HTMLElement | null;
  return sticky ? sticky.offsetHeight : 0;
}

function rowIndexFromPointer(
  container: HTMLElement,
  clientY: number,
  rowHeight: number,
  totalRows: number
): number {
  if (totalRows <= 0 || rowHeight <= 0) return 0;
  const rect = container.getBoundingClientRect();
  const headerH = stickyHeaderOffset(container);
  const yInBody = clientY - rect.top + container.scrollTop - headerH;
  const raw = Math.floor(yInBody / rowHeight);
  return Math.max(0, Math.min(totalRows - 1, raw));
}

export function useRangeSelection(
  options: UseRangeSelectionOptions = {}
): RangeSelectionResult {
  const { scrollContainerRef, rowHeight = 40, totalRows = 0 } = options;

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<CellPosition | null>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);

  const isSelectingRef = useRef(false);
  const startPosRef = useRef<CellPosition | null>(null);
  const endPosRef = useRef<CellPosition | null>(null);
  const rowHeightRef = useRef(rowHeight);
  const totalRowsRef = useRef(totalRows);
  const pointerYRef = useRef(0);
  const autoScrollRafRef = useRef<number | null>(null);

  rowHeightRef.current = rowHeight;
  totalRowsRef.current = totalRows;

  const bumpVersion = useCallback(() => {
    setSelectionVersion((v) => v + 1);
  }, []);

  const setEndIfChanged = useCallback(
    (position: CellPosition) => {
      if (isSamePosition(endPosRef.current, position)) return;
      endPosRef.current = position;
      setSelectionEnd(position);
      bumpVersion();
    },
    [bumpVersion]
  );

  const extendSelectionFromPointer = useCallback(
    (clientY: number) => {
      if (!isSelectingRef.current || !startPosRef.current) return;
      const container = scrollContainerRef?.current;
      if (!container) return;

      const rowIndex = rowIndexFromPointer(
        container,
        clientY,
        rowHeightRef.current,
        totalRowsRef.current
      );
      const colIndex =
        endPosRef.current?.colIndex ?? startPosRef.current.colIndex;
      setEndIfChanged({ rowIndex, colIndex });
    },
    [scrollContainerRef, setEndIfChanged]
  );

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current !== null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  const handleCellMouseDown = useCallback(
    (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const position = { rowIndex, colIndex };

      if (e.shiftKey && startPosRef.current) {
        endPosRef.current = position;
        setSelectionEnd(position);
      } else {
        startPosRef.current = position;
        endPosRef.current = position;
        setSelectionStart(position);
        setSelectionEnd(position);
      }

      pointerYRef.current = e.clientY;
      setIsSelecting(true);
      isSelectingRef.current = true;
      bumpVersion();
    },
    [bumpVersion]
  );

  const handleCellMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!isSelectingRef.current || !startPosRef.current) return;
      setEndIfChanged({ rowIndex, colIndex });
    },
    [setEndIfChanged]
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    isSelectingRef.current = false;
    stopAutoScroll();
  }, [stopAutoScroll]);

  const clearSelection = useCallback(() => {
    startPosRef.current = null;
    endPosRef.current = null;
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsSelecting(false);
    isSelectingRef.current = false;
    stopAutoScroll();
    bumpVersion();
  }, [bumpVersion, stopAutoScroll]);

  // Stable O(1) check via refs — safe for FiboGrid's empty-deps callback.
  const isCellSelected = useCallback((rowIndex: number, colIndex: number): boolean => {
    return cellInBounds(rowIndex, colIndex, startPosRef.current, endPosRef.current);
  }, []);

  // API compat only. Skip alloc while dragging — paint uses isCellSelected + selectionVersion.
  const selectedCells = useMemo(() => {
    if (isSelecting || !selectionStart || !selectionEnd) return new Set<string>();
    const cells = new Set<string>();
    const minRow = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex);
    const maxRow = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
    const minCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const maxCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.add(`${row}-${col}`);
      }
    }
    return cells;
  }, [isSelecting, selectionStart, selectionEnd]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelectingRef.current) {
        handleMouseUp();
      }
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleMouseUp]);

  // While dragging: document mousemove extends selection past viewport + edge auto-scroll.
  useEffect(() => {
    if (!isSelecting) return;

    const container = scrollContainerRef?.current;

    const tickAutoScroll = () => {
      autoScrollRafRef.current = null;
      if (!isSelectingRef.current) return;
      const el = scrollContainerRef?.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const y = pointerYRef.current;
      let dy = 0;

      if (y < rect.top + AUTO_SCROLL_EDGE_PX) {
        const intensity = Math.min(
          1,
          (rect.top + AUTO_SCROLL_EDGE_PX - y) / AUTO_SCROLL_EDGE_PX
        );
        dy = -Math.ceil(AUTO_SCROLL_MAX_SPEED * intensity);
      } else if (y > rect.bottom - AUTO_SCROLL_EDGE_PX) {
        const intensity = Math.min(
          1,
          (y - (rect.bottom - AUTO_SCROLL_EDGE_PX)) / AUTO_SCROLL_EDGE_PX
        );
        dy = Math.ceil(AUTO_SCROLL_MAX_SPEED * intensity);
      }

      if (dy !== 0) {
        const prev = el.scrollTop;
        el.scrollTop = prev + dy;
        if (el.scrollTop !== prev) {
          extendSelectionFromPointer(y);
          autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll);
          return;
        }
      }

      // Still near edge but can't scroll further — keep selection synced once.
      extendSelectionFromPointer(y);
    };

    const scheduleAutoScrollIfNeeded = (clientY: number) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nearEdge =
        clientY < rect.top + AUTO_SCROLL_EDGE_PX ||
        clientY > rect.bottom - AUTO_SCROLL_EDGE_PX;
      if (nearEdge && autoScrollRafRef.current === null) {
        autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;
      pointerYRef.current = e.clientY;
      extendSelectionFromPointer(e.clientY);
      scheduleAutoScrollIfNeeded(e.clientY);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      stopAutoScroll();
    };
  }, [isSelecting, scrollContainerRef, extendSelectionFromPointer, stopAutoScroll]);

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    selectedCells,
    selectionVersion,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
    clearSelection,
    isCellSelected,
  };
}
