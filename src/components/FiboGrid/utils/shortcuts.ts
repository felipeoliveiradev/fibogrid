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

    if (needsCtrl && !event.ctrlKey) return false;
    if (needsMeta && !event.metaKey) return false;
    if (needsShift && !event.shiftKey) return false;
    if (needsAlt && !event.altKey) return false;



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
      const totalRows = api.getDisplayedRows().length;
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
    action: ({ currentState, focusCell }) => {
      const { rowIndex, colIndex } = currentState;
      if (colIndex > 0) {
        focusCell(rowIndex, colIndex - 1);
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
    id: 'tabForward',
    keys: 'Tab',
    description: 'Move to next cell',
    preventDefault: true,
    action: ({ event, currentState, focusCell, api }) => {
      if (event.shiftKey) return;
      const { rowIndex, colIndex } = currentState;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);

      if (colIndex < visibleColumns.length - 1) {
        focusCell(rowIndex, colIndex + 1);
      } else {
        const totalRows = api.getDisplayedRows().length;
        if (rowIndex < totalRows - 1) {
          focusCell(rowIndex + 1, 0);
        }
      }
    }
  },
  {
    id: 'tabBackward',
    keys: 'Shift+Tab',
    description: 'Move to previous cell',
    preventDefault: true,
    action: ({ currentState, focusCell, api }) => {
      const { rowIndex, colIndex } = currentState;
      const visibleColumns = api.getColumnDefs().filter(c => !c.hide);

      if (colIndex > 0) {
        focusCell(rowIndex, colIndex - 1);
      } else if (rowIndex > 0) {
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
