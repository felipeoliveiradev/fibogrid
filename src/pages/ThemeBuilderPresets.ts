// Default theme values with all CSS variables
const defaultTheme = {
  // Background & Surface
  '--fibogrid-bg': '#ffffff',
  '--fibogrid-surface': '#fafafa',
  '--fibogrid-surface-hover': '#f5f5f5',
  '--fibogrid-surface-selected': '#e8f4fd',
  '--fibogrid-surface-active': '#dbeafe',
  
  // Text
  '--fibogrid-text': '#1a1a1a',
  '--fibogrid-text-secondary': '#666666',
  '--fibogrid-text-muted': '#999999',
  '--fibogrid-text-inverse': '#ffffff',
  
  // Primary Colors
  '--fibogrid-primary': 'hsl(40, 65%, 45%)',
  '--fibogrid-primary-hover': 'hsl(42, 70%, 50%)',
  '--fibogrid-primary-active': 'hsl(38, 60%, 40%)',
  '--fibogrid-primary-text': '#ffffff',
  
  // States
  '--fibogrid-success': '#22c55e',
  '--fibogrid-warning': '#f59e0b',
  '--fibogrid-error': '#ef4444',
  '--fibogrid-info': '#3b82f6',
  
  // Borders - General
  '--fibogrid-border': '#e0e0e0',
  '--fibogrid-border-strong': '#c0c0c0',
  '--fibogrid-border-hover': '#b0b0b0',
  '--fibogrid-border-light': '#f0f0f0',
  
  // Cell Borders
  '--fibogrid-cell-border-right': '#e0e0e0',
  '--fibogrid-cell-border-bottom': '#e0e0e0',
  '--fibogrid-cell-border-hover': '#d0d0d0',
  '--fibogrid-cell-border-selected': '#3b82f6',
  '--fibogrid-cell-border-editing': '#3b82f6',
  
  // Row Borders
  '--fibogrid-row-border-bottom': '#e0e0e0',
  '--fibogrid-row-border-bottom-hover': '#d0d0d0',
  '--fibogrid-row-border-bottom-selected': '#3b82f6',
  '--fibogrid-row-border-bottom-group': '#c0c0c0',
  
  // Header Borders
  '--fibogrid-header-border-bottom': '#c0c0c0',
  '--fibogrid-header-cell-border-right': '#e0e0e0',
  '--fibogrid-header-cell-border-right-hover': '#d0d0d0',
  '--fibogrid-header-cell-border-right-active': '#3b82f6',
  
  // Toolbar & Statusbar
  '--fibogrid-toolbar-border-bottom': '#e0e0e0',
  '--fibogrid-statusbar-border-top': '#e0e0e0',
  
  // Container
  '--fibogrid-container-border': '#e0e0e0',
  '--fibogrid-container-border-focus': '#3b82f6',
  
  // Typography
  '--fibogrid-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '--fibogrid-font-size': '14px',
  '--fibogrid-font-size-sm': '12px',
  '--fibogrid-font-size-lg': '16px',
  '--fibogrid-font-weight-normal': '400',
  '--fibogrid-font-weight-medium': '500',
  '--fibogrid-font-weight-semibold': '600',
  '--fibogrid-font-weight-bold': '700',
  '--fibogrid-line-height': '1.5',
  
  // Sizing
  '--fibogrid-header-height': '44px',
  '--fibogrid-row-height': '40px',
  '--fibogrid-toolbar-height': '48px',
  '--fibogrid-statusbar-height': '36px',
  '--fibogrid-cell-padding': '12px',
  
  // Spacing
  '--fibogrid-spacing-xs': '4px',
  '--fibogrid-spacing-sm': '8px',
  '--fibogrid-spacing-md': '12px',
  '--fibogrid-spacing-lg': '16px',
  '--fibogrid-spacing-xl': '24px',
  
  // Border Radius
  '--fibogrid-radius-sm': '4px',
  '--fibogrid-radius-md': '6px',
  '--fibogrid-radius-lg': '8px',
  
  // Selection
  '--fibogrid-selection-bg': 'rgba(59, 130, 246, 0.1)',
  '--fibogrid-selection-border': '#3b82f6',
  '--fibogrid-selection-hover': 'rgba(59, 130, 246, 0.15)',
  
  // Pinned Columns
  '--fibogrid-pinned-bg': '#ffffff',
  '--fibogrid-pinned-header-bg': '#fafafa',
  '--fibogrid-pinned-cell-bg': '#ffffff',
  '--fibogrid-pinned-cell-bg-even': '#ffffff',
  '--fibogrid-pinned-cell-bg-odd': '#fafafa',
  '--fibogrid-pinned-cell-bg-hover': '#f5f5f5',
  '--fibogrid-pinned-cell-bg-selected': '#e8f4fd',
  '--fibogrid-pinned-shadow': '2px 0 5px rgba(0, 0, 0, 0.1)',
  '--fibogrid-pinned-shadow-left': '2px 0 5px rgba(0, 0, 0, 0.1)',
  '--fibogrid-pinned-shadow-right': '-2px 0 5px rgba(0, 0, 0, 0.1)',
  
  // Toolbar Padding
  '--fibogrid-toolbar-padding': '12px',
  
  // Buttons
  '--fibogrid-button-bg': 'transparent',
  '--fibogrid-button-bg-hover': '#f5f5f5',
  '--fibogrid-button-bg-active': '#dbeafe',
  '--fibogrid-button-bg-disabled': 'transparent',
  '--fibogrid-button-text': '#1a1a1a',
  '--fibogrid-button-text-hover': '#1a1a1a',
  '--fibogrid-button-text-active': '#1a1a1a',
  '--fibogrid-button-text-disabled': '#999999',
  '--fibogrid-button-border': '#e0e0e0',
  '--fibogrid-button-border-hover': '#3b82f6',
  '--fibogrid-button-border-active': 'hsl(38, 60%, 40%)',
  '--fibogrid-button-border-disabled': '#f0f0f0',
  
  // Inputs
  '--fibogrid-input-bg': '#ffffff',
  '--fibogrid-input-bg-focus': '#ffffff',
  '--fibogrid-input-bg-disabled': '#fafafa',
  '--fibogrid-input-text': '#1a1a1a',
  '--fibogrid-input-text-placeholder': '#999999',
  '--fibogrid-input-text-disabled': '#999999',
  '--fibogrid-input-border': '#e0e0e0',
  '--fibogrid-input-border-focus': '#3b82f6',
  '--fibogrid-input-border-hover': '#b0b0b0',
  '--fibogrid-input-border-disabled': '#f0f0f0',
  
  // Icons
  '--fibogrid-icon-color': '#666666',
  '--fibogrid-icon-color-hover': '#3b82f6',
  '--fibogrid-icon-color-active': 'hsl(38, 60%, 40%)',
  '--fibogrid-icon-color-disabled': '#999999',
  '--fibogrid-sort-icon-color': '#666666',
  '--fibogrid-sort-icon-color-active': '#3b82f6',
  '--fibogrid-filter-icon-color': '#666666',
  '--fibogrid-filter-icon-color-hover': '#3b82f6',
  '--fibogrid-filter-icon-color-active': '#3b82f6',
  '--fibogrid-search-icon-color': '#666666',
  
  // Scrollbar
  '--fibogrid-scrollbar-width': '12px',
  '--fibogrid-scrollbar-height': '12px',
  '--fibogrid-scrollbar-track-bg': '#ffffff',
  '--fibogrid-scrollbar-thumb-bg': '#e0e0e0',
  '--fibogrid-scrollbar-thumb-bg-hover': '#666666',
  '--fibogrid-scrollbar-thumb-border': '#ffffff',
  '--fibogrid-scrollbar-thumb-radius': '6px',
  
  // Checkbox
  '--fibogrid-checkbox-bg': '#ffffff',
  '--fibogrid-checkbox-bg-checked': '#3b82f6',
  '--fibogrid-checkbox-bg-hover': '#f5f5f5',
  '--fibogrid-checkbox-border': '#e0e0e0',
  '--fibogrid-checkbox-border-hover': '#3b82f6',
  '--fibogrid-checkbox-border-checked': '#3b82f6',
  '--fibogrid-checkbox-checkmark': '#ffffff',
  '--fibogrid-checkbox-size': '16px',
  
  // Tooltip
  '--fibogrid-tooltip-bg': '#ffffff',
  '--fibogrid-tooltip-text': '#1a1a1a',
  '--fibogrid-tooltip-border': 'transparent',
  '--fibogrid-tooltip-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  
  // Dropdown / Popover
  '--fibogrid-dropdown-bg': '#fafafa',
  '--fibogrid-dropdown-border': '#e0e0e0',
  '--fibogrid-dropdown-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  '--fibogrid-dropdown-item-bg': 'transparent',
  '--fibogrid-dropdown-item-bg-hover': '#f5f5f5',
  '--fibogrid-dropdown-item-text': '#1a1a1a',
  '--fibogrid-dropdown-item-text-hover': '#1a1a1a',
  
  // Loading Spinner
  '--fibogrid-spinner-color': '#3b82f6',
  '--fibogrid-spinner-bg': '#e0e0e0',
  '--fibogrid-spinner-size': '40px',
  '--fibogrid-spinner-width': '4px',
  
  // Group Row
  '--fibogrid-group-row-bg': '#fafafa',
  '--fibogrid-group-row-text': '#1a1a1a',
  '--fibogrid-group-row-border': '#e0e0e0',
  
  // Focus Ring
  '--fibogrid-focus-ring-color': '#3b82f6',
  '--fibogrid-focus-ring-width': '2px',
  '--fibogrid-focus-ring-offset': '2px',
  
  // Row States - Even/Odd
  '--fibogrid-row-bg-even': '#ffffff',
  '--fibogrid-row-bg-odd': '#fafafa',
  '--fibogrid-row-bg-hover': '#f5f5f5',
  '--fibogrid-row-bg-selected': '#e8f4fd',
  '--fibogrid-row-bg-selected-hover': '#dbeafe',
  '--fibogrid-row-bg-child': '#fafafa',
  
  // Header States
  '--fibogrid-header-bg': '#fafafa',
  '--fibogrid-header-bg-hover': '#f5f5f5',
  '--fibogrid-header-bg-drag-over': 'rgba(59, 130, 246, 0.2)',
  '--fibogrid-header-text': '#1a1a1a',
  '--fibogrid-header-text-secondary': '#666666',
  
  // Filter Row
  '--fibogrid-filter-row-bg': '#fafafa',
  '--fibogrid-filter-row-border': '#e0e0e0',
  '--fibogrid-filter-input-bg': 'transparent',
  '--fibogrid-filter-input-bg-focus': '#ffffff',
  '--fibogrid-filter-input-text': '#1a1a1a',
  '--fibogrid-filter-input-border': 'transparent',
  '--fibogrid-filter-input-border-focus': '#3b82f6',
  '--fibogrid-filter-active-bg': 'rgba(59, 130, 246, 0.1)',
  '--fibogrid-filter-active-text': '#3b82f6',
  '--fibogrid-filter-active-border': '#3b82f6',
  
  // Drag & Drop
  '--fibogrid-drag-opacity': '0.5',
  '--fibogrid-drag-over-bg': 'rgba(59, 130, 246, 0.2)',
  '--fibogrid-drop-target-border': '#3b82f6',
  '--fibogrid-drop-target-border-width': '2px',
  
  // Column Resize
  '--fibogrid-resize-handle-bg': 'transparent',
  '--fibogrid-resize-handle-bg-hover': '#3b82f6',
  '--fibogrid-resize-handle-bg-active': '#3b82f6',
  '--fibogrid-resize-handle-width': '2px',
  
  // Pagination
  '--fibogrid-pagination-bg': '#fafafa',
  '--fibogrid-pagination-text': '#666666',
  '--fibogrid-pagination-border': '#e0e0e0',
  '--fibogrid-pagination-button-bg': 'transparent',
  '--fibogrid-pagination-button-bg-hover': '#f5f5f5',
  '--fibogrid-pagination-button-text': '#1a1a1a',
  '--fibogrid-pagination-button-text-disabled': '#999999',
  '--fibogrid-pagination-button-border': '#e0e0e0',
  '--fibogrid-pagination-select-bg': '#ffffff',
  '--fibogrid-pagination-select-text': '#1a1a1a',
  '--fibogrid-pagination-select-border': '#e0e0e0',
  
  // Quick Filter / Active Filters
  '--fibogrid-quick-filter-bg': '#fafafa',
  '--fibogrid-quick-filter-border': '#e0e0e0',
  '--fibogrid-active-filter-bg': 'rgba(59, 130, 246, 0.1)',
  '--fibogrid-active-filter-text': '#3b82f6',
  '--fibogrid-active-filter-border': '#3b82f6',
  '--fibogrid-active-filter-remove-bg': 'transparent',
  '--fibogrid-active-filter-remove-bg-hover': 'rgba(59, 130, 246, 0.2)',
  
  // Row Numbers
  '--fibogrid-row-number-bg': '#fafafa',
  '--fibogrid-row-number-bg-selected': 'rgba(59, 130, 246, 0.15)',
  '--fibogrid-row-number-text': '#666666',
  '--fibogrid-row-number-border': '#e0e0e0',
  
  // Checkbox Column
  '--fibogrid-checkbox-column-bg': '#fafafa',
  '--fibogrid-checkbox-column-border': '#e0e0e0',
  
  // Popover / Dropdown Content
  '--fibogrid-popover-bg': '#fafafa',
  '--fibogrid-popover-border': '#e0e0e0',
  '--fibogrid-popover-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  '--fibogrid-popover-item-bg': 'transparent',
  '--fibogrid-popover-item-bg-hover': '#f5f5f5',
  '--fibogrid-popover-item-bg-focus': '#f5f5f5',
  '--fibogrid-popover-item-bg-active': '#dbeafe',
  '--fibogrid-popover-item-bg-drag-over': 'rgba(59, 130, 246, 0.1)',
  '--fibogrid-popover-item-text': '#1a1a1a',
  '--fibogrid-popover-item-text-hover': '#1a1a1a',
  '--fibogrid-popover-item-text-focus': '#1a1a1a',
  '--fibogrid-popover-item-text-active': '#1a1a1a',
  '--fibogrid-popover-item-border': 'transparent',
  '--fibogrid-popover-item-border-hover': 'transparent',
  '--fibogrid-popover-item-border-focus': '#3b82f6',
  '--fibogrid-popover-item-opacity-dragging': '0.5',
  
  // Popover Input (Search)
  '--fibogrid-popover-input-bg': '#ffffff',
  '--fibogrid-popover-input-bg-focus': '#ffffff',
  '--fibogrid-popover-input-bg-hover': '#ffffff',
  '--fibogrid-popover-input-text': '#1a1a1a',
  '--fibogrid-popover-input-text-placeholder': '#999999',
  '--fibogrid-popover-input-border': '#e0e0e0',
  '--fibogrid-popover-input-border-focus': '#3b82f6',
  '--fibogrid-popover-input-border-hover': '#b0b0b0',
  '--fibogrid-popover-input-ring-color': '#3b82f6',
  '--fibogrid-popover-input-ring-width': '2px',
  '--fibogrid-popover-input-ring-offset': '2px',
  
  // Popover Icons
  '--fibogrid-popover-icon-color': '#666666',
  '--fibogrid-popover-icon-color-hover': '#3b82f6',
  '--fibogrid-popover-icon-color-active': 'hsl(38, 60%, 40%)',
  '--fibogrid-popover-icon-opacity-default': '0',
  '--fibogrid-popover-icon-opacity-hover': '1',
  
  // Popover Scrollbar
  '--fibogrid-popover-scrollbar-track-bg': 'transparent',
  '--fibogrid-popover-scrollbar-thumb-bg': '#e0e0e0',
  '--fibogrid-popover-scrollbar-thumb-bg-hover': '#666666',
  
  // Column Menu
  '--fibogrid-column-menu-bg': '#fafafa',
  '--fibogrid-column-menu-item-bg-hover': '#f5f5f5',
  '--fibogrid-column-menu-item-bg-focus': '#f5f5f5',
  '--fibogrid-column-menu-item-bg-active': '#dbeafe',
  '--fibogrid-column-menu-icon': '#666666',
};

