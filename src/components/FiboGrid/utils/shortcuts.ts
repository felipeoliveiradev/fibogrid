import { ShortcutDef, KeyboardEventParams } from '../types';
export const isShortcutMatch = (event: React.KeyboardEvent | KeyboardEvent, shortcut: ShortcutDef): boolean => {
  const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
  return keys.some(keyCombo => {
    const parts = keyCombo.toLowerCase().split('+');
    const mainKey = parts[parts.length - 1];
    const needsCtrl = parts.includes('ctrl') || parts.includes('control');
    const needsMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
    const needsShift = parts.includes('shift');
    const needsAlt = parts.includes('alt');
    if (needsCtrl !== event.ctrlKey) return false;
    if (needsMeta !== event.metaKey) return false;
    if (needsShift !== event.shiftKey) return false;
    if (needsAlt !== event.altKey) return false;
    return event.key.toLowerCase() === mainKey;
  });
};
export const defaultShortcuts: ShortcutDef[] = [
  {
    id: 'navigateUp',
    keys: 'ArrowUp',
    description: 'Navigate to the cell above',
    preventDefault: true,
    action: ({ currentState, focusCell }) => {
      const { rowIndex, colIndex } = currentState;
      if (rowIndex > 0) {
        focusCell(rowIndex - 1, colIndex);
      }
    }
  },
  {
    id: 'navigateDown',
    keys: 'ArrowDown',
    description: 'Navigate to the cell below',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      const totalRows = api.getDisplayedRowCount();
      if (rowIndex < totalRows - 1) {
        focusCell(rowIndex + 1, colIndex);
      }
    }
  },
  {
    id: 'navigateLeft',
    keys: 'ArrowLeft',
    description: 'Navigate only cell left',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      const allColumns = api.getColumnDefs();
      const visibleColumns = allColumns.filter(c => !c.hide);
      if (rowIndex < 0 || colIndex <= 0 || visibleColumns.length === 0) return;
      const origin = visibleColumns[colIndex] ?? allColumns[colIndex];
      if (!origin) return;
      let cursor = allColumns.findIndex(c => c.field === origin.field) - 1;
      while (cursor >= 0 && allColumns[cursor]?.hide) {
        cursor -= 1;
      }
      if (cursor < 0) return;
      const nextIndex = visibleColumns.findIndex(c => c.field === allColumns[cursor].field);
      if (nextIndex >= 0 && !visibleColumns[nextIndex].hide) {
        focusCell(rowIndex, nextIndex);
      }
    }
  },
  {
    id: 'navigateRight',
    keys: 'ArrowRight',
    description: 'Navigate only cell right',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      if (colIndex < visibleColumns.length - 1) {
        focusCell(rowIndex, colIndex + 1);
      }
    }
  },
  {
    id: 'navigateHome',
    keys: 'Home',
    description: 'Move to the first visible column of the current row',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      if (rowIndex < 0) return;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      if (visibleColumns.length === 0 || colIndex === 0) return;
      focusCell(rowIndex, 0);
    }
  },
  {
    id: 'navigateEnd',
    keys: 'End',
    description: 'Move to the last visible column of the current row',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      if (rowIndex < 0) return;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      const lastCol = visibleColumns.length - 1;
      if (lastCol < 0 || colIndex === lastCol) return;
      focusCell(rowIndex, lastCol);
    }
  },
  {
    id: 'navigateGridHome',
    keys: ['Ctrl+Home', 'Meta+Home'],
    description: 'Move to the first visible cell',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      const totalRows = api.getDisplayedRowCount();
      if (totalRows === 0 || visibleColumns.length === 0) return;
      const { rowIndex, colIndex } = currentState;
      if (rowIndex === 0 && colIndex === 0) return;
      focusCell(0, 0);
    }
  },
  {
    id: 'navigateGridEnd',
    keys: ['Ctrl+End', 'Meta+End'],
    description: 'Move to the last visible cell',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      const totalRows = api.getDisplayedRowCount();
      const lastRow = totalRows - 1;
      const lastCol = visibleColumns.length - 1;
      if (lastRow < 0 || lastCol < 0) return;
      const { rowIndex, colIndex } = currentState;
      if (rowIndex === lastRow && colIndex === lastCol) return;
      focusCell(lastRow, lastCol);
    }
  },
  {
    id: 'pageUp',
    keys: 'PageUp',
    description: 'Move up 10 rows',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      const totalRows = api.getDisplayedRowCount();
      if (totalRows === 0 || rowIndex < 0) return;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      const safeCol = colIndex >= 0 && colIndex < visibleColumns.length ? colIndex : 0;
      const nextRow = Math.max(0, rowIndex - 10);
      if (nextRow !== rowIndex) {
        focusCell(nextRow, safeCol);
      }
    }
  },
  {
    id: 'pageDown',
    keys: 'PageDown',
    description: 'Move down 10 rows',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      const totalRows = api.getDisplayedRowCount();
      if (totalRows === 0 || rowIndex < 0) return;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      const safeCol = colIndex >= 0 && colIndex < visibleColumns.length ? colIndex : 0;
      const nextRow = Math.min(totalRows - 1, rowIndex + 10);
      if (nextRow !== rowIndex) {
        focusCell(nextRow, safeCol);
      }
    }
  },
  {
    id: 'tabForward',
    keys: 'Tab',
    description: 'Move to next cell',
    preventDefault: false,
    action: ({ event, currentState, focusCell, api }) => {
      if (event.shiftKey) return;
      const { rowIndex, colIndex } = currentState;
      if (rowIndex < 0 || colIndex < 0) return;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      if (visibleColumns.length === 0) return;
      if (colIndex < visibleColumns.length - 1) {
        event.preventDefault();
        focusCell(rowIndex, colIndex + 1);
      } else {
        const totalRows = api.getDisplayedRowCount();
        if (rowIndex < totalRows - 1) {
          event.preventDefault();
          focusCell(rowIndex + 1, 0);
        }
      }
    }
  },
  {
    id: 'tabBackward',
    keys: 'Shift+Tab',
    description: 'Move to previous cell',
    preventDefault: false,
    action: ({ event, currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      if (rowIndex < 0 || colIndex < 0) return;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);
      if (visibleColumns.length === 0) return;
      if (colIndex > 0) {
        event.preventDefault();
        focusCell(rowIndex, colIndex - 1);
      } else if (rowIndex > 0) {
        event.preventDefault();
        focusCell(rowIndex - 1, visibleColumns.length - 1);
      }
    }
  },
  {
    id: 'enterEdit',
    keys: ['Enter', 'F2'],
    description: 'Start editing cell',
    preventDefault: true,
    action: ({ currentState, api }) => {
      if (currentState.focusedCell) {
        api.startEditingCell(currentState.focusedCell.rowId, currentState.focusedCell.field);
      }
    }
  },
  {
    id: 'selectAll',
    keys: ['Ctrl+a', 'Meta+a'],
    description: 'Select all rows',
    preventDefault: true,
    action: ({ api }) => api.selectAll()
  },
  {
    id: 'copy',
    keys: ['Ctrl+c', 'Meta+c'],
    description: 'Copy selected rows to clipboard',
    preventDefault: true,
    action: ({ api }) => api.copyToClipboard(false)
  },
  {
    id: 'paste',
    keys: ['Ctrl+v', 'Meta+v'],
    description: 'Paste from clipboard',
    preventDefault: true,
    action: ({ api }) => {
      if (api.pasteFromClipboard) {
        api.pasteFromClipboard();
      }
    }
  },
  {
    id: 'undo',
    keys: ['Ctrl+z', 'Meta+z'],
    description: 'Undo last action',
    preventDefault: true,
    action: ({ api }) => {
      if (api.undo) {
        api.undo();
      }
    }
  }
];
