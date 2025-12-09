import { useState, useCallback, useRef } from 'react';

interface CellChange<T> {
  rowId: string;
  field: string;
  oldValue: any;
  newValue: any;
}

interface UseUndoRedoOptions<T> {
  maxHistory?: number;
}

interface UseUndoRedoResult<T> {
  recordChange: (change: CellChange<T> | CellChange<T>[]) => void;
  undo: () => CellChange<T>[] | null;
  redo: () => CellChange<T>[] | null;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

export function useUndoRedo<T>(
  options: UseUndoRedoOptions<T> = {}
): UseUndoRedoResult<T> {
  const { maxHistory = 50 } = options;
  
  const [undoStack, setUndoStack] = useState<CellChange<T>[][]>([]);
  const [redoStack, setRedoStack] = useState<CellChange<T>[][]>([]);

  const recordChange = useCallback((change: CellChange<T> | CellChange<T>[]) => {
    const changes = Array.isArray(change) ? change : [change];
    
    setUndoStack(prev => {
      const newStack = [...prev, changes];

      if (newStack.length > maxHistory) {
        return newStack.slice(-maxHistory);
      }
      return newStack;
    });
    

    setRedoStack([]);
  }, [maxHistory]);

  const undo = useCallback((): CellChange<T>[] | null => {
    let changes: CellChange<T>[] | null = null;
    
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      
      const newStack = [...prev];
      changes = newStack.pop() || null;
      
      if (changes) {

        const reversedChanges = changes.map(c => ({
          ...c,
          oldValue: c.newValue,
          newValue: c.oldValue,
        }));
        
        setRedoStack(redoPrev => [...redoPrev, changes!]);
      }
      
      return newStack;
    });
    
    return changes;
  }, []);

  const redo = useCallback((): CellChange<T>[] | null => {
    let changes: CellChange<T>[] | null = null;
    
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      
      const newStack = [...prev];
      changes = newStack.pop() || null;
      
      if (changes) {
        setUndoStack(undoPrev => [...undoPrev, changes!]);
      }
      
      return newStack;
    });
    
    return changes;
  }, []);

  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    recordChange,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    clearHistory,
  };
}