export type ThemeValue = typeof defaultTheme;

// Theme Presets - Inspired by AG Grid
export const themePresets: Record<string, { name: string; description: string; theme: ThemeValue }> = {
  default: {
    name: 'Default',
    description: 'Classic golden ratio theme',
    theme: defaultTheme,
  },
  matrix: {
    name: 'Matrix',
    description: 'Cyberpunk green neon style',
    theme: {
      ...defaultTheme,
      // Background & Surface - TUDO PRETO
      '--fibogrid-bg': '#0a0a0a',
      '--fibogrid-surface': '#0f1419',
      '--fibogrid-surface-hover': '#1a2332',
      '--fibogrid-surface-selected': '#0d2818',
      '--fibogrid-surface-active': '#1a4d2e',
      
      // Text - TUDO VERDE
      '--fibogrid-text': '#00ff41',
      '--fibogrid-text-secondary': '#00cc33',
      '--fibogrid-text-muted': '#008822',
      '--fibogrid-text-inverse': '#0a0a0a',
      
      // Primary - VERDE NEON
      '--fibogrid-primary': '#00ff41',
      '--fibogrid-primary-hover': '#00ff66',
      '--fibogrid-primary-active': '#00cc33',
      '--fibogrid-primary-text': '#0a0a0a',
      
      // States
      '--fibogrid-success': '#00ff41',
      '--fibogrid-warning': '#ffaa00',
      '--fibogrid-error': '#ff0044',
      '--fibogrid-info': '#00ff41',
      
      // Borders - VERDE ESCURO E VERDE NEON
      '--fibogrid-border': '#003311',
      '--fibogrid-border-strong': '#00ff41',
      '--fibogrid-border-hover': '#00cc33',
      '--fibogrid-border-light': '#001a0a',
      
      // Cell Borders
      '--fibogrid-cell-border-right': '#003311',
      '--fibogrid-cell-border-bottom': '#003311',
      '--fibogrid-cell-border-hover': '#00ff41',
      '--fibogrid-cell-border-selected': '#00ff41',
      '--fibogrid-cell-border-editing': '#00ff41',
      
      // Row Borders
      '--fibogrid-row-border-bottom': '#003311',
      '--fibogrid-row-border-bottom-hover': '#00ff41',
      '--fibogrid-row-border-bottom-selected': '#00ff41',
      '--fibogrid-row-border-bottom-group': '#00ff41',
      
      // Header Borders
      '--fibogrid-header-border-bottom': '#00ff41',
      '--fibogrid-header-cell-border-right': '#003311',
      '--fibogrid-header-cell-border-right-hover': '#00ff41',
      '--fibogrid-header-cell-border-right-active': '#00ff41',
      
      // Toolbar & Statusbar
      '--fibogrid-toolbar-border-bottom': '#00ff41',
      '--fibogrid-statusbar-border-top': '#00ff41',
      
      // Container
      '--fibogrid-container-border': '#00ff41',
      '--fibogrid-container-border-focus': '#00ff41',
      
      // Typography
      '--fibogrid-font-family': '"Courier New", monospace',
      '--fibogrid-font-size': '13px',
      '--fibogrid-font-size-sm': '12px',
      '--fibogrid-font-size-lg': '14px',
      '--fibogrid-font-weight-normal': '400',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-font-weight-semibold': '600',
      '--fibogrid-font-weight-bold': '700',
      '--fibogrid-line-height': '1.5',
      
      // Sizing
      '--fibogrid-header-height': '44px',
      '--fibogrid-row-height': '40px',
      '--fibogrid-toolbar-height': '48px',
      '--fibogrid-statusbar-height': '36px',
      '--fibogrid-cell-padding': '12px',
      
      // Spacing
      '--fibogrid-spacing-xs': '4px',
      '--fibogrid-spacing-sm': '8px',
      '--fibogrid-spacing-md': '12px',
      '--fibogrid-spacing-lg': '16px',
      '--fibogrid-spacing-xl': '24px',
      
      // Border Radius - ZERO
      '--fibogrid-radius-sm': '0px',
      '--fibogrid-radius-md': '0px',
      '--fibogrid-radius-lg': '0px',
      
      // Selection
      '--fibogrid-selection-bg': 'rgba(0, 255, 65, 0.1)',
      '--fibogrid-selection-border': '#00ff41',
      '--fibogrid-selection-hover': 'rgba(0, 255, 65, 0.15)',
      
      // Pinned Columns - PRETO E VERDE
      '--fibogrid-pinned-bg': '#0a0a0a',
      '--fibogrid-pinned-header-bg': '#0f1419',
      '--fibogrid-pinned-cell-bg': '#0a0a0a',
      '--fibogrid-pinned-cell-bg-even': '#0a0a0a',
      '--fibogrid-pinned-cell-bg-odd': '#0f1419',
      '--fibogrid-pinned-cell-bg-hover': '#1a2332',
      '--fibogrid-pinned-cell-bg-selected': '#0d2818',
      '--fibogrid-pinned-shadow': '2px 0 5px rgba(0, 255, 65, 0.3)',
      '--fibogrid-pinned-shadow-left': '2px 0 5px rgba(0, 255, 65, 0.3)',
      '--fibogrid-pinned-shadow-right': '-2px 0 5px rgba(0, 255, 65, 0.3)',
      
      // Toolbar Padding
      '--fibogrid-toolbar-padding': '12px',
      
      // Buttons - VERDE NEON
      '--fibogrid-button-bg': 'transparent',
      '--fibogrid-button-bg-hover': '#0d2818',
      '--fibogrid-button-bg-active': '#1a4d2e',
      '--fibogrid-button-bg-disabled': 'transparent',
      '--fibogrid-button-text': '#00ff41',
      '--fibogrid-button-text-hover': '#00ff41',
      '--fibogrid-button-text-active': '#00ff41',
      '--fibogrid-button-text-disabled': '#008822',
      '--fibogrid-button-border': '#00ff41',
      '--fibogrid-button-border-hover': '#00ff66',
      '--fibogrid-button-border-active': '#00ff41',
      '--fibogrid-button-border-disabled': '#003311',
      
      // Inputs - PRETO COM VERDE
      '--fibogrid-input-bg': '#0a0a0a',
      '--fibogrid-input-bg-focus': '#0a0a0a',
      '--fibogrid-input-bg-disabled': '#0f1419',
      '--fibogrid-input-text': '#00ff41',
      '--fibogrid-input-text-placeholder': '#008822',
      '--fibogrid-input-text-disabled': '#008822',
      '--fibogrid-input-border': '#003311',
      '--fibogrid-input-border-focus': '#00ff41',
      '--fibogrid-input-border-hover': '#00cc33',
      '--fibogrid-input-border-disabled': '#001a0a',
      
      // Icons - VERDE NEON
      '--fibogrid-icon-color': '#00ff41',
      '--fibogrid-icon-color-hover': '#00ff66',
      '--fibogrid-icon-color-active': '#00cc33',
      '--fibogrid-icon-color-disabled': '#008822',
      '--fibogrid-sort-icon-color': '#00ff41',
      '--fibogrid-sort-icon-color-active': '#00ff41',
      '--fibogrid-filter-icon-color': '#00ff41',
      '--fibogrid-filter-icon-color-hover': '#00ff66',
      '--fibogrid-filter-icon-color-active': '#00ff41',
      '--fibogrid-search-icon-color': '#00ff41',
      
      // Scrollbar - PRETO E VERDE
      '--fibogrid-scrollbar-width': '12px',
      '--fibogrid-scrollbar-height': '12px',
      '--fibogrid-scrollbar-track-bg': '#0a0a0a',
      '--fibogrid-scrollbar-thumb-bg': '#003311',
      '--fibogrid-scrollbar-thumb-bg-hover': '#00ff41',
      '--fibogrid-scrollbar-thumb-border': '#0a0a0a',
      '--fibogrid-scrollbar-thumb-radius': '6px',
      
      // Checkbox - PRETO E VERDE
      '--fibogrid-checkbox-bg': '#0a0a0a',
      '--fibogrid-checkbox-bg-checked': '#00ff41',
      '--fibogrid-checkbox-bg-hover': '#0d2818',
      '--fibogrid-checkbox-border': '#003311',
      '--fibogrid-checkbox-border-hover': '#00ff41',
      '--fibogrid-checkbox-border-checked': '#00ff41',
      '--fibogrid-checkbox-checkmark': '#0a0a0a',
      '--fibogrid-checkbox-size': '16px',
      
      // Tooltip
      '--fibogrid-tooltip-bg': '#0a0a0a',
      '--fibogrid-tooltip-text': '#00ff41',
      '--fibogrid-tooltip-border': '#00ff41',
      '--fibogrid-tooltip-shadow': '0 10px 15px -3px rgba(0, 255, 65, 0.3)',
      
      // Dropdown / Popover
      '--fibogrid-dropdown-bg': '#0f1419',
      '--fibogrid-dropdown-border': '#00ff41',
      '--fibogrid-dropdown-shadow': '0 4px 6px -1px rgba(0, 255, 65, 0.3)',
      '--fibogrid-dropdown-item-bg': 'transparent',
      '--fibogrid-dropdown-item-bg-hover': '#0d2818',
      '--fibogrid-dropdown-item-text': '#00ff41',
      '--fibogrid-dropdown-item-text-hover': '#00ff41',
      
      // Popover / Dropdown Content - PRETO E VERDE
      '--fibogrid-popover-bg': '#0f1419',
      '--fibogrid-popover-border': '#00ff41',
      '--fibogrid-popover-shadow': '0 4px 6px -1px rgba(0, 255, 65, 0.3)',
      '--fibogrid-popover-item-bg': 'transparent',
      '--fibogrid-popover-item-bg-hover': '#0d2818',
      '--fibogrid-popover-item-bg-focus': '#0d2818',
      '--fibogrid-popover-item-bg-active': '#1a4d2e',
      '--fibogrid-popover-item-bg-drag-over': 'rgba(0, 255, 65, 0.1)',
      '--fibogrid-popover-item-text': '#00ff41',
      '--fibogrid-popover-item-text-hover': '#00ff41',
      '--fibogrid-popover-item-text-focus': '#00ff41',
      '--fibogrid-popover-item-text-active': '#00ff41',
      '--fibogrid-popover-item-border': 'transparent',
      '--fibogrid-popover-item-border-hover': 'transparent',
      '--fibogrid-popover-item-border-focus': '#00ff41',
      '--fibogrid-popover-item-opacity-dragging': '0.5',
      
      // Popover Input (Search) - PRETO E VERDE
      '--fibogrid-popover-input-bg': '#0a0a0a',
      '--fibogrid-popover-input-bg-focus': '#0a0a0a',
      '--fibogrid-popover-input-bg-hover': '#0a0a0a',
      '--fibogrid-popover-input-text': '#00ff41',
      '--fibogrid-popover-input-text-placeholder': '#008822',
      '--fibogrid-popover-input-border': '#003311',
      '--fibogrid-popover-input-border-focus': '#00ff41',
      '--fibogrid-popover-input-border-hover': '#00cc33',
      '--fibogrid-popover-input-ring-color': '#00ff41',
      '--fibogrid-popover-input-ring-width': '2px',
      '--fibogrid-popover-input-ring-offset': '2px',
      
      // Popover Icons - VERDE NEON
      '--fibogrid-popover-icon-color': '#00ff41',
      '--fibogrid-popover-icon-color-hover': '#00ff66',
      '--fibogrid-popover-icon-color-active': '#00ff41',
      '--fibogrid-popover-icon-opacity-default': '0',
      '--fibogrid-popover-icon-opacity-hover': '1',
      
      // Popover Scrollbar - PRETO E VERDE
      '--fibogrid-popover-scrollbar-track-bg': 'transparent',
      '--fibogrid-popover-scrollbar-thumb-bg': '#003311',
      '--fibogrid-popover-scrollbar-thumb-bg-hover': '#00ff41',
      
      // Loading Spinner
      '--fibogrid-spinner-color': '#00ff41',
      '--fibogrid-spinner-bg': '#003311',
      '--fibogrid-spinner-size': '40px',
      '--fibogrid-spinner-width': '4px',
      
      // Group Row
      '--fibogrid-group-row-bg': '#0f1419',
      '--fibogrid-group-row-text': '#00ff41',
      '--fibogrid-group-row-border': '#00ff41',
      
      // Focus Ring
      '--fibogrid-focus-ring-color': '#00ff41',
      '--fibogrid-focus-ring-width': '2px',
      '--fibogrid-focus-ring-offset': '2px',
      
      // Overlay & Shadow
      '--fibogrid-overlay': 'rgba(0, 0, 0, 0.8)',
      '--fibogrid-shadow-sm': '0 1px 2px 0 rgba(0, 255, 65, 0.2)',
      '--fibogrid-shadow-md': '0 4px 6px -1px rgba(0, 255, 65, 0.3)',
      '--fibogrid-shadow-lg': '0 10px 15px -3px rgba(0, 255, 65, 0.4)',
      
      // Row States - Even/Odd - PRETO
      '--fibogrid-row-bg-even': '#0a0a0a',
      '--fibogrid-row-bg-odd': '#0f1419',
      '--fibogrid-row-bg-hover': '#1a2332',
      '--fibogrid-row-bg-selected': '#0d2818',
      '--fibogrid-row-bg-selected-hover': '#1a4d2e',
      '--fibogrid-row-bg-child': '#0f1419',
      
      // Header States - PRETO E VERDE
      '--fibogrid-header-bg': '#0f1419',
      '--fibogrid-header-bg-hover': '#1a2332',
      '--fibogrid-header-bg-drag-over': 'rgba(0, 255, 65, 0.2)',
      '--fibogrid-header-text': '#00ff41',
      '--fibogrid-header-text-secondary': '#00cc33',
      
      // Filter Row - PRETO E VERDE
      '--fibogrid-filter-row-bg': '#0f1419',
      '--fibogrid-filter-row-border': '#003311',
      '--fibogrid-filter-input-bg': 'transparent',
      '--fibogrid-filter-input-bg-focus': '#0a0a0a',
      '--fibogrid-filter-input-text': '#00ff41',
      '--fibogrid-filter-input-border': 'transparent',
      '--fibogrid-filter-input-border-focus': '#00ff41',
      '--fibogrid-filter-active-bg': 'rgba(0, 255, 65, 0.1)',
      '--fibogrid-filter-active-text': '#00ff41',
      '--fibogrid-filter-active-border': '#00ff41',
      
      // Drag & Drop - VERDE
      '--fibogrid-drag-opacity': '0.5',
      '--fibogrid-drag-over-bg': 'rgba(0, 255, 65, 0.2)',
      '--fibogrid-drop-target-border': '#00ff41',
      '--fibogrid-drop-target-border-width': '2px',
      
      // Column Resize - VERDE
      '--fibogrid-resize-handle-bg': 'transparent',
      '--fibogrid-resize-handle-bg-hover': '#00ff41',
      '--fibogrid-resize-handle-bg-active': '#00ff41',
      '--fibogrid-resize-handle-width': '2px',
      
      // Pagination - PRETO E VERDE
      '--fibogrid-pagination-bg': '#0f1419',
      '--fibogrid-pagination-text': '#00ff41',
      '--fibogrid-pagination-border': '#003311',
      '--fibogrid-pagination-button-bg': 'transparent',
      '--fibogrid-pagination-button-bg-hover': '#0d2818',
      '--fibogrid-pagination-button-text': '#00ff41',
      '--fibogrid-pagination-button-text-disabled': '#008822',
      '--fibogrid-pagination-button-border': '#003311',
      '--fibogrid-pagination-select-bg': '#0a0a0a',
      '--fibogrid-pagination-select-text': '#00ff41',
      '--fibogrid-pagination-select-border': '#003311',
      
      // Quick Filter / Active Filters - VERDE
      '--fibogrid-quick-filter-bg': '#0f1419',
      '--fibogrid-quick-filter-border': '#003311',
      '--fibogrid-active-filter-bg': 'rgba(0, 255, 65, 0.1)',
      '--fibogrid-active-filter-text': '#00ff41',
      '--fibogrid-active-filter-border': '#00ff41',
      '--fibogrid-active-filter-remove-bg': 'transparent',
      '--fibogrid-active-filter-remove-bg-hover': 'rgba(0, 255, 65, 0.2)',
      
      // Row Numbers - PRETO E VERDE
      '--fibogrid-row-number-bg': '#0f1419',
      '--fibogrid-row-number-bg-selected': 'rgba(0, 255, 65, 0.15)',
      '--fibogrid-row-number-text': '#00ff41',
      '--fibogrid-row-number-border': '#003311',
      
      // Checkbox Column - PRETO E VERDE
      '--fibogrid-checkbox-column-bg': '#0f1419',
      '--fibogrid-checkbox-column-border': '#003311',
      
      // Popover / Dropdown Content - PRETO E VERDE
      '--fibogrid-popover-bg': '#0f1419',
      '--fibogrid-popover-border': '#00ff41',
      '--fibogrid-popover-shadow': '0 4px 6px -1px rgba(0, 255, 65, 0.3)',
      '--fibogrid-popover-item-bg': 'transparent',
      '--fibogrid-popover-item-bg-hover': '#0d2818',
      '--fibogrid-popover-item-text': '#00ff41',
      
      // Column Menu - PRETO E VERDE
      '--fibogrid-column-menu-bg': '#0f1419',
      '--fibogrid-column-menu-item-bg-hover': '#0d2818',
      '--fibogrid-column-menu-icon': '#00ff41',
    },
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated and refined',
    theme: {
      ...defaultTheme,
      '--fibogrid-bg': '#faf9f6',
      '--fibogrid-surface': '#f5f4f1',
      '--fibogrid-surface-hover': '#edeae3',
      '--fibogrid-surface-selected': '#e8e4db',
      '--fibogrid-text': '#2c2416',
      '--fibogrid-text-secondary': '#6b5d47',
      '--fibogrid-text-muted': '#9b8e7a',
      '--fibogrid-primary': '#8b7355',
      '--fibogrid-primary-hover': '#a68b6f',
      '--fibogrid-primary-active': '#6b5d47',
      '--fibogrid-border': '#d4c9b8',
      '--fibogrid-cell-border-right': '#e8e4db',
      '--fibogrid-cell-border-bottom': '#e8e4db',
      '--fibogrid-header-border-bottom': '#c9b99d',
      '--fibogrid-font-family': '"Georgia", "Times New Roman", serif',
      '--fibogrid-font-size': '15px',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-radius-sm': '2px',
      '--fibogrid-radius-md': '4px',
      '--fibogrid-radius-lg': '6px',
    },
  },
  uber: {
    name: 'Uber',
    description: 'Monochromatic black & white professional',
    theme: {
      ...defaultTheme,
      // Background & Surface - Pure white and grays
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f7f7f7',
      '--fibogrid-surface-hover': '#eeeeee',
      '--fibogrid-surface-selected': '#000000',
      '--fibogrid-surface-active': '#1a1a1a',
      
      // Text - Pure black and grays
      '--fibogrid-text': '#000000',
      '--fibogrid-text-secondary': '#666666',
      '--fibogrid-text-muted': '#999999',
      '--fibogrid-text-inverse': '#ffffff',
      
      // Primary - Pure black
      '--fibogrid-primary': '#000000',
      '--fibogrid-primary-hover': '#333333',
      '--fibogrid-primary-active': '#000000',
      '--fibogrid-primary-text': '#ffffff',
      
      // States
      '--fibogrid-success': '#000000',
      '--fibogrid-warning': '#666666',
      '--fibogrid-error': '#000000',
      '--fibogrid-info': '#000000',
      
      // Borders - Light grays
      '--fibogrid-border': '#e0e0e0',
      '--fibogrid-border-strong': '#000000',
      '--fibogrid-border-hover': '#cccccc',
      '--fibogrid-border-light': '#f0f0f0',
      
      // Cell Borders
      '--fibogrid-cell-border-right': '#f0f0f0',
      '--fibogrid-cell-border-bottom': '#f0f0f0',
      '--fibogrid-cell-border-hover': '#cccccc',
      '--fibogrid-cell-border-selected': '#000000',
      '--fibogrid-cell-border-editing': '#000000',
      
      // Row Borders
      '--fibogrid-row-border-bottom': '#f0f0f0',
      '--fibogrid-row-border-bottom-hover': '#e0e0e0',
      '--fibogrid-row-border-bottom-selected': '#000000',
      '--fibogrid-row-border-bottom-group': '#000000',
      
      // Header Borders
      '--fibogrid-header-border-bottom': '#000000',
      '--fibogrid-header-cell-border-right': '#f0f0f0',
      '--fibogrid-header-cell-border-right-hover': '#cccccc',
      '--fibogrid-header-cell-border-right-active': '#000000',
      
      // Toolbar & Statusbar
      '--fibogrid-toolbar-border-bottom': '#000000',
      '--fibogrid-statusbar-border-top': '#000000',
      
      // Container
      '--fibogrid-container-border': '#000000',
      '--fibogrid-container-border-focus': '#000000',
      
      // Typography - Helvetica Neue (Uber's font)
      '--fibogrid-font-family': '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      '--fibogrid-font-size': '14px',
      '--fibogrid-font-size-sm': '12px',
      '--fibogrid-font-size-lg': '16px',
      '--fibogrid-font-weight-normal': '400',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-font-weight-semibold': '600',
      '--fibogrid-font-weight-bold': '700',
      '--fibogrid-line-height': '1.5',
      
      // Sizing
      '--fibogrid-header-height': '44px',
      '--fibogrid-row-height': '40px',
      '--fibogrid-toolbar-height': '48px',
      '--fibogrid-statusbar-height': '36px',
      '--fibogrid-cell-padding': '12px',
      
      // Spacing
      '--fibogrid-spacing-xs': '4px',
      '--fibogrid-spacing-sm': '8px',
      '--fibogrid-spacing-md': '12px',
      '--fibogrid-spacing-lg': '16px',
      '--fibogrid-spacing-xl': '24px',
      
      // Border Radius - Zero (flat design)
      '--fibogrid-radius-sm': '0px',
      '--fibogrid-radius-md': '0px',
      '--fibogrid-radius-lg': '0px',
      
      // Selection
      '--fibogrid-selection-bg': 'rgba(0, 0, 0, 0.1)',
      '--fibogrid-selection-border': '#000000',
      '--fibogrid-selection-hover': 'rgba(0, 0, 0, 0.15)',
      
      // Pinned Columns
      '--fibogrid-pinned-bg': '#ffffff',
      '--fibogrid-pinned-header-bg': '#f7f7f7',
      '--fibogrid-pinned-cell-bg': '#ffffff',
      '--fibogrid-pinned-cell-bg-even': '#ffffff',
      '--fibogrid-pinned-cell-bg-odd': '#f7f7f7',
      '--fibogrid-pinned-cell-bg-hover': '#eeeeee',
      '--fibogrid-pinned-cell-bg-selected': '#000000',
      '--fibogrid-pinned-shadow': '2px 0 5px rgba(0, 0, 0, 0.1)',
      '--fibogrid-pinned-shadow-left': '2px 0 5px rgba(0, 0, 0, 0.1)',
      '--fibogrid-pinned-shadow-right': '-2px 0 5px rgba(0, 0, 0, 0.1)',
      
      // Toolbar Padding
      '--fibogrid-toolbar-padding': '12px',
      
      // Buttons
      '--fibogrid-button-bg': 'transparent',
      '--fibogrid-button-bg-hover': '#eeeeee',
      '--fibogrid-button-bg-active': '#000000',
      '--fibogrid-button-bg-disabled': 'transparent',
      '--fibogrid-button-text': '#000000',
      '--fibogrid-button-text-hover': '#000000',
      '--fibogrid-button-text-active': '#ffffff',
      '--fibogrid-button-text-disabled': '#999999',
      '--fibogrid-button-border': '#e0e0e0',
      '--fibogrid-button-border-hover': '#000000',
      '--fibogrid-button-border-active': '#000000',
      '--fibogrid-button-border-disabled': '#f0f0f0',
      
      // Inputs
      '--fibogrid-input-bg': '#ffffff',
      '--fibogrid-input-bg-focus': '#ffffff',
      '--fibogrid-input-bg-disabled': '#f7f7f7',
      '--fibogrid-input-text': '#000000',
      '--fibogrid-input-text-placeholder': '#999999',
      '--fibogrid-input-text-disabled': '#999999',
      '--fibogrid-input-border': '#e0e0e0',
      '--fibogrid-input-border-focus': '#000000',
      '--fibogrid-input-border-hover': '#cccccc',
      '--fibogrid-input-border-disabled': '#f0f0f0',
      
      // Icons
      '--fibogrid-icon-color': '#666666',
      '--fibogrid-icon-color-hover': '#000000',
      '--fibogrid-icon-color-active': '#000000',
      '--fibogrid-icon-color-disabled': '#999999',
      '--fibogrid-sort-icon-color': '#666666',
      '--fibogrid-sort-icon-color-active': '#000000',
      '--fibogrid-filter-icon-color': '#666666',
      '--fibogrid-filter-icon-color-hover': '#000000',
      '--fibogrid-filter-icon-color-active': '#000000',
      '--fibogrid-search-icon-color': '#666666',
      
      // Scrollbar
      '--fibogrid-scrollbar-width': '12px',
      '--fibogrid-scrollbar-height': '12px',
      '--fibogrid-scrollbar-track-bg': '#ffffff',
      '--fibogrid-scrollbar-thumb-bg': '#e0e0e0',
      '--fibogrid-scrollbar-thumb-bg-hover': '#666666',
      '--fibogrid-scrollbar-thumb-border': '#ffffff',
      '--fibogrid-scrollbar-thumb-radius': '6px',
      
      // Checkbox
      '--fibogrid-checkbox-bg': '#ffffff',
      '--fibogrid-checkbox-bg-checked': '#000000',
      '--fibogrid-checkbox-bg-hover': '#eeeeee',
      '--fibogrid-checkbox-border': '#e0e0e0',
      '--fibogrid-checkbox-border-hover': '#000000',
      '--fibogrid-checkbox-border-checked': '#000000',
      '--fibogrid-checkbox-checkmark': '#ffffff',
      '--fibogrid-checkbox-size': '16px',
      
      // Tooltip
      '--fibogrid-tooltip-bg': '#000000',
      '--fibogrid-tooltip-text': '#ffffff',
      '--fibogrid-tooltip-border': 'transparent',
      '--fibogrid-tooltip-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      
      // Dropdown / Popover
      '--fibogrid-dropdown-bg': '#ffffff',
      '--fibogrid-dropdown-border': '#e0e0e0',
      '--fibogrid-dropdown-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '--fibogrid-dropdown-item-bg': 'transparent',
      '--fibogrid-dropdown-item-bg-hover': '#eeeeee',
      '--fibogrid-dropdown-item-text': '#000000',
      '--fibogrid-dropdown-item-text-hover': '#000000',
      
      // Loading Spinner
      '--fibogrid-spinner-color': '#000000',
      '--fibogrid-spinner-bg': '#e0e0e0',
      '--fibogrid-spinner-size': '40px',
      '--fibogrid-spinner-width': '4px',
      
      // Group Row
      '--fibogrid-group-row-bg': '#f7f7f7',
      '--fibogrid-group-row-text': '#000000',
      '--fibogrid-group-row-border': '#000000',
      
      // Focus Ring
      '--fibogrid-focus-ring-color': '#000000',
      '--fibogrid-focus-ring-width': '2px',
      '--fibogrid-focus-ring-offset': '2px',
      
      // Overlay & Shadow
      '--fibogrid-overlay': 'rgba(0, 0, 0, 0.5)',
      '--fibogrid-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
      '--fibogrid-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '--fibogrid-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      
      // Row States - Even/Odd
      '--fibogrid-row-bg-even': '#ffffff',
      '--fibogrid-row-bg-odd': '#f7f7f7',
      '--fibogrid-row-bg-hover': '#eeeeee',
      '--fibogrid-row-bg-selected': '#000000',
      '--fibogrid-row-bg-selected-hover': '#1a1a1a',
      '--fibogrid-row-bg-child': '#f7f7f7',
      
      // Header States
      '--fibogrid-header-bg': '#f7f7f7',
      '--fibogrid-header-bg-hover': '#eeeeee',
      '--fibogrid-header-bg-drag-over': 'rgba(0, 0, 0, 0.2)',
      '--fibogrid-header-text': '#000000',
      '--fibogrid-header-text-secondary': '#666666',
      
      // Filter Row
      '--fibogrid-filter-row-bg': '#f7f7f7',
      '--fibogrid-filter-row-border': '#e0e0e0',
      '--fibogrid-filter-input-bg': 'transparent',
      '--fibogrid-filter-input-bg-focus': '#ffffff',
      '--fibogrid-filter-input-text': '#000000',
      '--fibogrid-filter-input-border': 'transparent',
      '--fibogrid-filter-input-border-focus': '#000000',
      '--fibogrid-filter-active-bg': 'rgba(0, 0, 0, 0.1)',
      '--fibogrid-filter-active-text': '#000000',
      '--fibogrid-filter-active-border': '#000000',
      
      // Drag & Drop
      '--fibogrid-drag-opacity': '0.5',
      '--fibogrid-drag-over-bg': 'rgba(0, 0, 0, 0.2)',
      '--fibogrid-drop-target-border': '#000000',
      '--fibogrid-drop-target-border-width': '2px',
      
      // Column Resize
      '--fibogrid-resize-handle-bg': 'transparent',
      '--fibogrid-resize-handle-bg-hover': '#000000',
      '--fibogrid-resize-handle-bg-active': '#000000',
      '--fibogrid-resize-handle-width': '2px',
      
      // Pagination
      '--fibogrid-pagination-bg': '#f7f7f7',
      '--fibogrid-pagination-text': '#666666',
      '--fibogrid-pagination-border': '#e0e0e0',
      '--fibogrid-pagination-button-bg': 'transparent',
      '--fibogrid-pagination-button-bg-hover': '#eeeeee',
      '--fibogrid-pagination-button-text': '#000000',
      '--fibogrid-pagination-button-text-disabled': '#999999',
      '--fibogrid-pagination-button-border': '#e0e0e0',
      '--fibogrid-pagination-select-bg': '#ffffff',
      '--fibogrid-pagination-select-text': '#000000',
      '--fibogrid-pagination-select-border': '#e0e0e0',
      
      // Quick Filter / Active Filters
      '--fibogrid-quick-filter-bg': '#f7f7f7',
      '--fibogrid-quick-filter-border': '#e0e0e0',
      '--fibogrid-active-filter-bg': 'rgba(0, 0, 0, 0.1)',
      '--fibogrid-active-filter-text': '#000000',
      '--fibogrid-active-filter-border': '#000000',
      '--fibogrid-active-filter-remove-bg': 'transparent',
      '--fibogrid-active-filter-remove-bg-hover': 'rgba(0, 0, 0, 0.2)',
      
      // Row Numbers
      '--fibogrid-row-number-bg': '#f7f7f7',
      '--fibogrid-row-number-bg-selected': 'rgba(0, 0, 0, 0.15)',
      '--fibogrid-row-number-text': '#666666',
      '--fibogrid-row-number-border': '#e0e0e0',
      
      // Checkbox Column
      '--fibogrid-checkbox-column-bg': '#f7f7f7',
      '--fibogrid-checkbox-column-border': '#e0e0e0',
      
      // Popover / Dropdown Content
      '--fibogrid-popover-bg': '#ffffff',
      '--fibogrid-popover-border': '#e0e0e0',
      '--fibogrid-popover-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '--fibogrid-popover-item-bg': 'transparent',
      '--fibogrid-popover-item-bg-hover': '#eeeeee',
      '--fibogrid-popover-item-bg-focus': '#eeeeee',
      '--fibogrid-popover-item-bg-active': '#000000',
      '--fibogrid-popover-item-bg-drag-over': 'rgba(0, 0, 0, 0.1)',
      '--fibogrid-popover-item-text': '#000000',
      '--fibogrid-popover-item-text-hover': '#000000',
      '--fibogrid-popover-item-text-focus': '#000000',
      '--fibogrid-popover-item-text-active': '#ffffff',
      '--fibogrid-popover-item-border': 'transparent',
      '--fibogrid-popover-item-border-hover': 'transparent',
      '--fibogrid-popover-item-border-focus': '#000000',
      '--fibogrid-popover-item-opacity-dragging': '0.5',
      
      // Popover Input (Search)
      '--fibogrid-popover-input-bg': '#ffffff',
      '--fibogrid-popover-input-bg-focus': '#ffffff',
      '--fibogrid-popover-input-bg-hover': '#ffffff',
      '--fibogrid-popover-input-text': '#000000',
      '--fibogrid-popover-input-text-placeholder': '#999999',
      '--fibogrid-popover-input-border': '#e0e0e0',
      '--fibogrid-popover-input-border-focus': '#000000',
      '--fibogrid-popover-input-border-hover': '#cccccc',
      '--fibogrid-popover-input-ring-color': '#000000',
      '--fibogrid-popover-input-ring-width': '2px',
      '--fibogrid-popover-input-ring-offset': '2px',
      
      // Popover Icons
      '--fibogrid-popover-icon-color': '#666666',
      '--fibogrid-popover-icon-color-hover': '#000000',
      '--fibogrid-popover-icon-color-active': '#000000',
      '--fibogrid-popover-icon-opacity-default': '0',
      '--fibogrid-popover-icon-opacity-hover': '1',
      
      // Popover Scrollbar
      '--fibogrid-popover-scrollbar-track-bg': 'transparent',
      '--fibogrid-popover-scrollbar-thumb-bg': '#e0e0e0',
      '--fibogrid-popover-scrollbar-thumb-bg-hover': '#666666',
      
      // Column Menu
      '--fibogrid-column-menu-bg': '#ffffff',
      '--fibogrid-column-menu-item-bg-hover': '#eeeeee',
      '--fibogrid-column-menu-item-bg-focus': '#eeeeee',
      '--fibogrid-column-menu-item-bg-active': '#000000',
      '--fibogrid-column-menu-icon': '#666666',
    },
  },
  alpine: {
    name: 'Alpine',
    description: 'Clean minimalist blue',
    theme: {
      ...defaultTheme,
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f8fafc',
      '--fibogrid-surface-hover': '#f1f5f9',
      '--fibogrid-surface-selected': '#e0e7ff',
      '--fibogrid-text': '#1e293b',
      '--fibogrid-text-secondary': '#64748b',
      '--fibogrid-primary': '#3b82f6',
      '--fibogrid-primary-hover': '#2563eb',
      '--fibogrid-primary-active': '#1d4ed8',
      '--fibogrid-border': '#e2e8f0',
      '--fibogrid-cell-border-right': '#f1f5f9',
      '--fibogrid-cell-border-bottom': '#f1f5f9',
      '--fibogrid-header-border-bottom': '#cbd5e1',
      '--fibogrid-font-family': '"Inter", -apple-system, sans-serif',
      '--fibogrid-font-size': '14px',
      '--fibogrid-radius-sm': '4px',
      '--fibogrid-radius-md': '6px',
      '--fibogrid-radius-lg': '8px',
    },
  },
  balham: {
    name: 'Balham',
    description: 'Classic corporate blue',
    theme: {
      ...defaultTheme,
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f5f7fa',
      '--fibogrid-surface-hover': '#e9ecef',
      '--fibogrid-surface-selected': '#d0e5ff',
      '--fibogrid-text': '#212529',
      '--fibogrid-text-secondary': '#495057',
      '--fibogrid-primary': '#0066cc',
      '--fibogrid-primary-hover': '#0052a3',
      '--fibogrid-primary-active': '#003d7a',
      '--fibogrid-border': '#dee2e6',
      '--fibogrid-cell-border-right': '#e9ecef',
      '--fibogrid-cell-border-bottom': '#e9ecef',
      '--fibogrid-header-border-bottom': '#adb5bd',
      '--fibogrid-font-family': '"Segoe UI", "Roboto", sans-serif',
      '--fibogrid-font-size': '14px',
      '--fibogrid-radius-sm': '2px',
      '--fibogrid-radius-md': '4px',
      '--fibogrid-radius-lg': '6px',
    },
  },
  quartz: {
    name: 'Quartz',
    description: 'Modern vibrant purple',
    theme: {
      ...defaultTheme,
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#faf5ff',
      '--fibogrid-surface-hover': '#f3e8ff',
      '--fibogrid-surface-selected': '#e9d5ff',
      '--fibogrid-text': '#1e1b4b',
      '--fibogrid-text-secondary': '#5b21b6',
      '--fibogrid-primary': '#8b5cf6',
      '--fibogrid-primary-hover': '#7c3aed',
      '--fibogrid-primary-active': '#6d28d9',
      '--fibogrid-border': '#e9d5ff',
      '--fibogrid-cell-border-right': '#f3e8ff',
      '--fibogrid-cell-border-bottom': '#f3e8ff',
      '--fibogrid-cell-border-selected': '#8b5cf6',
      '--fibogrid-header-border-bottom': '#c084fc',
      '--fibogrid-container-border': '#d8b4fe',
      '--fibogrid-font-family': '"Inter", system-ui, sans-serif',
      '--fibogrid-font-size': '14px',
      '--fibogrid-radius-sm': '6px',
      '--fibogrid-radius-md': '8px',
      '--fibogrid-radius-lg': '12px',
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Professional dark theme',
    theme: {
      ...defaultTheme,
      '--fibogrid-bg': '#1a1a1a',
      '--fibogrid-surface': '#262626',
      '--fibogrid-surface-hover': '#333333',
      '--fibogrid-surface-selected': '#1e3a5f',
      '--fibogrid-text': '#e5e5e5',
      '--fibogrid-text-secondary': '#a3a3a3',
      '--fibogrid-text-muted': '#737373',
      '--fibogrid-text-inverse': '#1a1a1a',
      '--fibogrid-primary': '#3b82f6',
      '--fibogrid-primary-hover': '#2563eb',
      '--fibogrid-primary-active': '#1d4ed8',
      '--fibogrid-primary-text': '#ffffff',
      '--fibogrid-border': '#404040',
      '--fibogrid-border-strong': '#525252',
      '--fibogrid-cell-border-right': '#2a2a2a',
      '--fibogrid-cell-border-bottom': '#2a2a2a',
      '--fibogrid-cell-border-hover': '#3b82f6',
      '--fibogrid-cell-border-selected': '#3b82f6',
      '--fibogrid-row-border-bottom': '#2a2a2a',
      '--fibogrid-header-border-bottom': '#3b82f6',
      '--fibogrid-container-border': '#404040',
      '--fibogrid-font-family': '"Roboto", "Helvetica Neue", sans-serif',
      '--fibogrid-font-size': '14px',
      '--fibogrid-radius-sm': '4px',
      '--fibogrid-radius-md': '6px',
      '--fibogrid-radius-lg': '8px',
    },
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep dark blue',
    theme: {
      ...defaultTheme,
      '--fibogrid-bg': '#0f172a',
      '--fibogrid-surface': '#1e293b',
      '--fibogrid-surface-hover': '#334155',
      '--fibogrid-surface-selected': '#1e3a8a',
      '--fibogrid-text': '#f1f5f9',
      '--fibogrid-text-secondary': '#94a3b8',
      '--fibogrid-text-muted': '#64748b',
      '--fibogrid-primary': '#3b82f6',
      '--fibogrid-primary-hover': '#60a5fa',
      '--fibogrid-primary-active': '#2563eb',
      '--fibogrid-border': '#334155',
      '--fibogrid-cell-border-right': '#1e293b',
      '--fibogrid-cell-border-bottom': '#1e293b',
      '--fibogrid-cell-border-hover': '#3b82f6',
      '--fibogrid-header-border-bottom': '#3b82f6',
      '--fibogrid-container-border': '#475569',
      '--fibogrid-font-family': '"Inter", system-ui, sans-serif',
      '--fibogrid-font-size': '14px',
      '--fibogrid-radius-sm': '6px',
      '--fibogrid-radius-md': '8px',
      '--fibogrid-radius-lg': '12px',
    },
  },
  custom: {
    name: 'Custom',
    description: 'Your custom theme',
    theme: defaultTheme,
  },
  uber: {
    name: 'Uber',
    description: 'Monochromatic black & white professional',
    theme: {
      ...defaultTheme,
      // Background & Surface - Pure white and grays
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f7f7f7',
      '--fibogrid-surface-hover': '#eeeeee',
      '--fibogrid-surface-selected': '#000000',
      '--fibogrid-surface-active': '#1a1a1a',
      
      // Text - Pure black and grays
      '--fibogrid-text': '#000000',
      '--fibogrid-text-secondary': '#666666',
      '--fibogrid-text-muted': '#999999',
      '--fibogrid-text-inverse': '#ffffff',
      
      // Primary - Pure black
      '--fibogrid-primary': '#000000',
      '--fibogrid-primary-hover': '#333333',
      '--fibogrid-primary-active': '#000000',
      '--fibogrid-primary-text': '#ffffff',
      
      // Borders - Light grays
      '--fibogrid-border': '#e0e0e0',
      '--fibogrid-border-strong': '#000000',
      '--fibogrid-border-hover': '#cccccc',
      '--fibogrid-border-light': '#f0f0f0',
      
      // Cell Borders
      '--fibogrid-cell-border-right': '#f0f0f0',
      '--fibogrid-cell-border-bottom': '#f0f0f0',
      '--fibogrid-cell-border-hover': '#cccccc',
      '--fibogrid-cell-border-selected': '#000000',
      '--fibogrid-cell-border-editing': '#000000',
      
      // Row Borders
      '--fibogrid-row-border-bottom': '#f0f0f0',
      '--fibogrid-row-border-bottom-hover': '#e0e0e0',
      '--fibogrid-row-border-bottom-selected': '#000000',
      '--fibogrid-row-border-bottom-group': '#000000',
      
      // Header Borders
      '--fibogrid-header-border-bottom': '#000000',
      '--fibogrid-header-cell-border-right': '#f0f0f0',
      '--fibogrid-header-cell-border-right-hover': '#cccccc',
      '--fibogrid-header-cell-border-right-active': '#000000',
      
      // Container
      '--fibogrid-container-border': '#000000',
      '--fibogrid-container-border-focus': '#000000',
      
      // Typography - Helvetica Neue (Uber's font)
      '--fibogrid-font-family': '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-font-weight-semibold': '600',
      
      // Border Radius - Zero (flat design)
      '--fibogrid-radius-sm': '0px',
      '--fibogrid-radius-md': '0px',
      '--fibogrid-radius-lg': '0px',
      
      // Selection
      '--fibogrid-selection-bg': 'rgba(0, 0, 0, 0.1)',
      '--fibogrid-selection-border': '#000000',
      '--fibogrid-selection-hover': 'rgba(0, 0, 0, 0.15)',
      
      // Header
      '--fibogrid-header-bg': '#f7f7f7',
      '--fibogrid-header-bg-hover': '#eeeeee',
      '--fibogrid-header-text': '#000000',
      '--fibogrid-header-text-secondary': '#666666',
      
      // Row States
      '--fibogrid-row-bg-even': '#ffffff',
      '--fibogrid-row-bg-odd': '#f7f7f7',
      '--fibogrid-row-bg-hover': '#eeeeee',
      '--fibogrid-row-bg-selected': '#000000',
      '--fibogrid-row-bg-selected-hover': '#1a1a1a',
      
      // Buttons
      '--fibogrid-button-bg': 'transparent',
      '--fibogrid-button-bg-hover': '#eeeeee',
      '--fibogrid-button-bg-active': '#000000',
      '--fibogrid-button-text': '#000000',
      '--fibogrid-button-text-hover': '#000000',
      '--fibogrid-button-text-active': '#ffffff',
      '--fibogrid-button-border': '#e0e0e0',
      '--fibogrid-button-border-hover': '#000000',
      '--fibogrid-button-border-active': '#000000',
      
      // Icons
      '--fibogrid-icon-color': '#666666',
      '--fibogrid-icon-color-hover': '#000000',
      '--fibogrid-icon-color-active': '#000000',
      
      // Checkbox
      '--fibogrid-checkbox-bg': '#ffffff',
      '--fibogrid-checkbox-bg-checked': '#000000',
      '--fibogrid-checkbox-border': '#e0e0e0',
      '--fibogrid-checkbox-border-hover': '#000000',
      '--fibogrid-checkbox-border-checked': '#000000',
      '--fibogrid-checkbox-checkmark': '#ffffff',
      
      // Popover
      '--fibogrid-popover-bg': '#ffffff',
      '--fibogrid-popover-border': '#e0e0e0',
      '--fibogrid-popover-item-bg-hover': '#eeeeee',
      '--fibogrid-popover-item-text': '#000000',
    },
  },
  material: {
    name: 'Material UI',
    description: 'Material Design style',
    theme: {
      ...defaultTheme,
      // Background & Surface - Material colors
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f5f5f5',
      '--fibogrid-surface-hover': '#eeeeee',
      '--fibogrid-surface-selected': '#e3f2fd',
      '--fibogrid-surface-active': '#bbdefb',
      
      // Text - Material text colors
      '--fibogrid-text': 'rgba(0, 0, 0, 0.87)',
      '--fibogrid-text-secondary': 'rgba(0, 0, 0, 0.60)',
      '--fibogrid-text-muted': 'rgba(0, 0, 0, 0.38)',
      '--fibogrid-text-inverse': '#ffffff',
      
      // Primary - Material Blue
      '--fibogrid-primary': '#2196f3',
      '--fibogrid-primary-hover': '#1976d2',
      '--fibogrid-primary-active': '#0d47a1',
      '--fibogrid-primary-text': '#ffffff',
      
      // Borders - Material dividers
      '--fibogrid-border': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-border-strong': 'rgba(0, 0, 0, 0.24)',
      '--fibogrid-border-hover': 'rgba(0, 0, 0, 0.20)',
      '--fibogrid-border-light': 'rgba(0, 0, 0, 0.08)',
      
      // Cell Borders
      '--fibogrid-cell-border-right': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-cell-border-bottom': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-cell-border-hover': 'rgba(0, 0, 0, 0.20)',
      '--fibogrid-cell-border-selected': '#2196f3',
      '--fibogrid-cell-border-editing': '#2196f3',
      
      // Row Borders
      '--fibogrid-row-border-bottom': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-row-border-bottom-hover': 'rgba(0, 0, 0, 0.20)',
      '--fibogrid-row-border-bottom-selected': '#2196f3',
      '--fibogrid-row-border-bottom-group': 'rgba(0, 0, 0, 0.24)',
      
      // Header Borders
      '--fibogrid-header-border-bottom': 'rgba(0, 0, 0, 0.24)',
      '--fibogrid-header-cell-border-right': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-header-cell-border-right-hover': 'rgba(0, 0, 0, 0.20)',
      '--fibogrid-header-cell-border-right-active': '#2196f3',
      
      // Container
      '--fibogrid-container-border': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-container-border-focus': '#2196f3',
      
      // Typography - Roboto (Material font)
      '--fibogrid-font-family': '"Roboto", "Helvetica", "Arial", sans-serif',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-font-weight-semibold': '500',
      
      // Border Radius - Material elevation
      '--fibogrid-radius-sm': '4px',
      '--fibogrid-radius-md': '4px',
      '--fibogrid-radius-lg': '4px',
      
      // Selection
      '--fibogrid-selection-bg': 'rgba(33, 150, 243, 0.12)',
      '--fibogrid-selection-border': '#2196f3',
      '--fibogrid-selection-hover': 'rgba(33, 150, 243, 0.16)',
      
      // Header
      '--fibogrid-header-bg': '#f5f5f5',
      '--fibogrid-header-bg-hover': '#eeeeee',
      '--fibogrid-header-text': 'rgba(0, 0, 0, 0.87)',
      '--fibogrid-header-text-secondary': 'rgba(0, 0, 0, 0.60)',
      
      // Row States
      '--fibogrid-row-bg-even': '#ffffff',
      '--fibogrid-row-bg-odd': '#fafafa',
      '--fibogrid-row-bg-hover': '#eeeeee',
      '--fibogrid-row-bg-selected': '#e3f2fd',
      '--fibogrid-row-bg-selected-hover': '#bbdefb',
      
      // Buttons
      '--fibogrid-button-bg': 'transparent',
      '--fibogrid-button-bg-hover': 'rgba(0, 0, 0, 0.04)',
      '--fibogrid-button-bg-active': 'rgba(0, 0, 0, 0.08)',
      '--fibogrid-button-text': 'rgba(0, 0, 0, 0.87)',
      '--fibogrid-button-text-hover': 'rgba(0, 0, 0, 0.87)',
      '--fibogrid-button-text-active': 'rgba(0, 0, 0, 0.87)',
      '--fibogrid-button-border': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-button-border-hover': '#2196f3',
      '--fibogrid-button-border-active': '#2196f3',
      
      // Icons
      '--fibogrid-icon-color': 'rgba(0, 0, 0, 0.54)',
      '--fibogrid-icon-color-hover': '#2196f3',
      '--fibogrid-icon-color-active': '#1976d2',
      
      // Checkbox
      '--fibogrid-checkbox-bg': '#ffffff',
      '--fibogrid-checkbox-bg-checked': '#2196f3',
      '--fibogrid-checkbox-border': 'rgba(0, 0, 0, 0.54)',
      '--fibogrid-checkbox-border-hover': '#2196f3',
      '--fibogrid-checkbox-border-checked': '#2196f3',
      '--fibogrid-checkbox-checkmark': '#ffffff',
      
      // Popover
      '--fibogrid-popover-bg': '#ffffff',
      '--fibogrid-popover-border': 'rgba(0, 0, 0, 0.12)',
      '--fibogrid-popover-item-bg-hover': 'rgba(0, 0, 0, 0.04)',
      '--fibogrid-popover-item-text': 'rgba(0, 0, 0, 0.87)',
      
      // Shadows - Material elevation
      '--fibogrid-shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      '--fibogrid-shadow-md': '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      '--fibogrid-shadow-lg': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    },
  },
  apple: {
    name: 'Apple',
    description: 'Cupertino (iOS) style',
    theme: {
      ...defaultTheme,
      // Background & Surface - iOS colors
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f2f2f7',
      '--fibogrid-surface-hover': '#e5e5ea',
      '--fibogrid-surface-selected': '#d1d1d6',
      '--fibogrid-surface-active': '#c7c7cc',
      
      // Text - iOS text colors
      '--fibogrid-text': '#000000',
      '--fibogrid-text-secondary': '#3c3c43',
      '--fibogrid-text-muted': '#8e8e93',
      '--fibogrid-text-inverse': '#ffffff',
      
      // Primary - iOS Blue
      '--fibogrid-primary': '#007aff',
      '--fibogrid-primary-hover': '#0051d5',
      '--fibogrid-primary-active': '#0040aa',
      '--fibogrid-primary-text': '#ffffff',
      
      // Borders - iOS separators
      '--fibogrid-border': '#c6c6c8',
      '--fibogrid-border-strong': '#a1a1a6',
      '--fibogrid-border-hover': '#8e8e93',
      '--fibogrid-border-light': '#e5e5ea',
      
      // Cell Borders
      '--fibogrid-cell-border-right': '#e5e5ea',
      '--fibogrid-cell-border-bottom': '#e5e5ea',
      '--fibogrid-cell-border-hover': '#c6c6c8',
      '--fibogrid-cell-border-selected': '#007aff',
      '--fibogrid-cell-border-editing': '#007aff',
      
      // Row Borders
      '--fibogrid-row-border-bottom': '#e5e5ea',
      '--fibogrid-row-border-bottom-hover': '#c6c6c8',
      '--fibogrid-row-border-bottom-selected': '#007aff',
      '--fibogrid-row-border-bottom-group': '#a1a1a6',
      
      // Header Borders
      '--fibogrid-header-border-bottom': '#a1a1a6',
      '--fibogrid-header-cell-border-right': '#e5e5ea',
      '--fibogrid-header-cell-border-right-hover': '#c6c6c8',
      '--fibogrid-header-cell-border-right-active': '#007aff',
      
      // Container
      '--fibogrid-container-border': '#c6c6c8',
      '--fibogrid-container-border-focus': '#007aff',
      
      // Typography - San Francisco (iOS font)
      '--fibogrid-font-family': '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-font-weight-semibold': '600',
      
      // Border Radius - iOS rounded corners
      '--fibogrid-radius-sm': '8px',
      '--fibogrid-radius-md': '10px',
      '--fibogrid-radius-lg': '12px',
      
      // Selection
      '--fibogrid-selection-bg': 'rgba(0, 122, 255, 0.1)',
      '--fibogrid-selection-border': '#007aff',
      '--fibogrid-selection-hover': 'rgba(0, 122, 255, 0.15)',
      
      // Header
      '--fibogrid-header-bg': '#f2f2f7',
      '--fibogrid-header-bg-hover': '#e5e5ea',
      '--fibogrid-header-text': '#000000',
      '--fibogrid-header-text-secondary': '#3c3c43',
      
      // Row States
      '--fibogrid-row-bg-even': '#ffffff',
      '--fibogrid-row-bg-odd': '#f2f2f7',
      '--fibogrid-row-bg-hover': '#e5e5ea',
      '--fibogrid-row-bg-selected': '#d1d1d6',
      '--fibogrid-row-bg-selected-hover': '#c7c7cc',
      
      // Buttons
      '--fibogrid-button-bg': 'transparent',
      '--fibogrid-button-bg-hover': '#e5e5ea',
      '--fibogrid-button-bg-active': '#c7c7cc',
      '--fibogrid-button-text': '#007aff',
      '--fibogrid-button-text-hover': '#0051d5',
      '--fibogrid-button-text-active': '#0040aa',
      '--fibogrid-button-border': '#c6c6c8',
      '--fibogrid-button-border-hover': '#007aff',
      '--fibogrid-button-border-active': '#0051d5',
      
      // Icons
      '--fibogrid-icon-color': '#8e8e93',
      '--fibogrid-icon-color-hover': '#007aff',
      '--fibogrid-icon-color-active': '#0051d5',
      
      // Checkbox
      '--fibogrid-checkbox-bg': '#ffffff',
      '--fibogrid-checkbox-bg-checked': '#007aff',
      '--fibogrid-checkbox-border': '#c6c6c8',
      '--fibogrid-checkbox-border-hover': '#007aff',
      '--fibogrid-checkbox-border-checked': '#007aff',
      '--fibogrid-checkbox-checkmark': '#ffffff',
      
      // Popover
      '--fibogrid-popover-bg': '#ffffff',
      '--fibogrid-popover-border': '#c6c6c8',
      '--fibogrid-popover-item-bg-hover': '#e5e5ea',
      '--fibogrid-popover-item-text': '#000000',
      
      // Shadows - iOS blur
      '--fibogrid-shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
      '--fibogrid-shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      '--fibogrid-shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
  },
  excel: {
    name: 'Excel',
    description: 'Microsoft Excel style',
    theme: {
      ...defaultTheme,
      // Background & Surface - Excel colors
      '--fibogrid-bg': '#ffffff',
      '--fibogrid-surface': '#f2f2f2',
      '--fibogrid-surface-hover': '#e7e7e7',
      '--fibogrid-surface-selected': '#d0e7ff',
      '--fibogrid-surface-active': '#b8d9ff',
      
      // Text - Excel text colors
      '--fibogrid-text': '#000000',
      '--fibogrid-text-secondary': '#333333',
      '--fibogrid-text-muted': '#666666',
      '--fibogrid-text-inverse': '#ffffff',
      
      // Primary - Excel Blue
      '--fibogrid-primary': '#0078d4',
      '--fibogrid-primary-hover': '#106ebe',
      '--fibogrid-primary-active': '#005a9e',
      '--fibogrid-primary-text': '#ffffff',
      
      // Borders - Excel grid lines
      '--fibogrid-border': '#d0d0d0',
      '--fibogrid-border-strong': '#a6a6a6',
      '--fibogrid-border-hover': '#8c8c8c',
      '--fibogrid-border-light': '#e5e5e5',
      
      // Cell Borders - Excel grid
      '--fibogrid-cell-border-right': '#d0d0d0',
      '--fibogrid-cell-border-bottom': '#d0d0d0',
      '--fibogrid-cell-border-hover': '#8c8c8c',
      '--fibogrid-cell-border-selected': '#0078d4',
      '--fibogrid-cell-border-editing': '#0078d4',
      
      // Row Borders
      '--fibogrid-row-border-bottom': '#d0d0d0',
      '--fibogrid-row-border-bottom-hover': '#8c8c8c',
      '--fibogrid-row-border-bottom-selected': '#0078d4',
      '--fibogrid-row-border-bottom-group': '#a6a6a6',
      
      // Header Borders
      '--fibogrid-header-border-bottom': '#a6a6a6',
      '--fibogrid-header-cell-border-right': '#d0d0d0',
      '--fibogrid-header-cell-border-right-hover': '#8c8c8c',
      '--fibogrid-header-cell-border-right-active': '#0078d4',
      
      // Container
      '--fibogrid-container-border': '#d0d0d0',
      '--fibogrid-container-border-focus': '#0078d4',
      
      // Typography - Segoe UI (Windows font)
      '--fibogrid-font-family': '"Segoe UI", "Calibri", "Arial", sans-serif',
      '--fibogrid-font-size': '11px',
      '--fibogrid-font-size-sm': '10px',
      '--fibogrid-font-size-lg': '12px',
      '--fibogrid-font-weight-medium': '500',
      '--fibogrid-font-weight-semibold': '600',
      
      // Border Radius - Zero (Excel is flat)
      '--fibogrid-radius-sm': '0px',
      '--fibogrid-radius-md': '0px',
      '--fibogrid-radius-lg': '0px',
      
      // Selection
      '--fibogrid-selection-bg': 'rgba(0, 120, 212, 0.1)',
      '--fibogrid-selection-border': '#0078d4',
      '--fibogrid-selection-hover': 'rgba(0, 120, 212, 0.15)',
      
      // Header
      '--fibogrid-header-bg': '#f2f2f2',
      '--fibogrid-header-bg-hover': '#e7e7e7',
      '--fibogrid-header-text': '#000000',
      '--fibogrid-header-text-secondary': '#333333',
      
      // Row States
      '--fibogrid-row-bg-even': '#ffffff',
      '--fibogrid-row-bg-odd': '#f9f9f9',
      '--fibogrid-row-bg-hover': '#e7e7e7',
      '--fibogrid-row-bg-selected': '#d0e7ff',
      '--fibogrid-row-bg-selected-hover': '#b8d9ff',
      
      // Sizing - Excel compact
      '--fibogrid-header-height': '20px',
      '--fibogrid-row-height': '20px',
      '--fibogrid-cell-padding': '4px',
      
      // Buttons
      '--fibogrid-button-bg': 'transparent',
      '--fibogrid-button-bg-hover': '#e7e7e7',
      '--fibogrid-button-bg-active': '#d0d0d0',
      '--fibogrid-button-text': '#000000',
      '--fibogrid-button-text-hover': '#000000',
      '--fibogrid-button-text-active': '#000000',
      '--fibogrid-button-border': '#d0d0d0',
      '--fibogrid-button-border-hover': '#0078d4',
      '--fibogrid-button-border-active': '#0078d4',
      
      // Icons
      '--fibogrid-icon-color': '#666666',
      '--fibogrid-icon-color-hover': '#0078d4',
      '--fibogrid-icon-color-active': '#005a9e',
      
      // Checkbox
      '--fibogrid-checkbox-bg': '#ffffff',
      '--fibogrid-checkbox-bg-checked': '#0078d4',
      '--fibogrid-checkbox-border': '#d0d0d0',
      '--fibogrid-checkbox-border-hover': '#0078d4',
      '--fibogrid-checkbox-border-checked': '#0078d4',
      '--fibogrid-checkbox-checkmark': '#ffffff',
      
      // Popover
      '--fibogrid-popover-bg': '#ffffff',
      '--fibogrid-popover-border': '#d0d0d0',
      '--fibogrid-popover-item-bg-hover': '#e7e7e7',
      '--fibogrid-popover-item-text': '#000000',
      
      // Shadows - Excel minimal
      '--fibogrid-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
      '--fibogrid-shadow-md': '0 2px 4px rgba(0, 0, 0, 0.1)',
      '--fibogrid-shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
  },
};

