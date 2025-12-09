import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiboGrid, ColumnDef } from 'fibogrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Palette, Copy, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Import the theme presets from the previous implementation
import { themePresets } from './ThemeBuilderPresets';

// Sample data
const sampleData = [
  { id: '1', country: 'Argentina', sport: '🏇 Horse Racing', athlete: 'Andrew Unalkat', total: 66392, year2023: 34090, year2022: 32302 },
  { id: '2', country: 'Portugal', sport: '🏓 Ping Pong', athlete: 'Lucy Connell', total: 28748, year2023: 21697, year2022: 7051 },
  { id: '3', country: 'Argentina', sport: '⛷️ Skiing', athlete: 'Lucy Jett', total: 46362, year2023: 6898, year2022: 39464 },
  { id: '4', country: 'France', sport: '🎳 Bowling', athlete: 'Grace Dallas', total: 18026, year2023: 15968, year2022: 2058 },
  { id: '5', country: 'Germany', sport: '🎯 Darts', athlete: 'Mia Fletcher', total: 68503, year2023: 33622, year2022: 34881 },
  { id: '6', country: 'Germany', sport: '🎾 Tennis', athlete: 'Isabella Black', total: 36078, year2023: 5098, year2022: 30980 },
  { id: '7', country: 'Peru', sport: '🚴 Cycling', athlete: 'Dimple Gunner', total: 53582, year2023: 35580, year2022: 18002 },
  { id: '8', country: 'Sweden', sport: '🏉 Rugby', athlete: 'Ruby Cohen', total: 51049, year2023: 8899, year2022: 42150 },
];

type ThemeValue = typeof themePresets.default.theme;

export default function ThemeBuilder() {
  const [theme, setTheme] = useState<ThemeValue>(themePresets.default.theme);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  const [themeName, setThemeName] = useState('my-custom-theme');
  const [copied, setCopied] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  // Apply theme to preview via style tag AND direct DOM manipulation for inline styles
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      styleRef.current.id = 'theme-builder-preview';
      document.head.appendChild(styleRef.current);
    }
    
    // Apply CSS variables with MAXIMUM specificity to override Tailwind classes
    const css = `/* Theme Builder Preview - Maximum Specificity */
/* Apply variables globally for portals (ColumnPanel, ColumnMenu, etc.) */
body {
${Object.entries(theme)
  .filter(([key]) => key.startsWith('--fibogrid-'))
  .map(([key, value]) => `  ${key}: ${value} !important;`)
  .join('\n')}
}

.fibogrid.theme-builder-preview {
${Object.entries(theme)
  .map(([key, value]) => `  ${key}: ${value} !important;`)
  .join('\n')}
}

/* Force CSS variables on all descendants */
.fibogrid.theme-builder-preview,
.fibogrid.theme-builder-preview *,
.fibogrid.theme-builder-preview *::before,
.fibogrid.theme-builder-preview *::after {
${Object.entries(theme)
  .filter(([key]) => key.startsWith('--fibogrid-'))
  .map(([key, value]) => `  ${key}: ${value} !important;`)
  .join('\n')}
}

/* CRITICAL: Override ALL inline styles with backgroundColor in header area */
.fibogrid.theme-builder-preview [class*="sticky"][class*="top-0"] [style],
.fibogrid.theme-builder-preview [class*="sticky"][class*="top-0"] [style*="backgroundColor"] {
  background-color: var(--fibogrid-header-bg) !important;
}

/* Override Tailwind classes with direct color values */
.fibogrid.theme-builder-preview {
  background-color: var(--fibogrid-bg) !important;
  color: var(--fibogrid-text) !important;
  border-color: var(--fibogrid-container-border) !important;
}

/* Override all Tailwind background classes */
.fibogrid.theme-builder-preview .bg-background,
.fibogrid.theme-builder-preview .bg-muted,
.fibogrid.theme-builder-preview .bg-accent,
.fibogrid.theme-builder-preview [class*="bg-"] {
  background-color: var(--fibogrid-bg) !important;
}

.fibogrid.theme-builder-preview .bg-surface,
.fibogrid.theme-builder-preview .bg-muted\/30,
.fibogrid.theme-builder-preview .bg-muted\/40 {
  background-color: var(--fibogrid-surface) !important;
}

.fibogrid.theme-builder-preview .hover\\:bg-accent\\/50:hover,
.fibogrid.theme-builder-preview .hover\\:bg-muted\\/50:hover {
  background-color: var(--fibogrid-surface-hover) !important;
}

/* Override all Tailwind text classes */
.fibogrid.theme-builder-preview .text-foreground,
.fibogrid.theme-builder-preview .text-muted-foreground,
.fibogrid.theme-builder-preview [class*="text-"] {
  color: var(--fibogrid-text) !important;
}

.fibogrid.theme-builder-preview .text-muted-foreground {
  color: var(--fibogrid-text-secondary) !important;
}

/* Override border classes */
.fibogrid.theme-builder-preview .border-border,
.fibogrid.theme-builder-preview [class*="border-"] {
  border-color: var(--fibogrid-border) !important;
}

/* Override border-top specifically */
.fibogrid.theme-builder-preview .border-t,
.fibogrid.theme-builder-preview [class*="border-t"],
.fibogrid.theme-builder-preview [class*="border-top"] {
  border-top-color: var(--fibogrid-border) !important;
}

/* Override border-top in ColumnPanel buttons */
[class*="ColumnPanel"] [class*="border-t"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="border-t"],
body [class*="ColumnPanel"] [class*="border-t"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="border-t"],
[class*="ColumnPanel"] [class*="border-top"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="border-top"],
body [class*="ColumnPanel"] [class*="border-top"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="border-top"] {
  border-top-color: var(--fibogrid-popover-border) !important;
}

/* Override header - Force override inline styles - HIGHEST PRIORITY */
.fibogrid.theme-builder-preview .fibogrid-header,
.fibogrid.theme-builder-preview [class*="header"],
.fibogrid.theme-builder-preview [class*="Header"],
.fibogrid.theme-builder-preview [class*="flex"][class*="flex-col"][class*="border-b"] {
  background-color: var(--fibogrid-header-bg) !important;
  color: var(--fibogrid-header-text) !important;
  border-color: var(--fibogrid-header-border-bottom) !important;
}

/* CRITICAL: Override ALL elements with inline style backgroundColor */
.fibogrid.theme-builder-preview [style*="backgroundColor"] {
  background-color: var(--fibogrid-header-bg) !important;
}

/* Override header cells - all divs */
.fibogrid.theme-builder-preview [class*="header"] div,
.fibogrid.theme-builder-preview [class*="Header"] div,
.fibogrid.theme-builder-preview [class*="header"] > div,
.fibogrid.theme-builder-preview [class*="Header"] > div {
  background-color: var(--fibogrid-header-bg) !important;
  color: var(--fibogrid-header-text) !important;
}

/* Override header text - ALL elements */
.fibogrid.theme-builder-preview [class*="header"] *,
.fibogrid.theme-builder-preview [class*="Header"] *,
.fibogrid.theme-builder-preview [class*="header"] span,
.fibogrid.theme-builder-preview [class*="Header"] span {
  color: var(--fibogrid-header-text) !important;
}

.fibogrid.theme-builder-preview [class*="header"] .text-muted-foreground,
.fibogrid.theme-builder-preview [class*="Header"] .text-muted-foreground {
  color: var(--fibogrid-header-text-secondary) !important;
}

/* Override filter row */
.fibogrid.theme-builder-preview [class*="filter"],
.fibogrid.theme-builder-preview [class*="Filter"],
.fibogrid.theme-builder-preview [class*="border-t"][class*="border-border"] {
  background-color: var(--fibogrid-filter-row-bg) !important;
  border-color: var(--fibogrid-filter-row-border) !important;
}

/* Override row numbers column - very specific selector */
.fibogrid.theme-builder-preview [style*="width: 50"][style*="minWidth: 50"],
.fibogrid.theme-builder-preview [style*="width: 50px"][style*="minWidth: 50px"] {
  background-color: var(--fibogrid-row-number-bg) !important;
  color: var(--fibogrid-row-number-text) !important;
  border-color: var(--fibogrid-row-number-border) !important;
}

/* Override checkbox column - very specific selector */
.fibogrid.theme-builder-preview [style*="width: 48"][style*="minWidth: 48"],
.fibogrid.theme-builder-preview [style*="width: 48px"][style*="minWidth: 48px"] {
  background-color: var(--fibogrid-checkbox-column-bg) !important;
  border-color: var(--fibogrid-checkbox-column-border) !important;
}

/* Override toolbar */
.fibogrid.theme-builder-preview .fibogrid-toolbar,
.fibogrid.theme-builder-preview [class*="toolbar"] {
  background-color: var(--fibogrid-surface) !important;
  color: var(--fibogrid-text) !important;
  border-color: var(--fibogrid-toolbar-border-bottom) !important;
}

/* Override buttons - CRITICAL */
.fibogrid.theme-builder-preview button,
.fibogrid.theme-builder-preview [class*="Button"],
.fibogrid.theme-builder-preview [role="button"] {
  background-color: var(--fibogrid-button-bg) !important;
  color: var(--fibogrid-button-text) !important;
  border-color: var(--fibogrid-button-border) !important;
  border-top-color: var(--fibogrid-button-border) !important;
  border-right-color: var(--fibogrid-button-border) !important;
  border-bottom-color: var(--fibogrid-button-border) !important;
  border-left-color: var(--fibogrid-button-border) !important;
}

.fibogrid.theme-builder-preview button:hover,
.fibogrid.theme-builder-preview [class*="Button"]:hover,
.fibogrid.theme-builder-preview [role="button"]:hover,
.fibogrid.theme-builder-preview button.hover\\:bg-accent:hover,
.fibogrid.theme-builder-preview button.hover\\:bg-muted:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: var(--fibogrid-button-border-hover) !important;
  border-top-color: var(--fibogrid-button-border-hover) !important;
  border-right-color: var(--fibogrid-button-border-hover) !important;
  border-bottom-color: var(--fibogrid-button-border-hover) !important;
  border-left-color: var(--fibogrid-button-border-hover) !important;
}

.fibogrid.theme-builder-preview button:active,
.fibogrid.theme-builder-preview [class*="Button"]:active,
.fibogrid.theme-builder-preview [role="button"]:active {
  background-color: var(--fibogrid-button-bg-active) !important;
  color: var(--fibogrid-button-text-active) !important;
  border-color: var(--fibogrid-button-border-active) !important;
  border-top-color: var(--fibogrid-button-border-active) !important;
  border-right-color: var(--fibogrid-button-border-active) !important;
  border-bottom-color: var(--fibogrid-button-border-active) !important;
  border-left-color: var(--fibogrid-button-border-active) !important;
}

.fibogrid.theme-builder-preview button:disabled,
.fibogrid.theme-builder-preview [class*="Button"]:disabled,
.fibogrid.theme-builder-preview [role="button"]:disabled {
  background-color: var(--fibogrid-button-bg-disabled) !important;
  color: var(--fibogrid-button-text-disabled) !important;
  border-color: var(--fibogrid-button-border-disabled) !important;
  border-top-color: var(--fibogrid-button-border-disabled) !important;
  border-right-color: var(--fibogrid-button-border-disabled) !important;
  border-bottom-color: var(--fibogrid-button-border-disabled) !important;
  border-left-color: var(--fibogrid-button-border-disabled) !important;
  opacity: 0.5 !important;
}

/* Override button variants */
.fibogrid.theme-builder-preview button[class*="ghost"],
.fibogrid.theme-builder-preview [class*="Button"][class*="ghost"] {
  background-color: transparent !important;
  color: var(--fibogrid-button-text) !important;
  border-color: transparent !important;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  border-left-color: transparent !important;
}

.fibogrid.theme-builder-preview button[class*="ghost"]:hover,
.fibogrid.theme-builder-preview [class*="Button"][class*="ghost"]:hover,
.fibogrid.theme-builder-preview button[class*="ghost"].hover\\:bg-accent:hover,
.fibogrid.theme-builder-preview button[class*="ghost"].hover\\:bg-muted:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: transparent !important;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  border-left-color: transparent !important;
}

.fibogrid.theme-builder-preview button[class*="outline"],
.fibogrid.theme-builder-preview [class*="Button"][class*="outline"] {
  background-color: transparent !important;
  color: var(--fibogrid-button-text) !important;
  border-color: var(--fibogrid-button-border) !important;
  border-top-color: var(--fibogrid-button-border) !important;
  border-right-color: var(--fibogrid-button-border) !important;
  border-bottom-color: var(--fibogrid-button-border) !important;
  border-left-color: var(--fibogrid-button-border) !important;
}

.fibogrid.theme-builder-preview button[class*="outline"]:hover,
.fibogrid.theme-builder-preview [class*="Button"][class*="outline"]:hover,
.fibogrid.theme-builder-preview button[class*="outline"].hover\\:bg-accent:hover,
.fibogrid.theme-builder-preview button[class*="outline"].hover\\:bg-muted:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: var(--fibogrid-button-border-hover) !important;
  border-top-color: var(--fibogrid-button-border-hover) !important;
  border-right-color: var(--fibogrid-button-border-hover) !important;
  border-bottom-color: var(--fibogrid-button-border-hover) !important;
  border-left-color: var(--fibogrid-button-border-hover) !important;
}

/* Override rows */
.fibogrid.theme-builder-preview [class*="row"] {
  background-color: var(--fibogrid-bg) !important;
  color: var(--fibogrid-text) !important;
  border-color: var(--fibogrid-row-border-bottom) !important;
}

/* Override cells */
.fibogrid.theme-builder-preview [class*="cell"] {
  background-color: var(--fibogrid-bg) !important;
  color: var(--fibogrid-text) !important;
  border-color: var(--fibogrid-cell-border-right) !important;
}

/* Override statusbar */
.fibogrid.theme-builder-preview .fibogrid-statusbar,
.fibogrid.theme-builder-preview [class*="statusbar"] {
  background-color: var(--fibogrid-surface) !important;
  color: var(--fibogrid-text-secondary) !important;
  border-color: var(--fibogrid-statusbar-border-top) !important;
}

/* Override row states - even/odd */
.fibogrid.theme-builder-preview [class*="row"]:nth-child(even) {
  background-color: var(--fibogrid-row-bg-even) !important;
}

.fibogrid.theme-builder-preview [class*="row"]:nth-child(odd) {
  background-color: var(--fibogrid-row-bg-odd) !important;
}

.fibogrid.theme-builder-preview [class*="row"]:hover {
  background-color: var(--fibogrid-row-bg-hover) !important;
}

/* Override selected rows - CRITICAL - multiple selectors for Tailwind classes */
.fibogrid.theme-builder-preview [class*="row"][class*="selected"],
.fibogrid.theme-builder-preview [class*="row"].bg-primary\\/10,
.fibogrid.theme-builder-preview [class*="row"][class*="bg-primary"],
.fibogrid.theme-builder-preview [class*="row"][style*="bg-primary"] {
  background-color: var(--fibogrid-row-bg-selected) !important;
}

.fibogrid.theme-builder-preview [class*="row"][class*="selected"]:hover,
.fibogrid.theme-builder-preview [class*="row"].bg-primary\\/10:hover,
.fibogrid.theme-builder-preview [class*="row"].hover\\:bg-primary\\/15:hover {
  background-color: var(--fibogrid-row-bg-selected-hover) !important;
}

/* Override hover:bg-accent/50 and hover:bg-primary/15 */
.fibogrid.theme-builder-preview [class*="row"].hover\\:bg-accent\\/50:hover {
  background-color: var(--fibogrid-row-bg-hover) !important;
}

.fibogrid.theme-builder-preview [class*="row"].hover\\:bg-primary\\/15:hover {
  background-color: var(--fibogrid-row-bg-selected-hover) !important;
}

/* Override filter row */
.fibogrid.theme-builder-preview [class*="filter"],
.fibogrid.theme-builder-preview [class*="Filter"] {
  background-color: var(--fibogrid-filter-row-bg) !important;
  border-color: var(--fibogrid-filter-row-border) !important;
}

.fibogrid.theme-builder-preview [class*="filter"] input,
.fibogrid.theme-builder-preview [class*="Filter"] input {
  background-color: var(--fibogrid-filter-input-bg) !important;
  color: var(--fibogrid-filter-input-text) !important;
  border-color: var(--fibogrid-filter-input-border) !important;
}

.fibogrid.theme-builder-preview [class*="filter"] input:focus,
.fibogrid.theme-builder-preview [class*="Filter"] input:focus {
  background-color: var(--fibogrid-filter-input-bg-focus) !important;
  border-color: var(--fibogrid-filter-input-border-focus) !important;
}

/* Override active filters */
.fibogrid.theme-builder-preview [class*="active-filter"],
.fibogrid.theme-builder-preview [class*="bg-primary/10"] {
  background-color: var(--fibogrid-active-filter-bg) !important;
  color: var(--fibogrid-active-filter-text) !important;
  border-color: var(--fibogrid-active-filter-border) !important;
}

/* Override pagination */
.fibogrid.theme-builder-preview [class*="pagination"],
.fibogrid.theme-builder-preview [class*="Pagination"] {
  background-color: var(--fibogrid-pagination-bg) !important;
  color: var(--fibogrid-pagination-text) !important;
  border-color: var(--fibogrid-pagination-border) !important;
}

.fibogrid.theme-builder-preview [class*="pagination"] button,
.fibogrid.theme-builder-preview [class*="Pagination"] button {
  background-color: var(--fibogrid-pagination-button-bg) !important;
  color: var(--fibogrid-pagination-button-text) !important;
  border-color: var(--fibogrid-pagination-button-border) !important;
}

.fibogrid.theme-builder-preview [class*="pagination"] button:hover,
.fibogrid.theme-builder-preview [class*="Pagination"] button:hover {
  background-color: var(--fibogrid-pagination-button-bg-hover) !important;
}

.fibogrid.theme-builder-preview [class*="pagination"] select,
.fibogrid.theme-builder-preview [class*="Pagination"] select {
  background-color: var(--fibogrid-pagination-select-bg) !important;
  color: var(--fibogrid-pagination-select-text) !important;
  border-color: var(--fibogrid-pagination-select-border) !important;
}

/* Override drag states */
.fibogrid.theme-builder-preview [class*="dragging"],
.fibogrid.theme-builder-preview [class*="opacity-50"] {
  opacity: var(--fibogrid-drag-opacity) !important;
}

.fibogrid.theme-builder-preview [class*="drag-over"],
.fibogrid.theme-builder-preview [class*="bg-primary/20"] {
  background-color: var(--fibogrid-drag-over-bg) !important;
}

/* Override resize handle */
.fibogrid.theme-builder-preview [class*="resize"],
.fibogrid.theme-builder-preview [class*="Resize"] {
  background-color: var(--fibogrid-resize-handle-bg) !important;
}

.fibogrid.theme-builder-preview [class*="resize"]:hover,
.fibogrid.theme-builder-preview [class*="Resize"]:hover {
  background-color: var(--fibogrid-resize-handle-bg-hover) !important;
}

/* Override pinned columns - CRITICAL */
.fibogrid.theme-builder-preview [class*="sticky"][class*="z-"],
.fibogrid.theme-builder-preview [class*="sticky"][style*="left"],
.fibogrid.theme-builder-preview [class*="sticky"][style*="right"] {
  background-color: var(--fibogrid-pinned-header-bg) !important;
}

/* Override pinned header cells */
.fibogrid.theme-builder-preview [class*="header"] [class*="sticky"] {
  background-color: var(--fibogrid-pinned-header-bg) !important;
  color: var(--fibogrid-header-text) !important;
}

/* Override pinned row cells - even/odd */
.fibogrid.theme-builder-preview [class*="row"] [class*="sticky"] {
  background-color: var(--fibogrid-pinned-cell-bg) !important;
}

.fibogrid.theme-builder-preview [class*="row"]:nth-child(even) [class*="sticky"] {
  background-color: var(--fibogrid-pinned-cell-bg-even) !important;
}

.fibogrid.theme-builder-preview [class*="row"]:nth-child(odd) [class*="sticky"] {
  background-color: var(--fibogrid-pinned-cell-bg-odd) !important;
}

.fibogrid.theme-builder-preview [class*="row"]:hover [class*="sticky"] {
  background-color: var(--fibogrid-pinned-cell-bg-hover) !important;
}

.fibogrid.theme-builder-preview [class*="row"][class*="selected"] [class*="sticky"] {
  background-color: var(--fibogrid-pinned-cell-bg-selected) !important;
}

/* Override pinned shadows */
.fibogrid.theme-builder-preview [class*="shadow-"][style*="left"] {
  box-shadow: var(--fibogrid-pinned-shadow-left) !important;
}

.fibogrid.theme-builder-preview [class*="shadow-"][style*="right"] {
  box-shadow: var(--fibogrid-pinned-shadow-right) !important;
}

/* Override popover - HIGH SPECIFICITY */
.fibogrid.theme-builder-preview [class*="popover"],
.fibogrid.theme-builder-preview [class*="Popover"],
.fibogrid.theme-builder-preview [data-radix-popover-content],
.fibogrid.theme-builder-preview [role="dialog"],
body [data-radix-popover-content],
body [role="dialog"] {
  background-color: var(--fibogrid-popover-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  box-shadow: var(--fibogrid-popover-shadow) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override PopoverContent specifically - CRITICAL for Toggle Columns */
[data-radix-popover-content],
body [data-radix-popover-content] {
  background-color: var(--fibogrid-popover-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  box-shadow: var(--fibogrid-popover-shadow) !important;
  color: var(--fibogrid-popover-item-text) !important;
  /* Force shadcn vars inside popover */
  --border: var(--fibogrid-popover-border) !important;
  --muted-foreground: var(--fibogrid-popover-icon-color) !important;
}

/* Override borders in PopoverContent */
[data-radix-popover-content] [class*="border"],
[data-radix-popover-content] [class*="border-b"],
[data-radix-popover-content] [class*="border-t"],
body [data-radix-popover-content] [class*="border"],
body [data-radix-popover-content] [class*="border-b"],
body [data-radix-popover-content] [class*="border-t"] {
  border-color: var(--fibogrid-popover-border) !important;
}

[data-radix-popover-content] [class*="border-b"] {
  border-bottom-color: var(--fibogrid-popover-border) !important;
}

[data-radix-popover-content] [class*="border-t"] {
  border-top-color: var(--fibogrid-popover-border) !important;
}

/* Override icons in PopoverContent - CRITICAL */
[data-radix-popover-content] svg,
[data-radix-popover-content] [class*="lucide"],
[data-radix-popover-content] [class*="text-muted-foreground"],
body [data-radix-popover-content] svg,
body [data-radix-popover-content] [class*="lucide"],
body [data-radix-popover-content] [class*="text-muted-foreground"] {
  color: var(--fibogrid-popover-icon-color) !important;
  fill: none !important;
  stroke: var(--fibogrid-popover-icon-color) !important;
}

[data-radix-popover-content] svg:hover,
[data-radix-popover-content] [class*="lucide"]:hover,
body [data-radix-popover-content] svg:hover,
body [data-radix-popover-content] [class*="lucide"]:hover {
  color: var(--fibogrid-popover-icon-color-hover) !important;
  fill: none !important;
  stroke: var(--fibogrid-popover-icon-color-hover) !important;
}

[data-radix-popover-content] svg:active,
[data-radix-popover-content] [class*="lucide"]:active,
body [data-radix-popover-content] svg:active,
body [data-radix-popover-content] [class*="lucide"]:active {
  color: var(--fibogrid-popover-icon-color-active) !important;
  fill: none !important;
  stroke: var(--fibogrid-popover-icon-color-active) !important;
}

/* Override icons in labels inside PopoverContent */
[data-radix-popover-content] label svg,
[data-radix-popover-content] label [class*="lucide"],
body [data-radix-popover-content] label svg,
body [data-radix-popover-content] label [class*="lucide"] {
  color: var(--fibogrid-popover-icon-color) !important;
  fill: var(--fibogrid-popover-icon-color) !important;
  stroke: var(--fibogrid-popover-icon-color) !important;
}

/* Override hover items in PopoverContent */
[data-radix-popover-content] [class*="hover:bg-muted"],
body [data-radix-popover-content] [class*="hover:bg-muted"] {
  background-color: transparent !important;
}

[data-radix-popover-content] [class*="hover:bg-muted"]:hover,
body [data-radix-popover-content] [class*="hover:bg-muted"]:hover {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text-hover) !important;
}

/* Override buttons in PopoverContent */
[data-radix-popover-content] button,
body [data-radix-popover-content] button {
  background-color: var(--fibogrid-button-bg) !important;
  color: var(--fibogrid-button-text) !important;
  border-color: var(--fibogrid-button-border) !important;
  border-top-color: var(--fibogrid-button-border) !important;
}

[data-radix-popover-content] button:hover,
body [data-radix-popover-content] button:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: var(--fibogrid-button-border-hover) !important;
  border-top-color: var(--fibogrid-button-border-hover) !important;
}

/* Override popover content */
.fibogrid.theme-builder-preview [class*="popover-content"],
.fibogrid.theme-builder-preview [class*="PopoverContent"],
.fibogrid.theme-builder-preview [data-radix-popover-content] > * {
  background-color: var(--fibogrid-popover-bg) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override popover items */
.fibogrid.theme-builder-preview [class*="popover"] [class*="item"],
.fibogrid.theme-builder-preview [class*="Popover"] [class*="item"],
.fibogrid.theme-builder-preview [data-radix-popover-content] button,
.fibogrid.theme-builder-preview [data-radix-popover-content] a,
.fibogrid.theme-builder-preview [role="dialog"] button,
.fibogrid.theme-builder-preview [role="dialog"] a {
  background-color: var(--fibogrid-popover-item-bg) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

.fibogrid.theme-builder-preview [class*="popover"] [class*="item"]:hover,
.fibogrid.theme-builder-preview [class*="Popover"] [class*="item"]:hover,
.fibogrid.theme-builder-preview [data-radix-popover-content] button:hover,
.fibogrid.theme-builder-preview [data-radix-popover-content] a:hover,
.fibogrid.theme-builder-preview [role="dialog"] button:hover,
.fibogrid.theme-builder-preview [role="dialog"] a:hover {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override bg-popover class - CRITICAL for ColumnPanel and ColumnMenu */
/* Apply to all elements with bg-popover, even outside the grid */
.bg-popover,
[class*="bg-popover"],
body .bg-popover,
body [class*="bg-popover"] {
  background-color: var(--fibogrid-popover-bg) !important;
  color: var(--fibogrid-popover-item-text) !important;
  border-color: var(--fibogrid-popover-border) !important;
}

.fibogrid.theme-builder-preview .bg-popover,
.fibogrid.theme-builder-preview [class*="bg-popover"] {
  background-color: var(--fibogrid-popover-bg) !important;
  color: var(--fibogrid-popover-item-text) !important;
  border-color: var(--fibogrid-popover-border) !important;
}

/* Override column menu - DropdownMenu - Apply globally when theme builder is active */
[data-radix-dropdown-menu-content],
[role="menu"],
body [data-radix-dropdown-menu-content],
body [role="menu"] {
  background-color: var(--fibogrid-column-menu-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  box-shadow: var(--fibogrid-popover-shadow) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

.fibogrid.theme-builder-preview [class*="column-menu"],
.fibogrid.theme-builder-preview [class*="ColumnMenu"],
.fibogrid.theme-builder-preview [data-radix-dropdown-menu-content],
.fibogrid.theme-builder-preview [role="menu"] {
  background-color: var(--fibogrid-column-menu-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  box-shadow: var(--fibogrid-popover-shadow) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override DropdownMenuContent and SubContent - Apply globally */
[class*="DropdownMenuContent"],
[class*="DropdownMenuSubContent"],
body [class*="DropdownMenuContent"],
body [class*="DropdownMenuSubContent"] {
  background-color: var(--fibogrid-column-menu-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

.fibogrid.theme-builder-preview [class*="DropdownMenuContent"],
.fibogrid.theme-builder-preview [class*="DropdownMenuSubContent"] {
  background-color: var(--fibogrid-column-menu-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override DropdownMenuItem - Apply globally */
[class*="DropdownMenuItem"],
[role="menuitem"],
body [class*="DropdownMenuItem"],
body [role="menuitem"] {
  background-color: transparent !important;
  color: var(--fibogrid-popover-item-text) !important;
}

[class*="DropdownMenuItem"]:hover,
[role="menuitem"]:hover,
[class*="DropdownMenuItem"]:focus,
[role="menuitem"]:focus,
body [class*="DropdownMenuItem"]:hover,
body [role="menuitem"]:hover {
  background-color: var(--fibogrid-column-menu-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

.fibogrid.theme-builder-preview [class*="DropdownMenuItem"],
.fibogrid.theme-builder-preview [role="menuitem"] {
  background-color: transparent !important;
  color: var(--fibogrid-popover-item-text) !important;
}

.fibogrid.theme-builder-preview [class*="DropdownMenuItem"]:hover,
.fibogrid.theme-builder-preview [role="menuitem"]:hover,
.fibogrid.theme-builder-preview [class*="DropdownMenuItem"]:focus,
.fibogrid.theme-builder-preview [role="menuitem"]:focus {
  background-color: var(--fibogrid-column-menu-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override ColumnPanel (fixed panel) - Apply globally */
[class*="ColumnPanel"],
[class*="fixed"][class*="right-0"][class*="w-72"],
body [class*="ColumnPanel"],
body [class*="fixed"][class*="right-0"][class*="w-72"] {
  background-color: var(--fibogrid-popover-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

/* Override Checkbox inside ColumnPanel - Radix UI */
[class*="ColumnPanel"] [data-radix-checkbox-root],
[class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-checkbox-root],
body [class*="ColumnPanel"] [data-radix-checkbox-root],
body [class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-checkbox-root] {
  background-color: var(--fibogrid-checkbox-bg) !important;
  border-color: var(--fibogrid-checkbox-border) !important;
}

[class*="ColumnPanel"] [data-radix-checkbox-root][data-state="checked"],
[class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-checkbox-root][data-state="checked"],
body [class*="ColumnPanel"] [data-radix-checkbox-root][data-state="checked"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-checkbox-root][data-state="checked"] {
  background-color: var(--fibogrid-checkbox-bg-checked) !important;
  border-color: var(--fibogrid-checkbox-border-checked) !important;
  color: var(--fibogrid-checkbox-checkmark) !important;
}

[class*="ColumnPanel"] [data-radix-checkbox-root] [data-radix-checkbox-indicator],
[class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-checkbox-root] [data-radix-checkbox-indicator],
body [class*="ColumnPanel"] [data-radix-checkbox-root] [data-radix-checkbox-indicator],
body [class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-checkbox-root] [data-radix-checkbox-indicator] {
  color: var(--fibogrid-checkbox-checkmark) !important;
}

/* Override Button inside ColumnPanel */
[class*="ColumnPanel"] button,
[class*="fixed"][class*="right-0"][class*="w-72"] button,
body [class*="ColumnPanel"] button,
body [class*="fixed"][class*="right-0"][class*="w-72"] button {
  background-color: var(--fibogrid-button-bg) !important;
  color: var(--fibogrid-button-text) !important;
  border-color: var(--fibogrid-button-border) !important;
  border-top-color: var(--fibogrid-button-border) !important;
  border-right-color: var(--fibogrid-button-border) !important;
  border-bottom-color: var(--fibogrid-button-border) !important;
  border-left-color: var(--fibogrid-button-border) !important;
}

[class*="ColumnPanel"] button:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] button:hover,
body [class*="ColumnPanel"] button:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] button:hover,
[class*="ColumnPanel"] button.hover\\:bg-accent:hover,
[class*="ColumnPanel"] button.hover\\:bg-muted:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] button.hover\\:bg-accent:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] button.hover\\:bg-muted:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: var(--fibogrid-button-border-hover) !important;
  border-top-color: var(--fibogrid-button-border-hover) !important;
  border-right-color: var(--fibogrid-button-border-hover) !important;
  border-bottom-color: var(--fibogrid-button-border-hover) !important;
  border-left-color: var(--fibogrid-button-border-hover) !important;
}

/* Override Button variants inside ColumnPanel */
[class*="ColumnPanel"] button[class*="outline"],
[class*="fixed"][class*="right-0"][class*="w-72"] button[class*="outline"],
body [class*="ColumnPanel"] button[class*="outline"],
body [class*="fixed"][class*="right-0"][class*="w-72"] button[class*="outline"] {
  background-color: transparent !important;
  color: var(--fibogrid-button-text) !important;
  border-color: var(--fibogrid-button-border) !important;
}

[class*="ColumnPanel"] button[class*="outline"]:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] button[class*="outline"]:hover,
body [class*="ColumnPanel"] button[class*="outline"]:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] button[class*="outline"]:hover,
[class*="ColumnPanel"] button[class*="outline"].hover\\:bg-accent:hover,
[class*="ColumnPanel"] button[class*="outline"].hover\\:bg-muted:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: var(--fibogrid-button-border-hover) !important;
  border-top-color: var(--fibogrid-button-border-hover) !important;
  border-right-color: var(--fibogrid-button-border-hover) !important;
  border-bottom-color: var(--fibogrid-button-border-hover) !important;
  border-left-color: var(--fibogrid-button-border-hover) !important;
}

[class*="ColumnPanel"] button[class*="ghost"],
[class*="fixed"][class*="right-0"][class*="w-72"] button[class*="ghost"],
body [class*="ColumnPanel"] button[class*="ghost"],
body [class*="fixed"][class*="right-0"][class*="w-72"] button[class*="ghost"] {
  background-color: transparent !important;
  color: var(--fibogrid-button-text) !important;
  border-color: transparent !important;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  border-left-color: transparent !important;
}

[class*="ColumnPanel"] button[class*="ghost"]:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] button[class*="ghost"]:hover,
body [class*="ColumnPanel"] button[class*="ghost"]:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] button[class*="ghost"]:hover,
[class*="ColumnPanel"] button[class*="ghost"].hover\\:bg-accent:hover,
[class*="ColumnPanel"] button[class*="ghost"].hover\\:bg-muted:hover {
  background-color: var(--fibogrid-button-bg-hover) !important;
  color: var(--fibogrid-button-text-hover) !important;
  border-color: transparent !important;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  border-left-color: transparent !important;
}

/* Override Tailwind classes inside ColumnPanel */
[class*="ColumnPanel"] .bg-primary,
[class*="fixed"][class*="right-0"][class*="w-72"] .bg-primary,
body [class*="ColumnPanel"] .bg-primary,
body [class*="fixed"][class*="right-0"][class*="w-72"] .bg-primary {
  background-color: var(--fibogrid-primary) !important;
}

[class*="ColumnPanel"] .text-primary,
[class*="fixed"][class*="right-0"][class*="w-72"] .text-primary,
body [class*="ColumnPanel"] .text-primary,
body [class*="fixed"][class*="right-0"][class*="w-72"] .text-primary {
  color: var(--fibogrid-primary) !important;
}

[class*="ColumnPanel"] .border-primary,
[class*="fixed"][class*="right-0"][class*="w-72"] .border-primary,
body [class*="ColumnPanel"] .border-primary,
body [class*="fixed"][class*="right-0"][class*="w-72"] .border-primary {
  border-color: var(--fibogrid-primary) !important;
}

[class*="ColumnPanel"] .bg-accent,
[class*="fixed"][class*="right-0"][class*="w-72"] .bg-accent,
body [class*="ColumnPanel"] .bg-accent,
body [class*="fixed"][class*="right-0"][class*="w-72"] .bg-accent {
  background-color: var(--fibogrid-surface-hover) !important;
}

[class*="ColumnPanel"] .text-accent-foreground,
[class*="fixed"][class*="right-0"][class*="w-72"] .text-accent-foreground,
body [class*="ColumnPanel"] .text-accent-foreground,
body [class*="fixed"][class*="right-0"][class*="w-72"] .text-accent-foreground {
  color: var(--fibogrid-text) !important;
}

[class*="ColumnPanel"] .border-input,
[class*="fixed"][class*="right-0"][class*="w-72"] .border-input,
body [class*="ColumnPanel"] .border-input,
body [class*="fixed"][class*="right-0"][class*="w-72"] .border-input {
  border-color: var(--fibogrid-input-border) !important;
}

[class*="ColumnPanel"] .bg-background,
[class*="fixed"][class*="right-0"][class*="w-72"] .bg-background,
body [class*="ColumnPanel"] .bg-background,
body [class*="fixed"][class*="right-0"][class*="w-72"] .bg-background {
  background-color: var(--fibogrid-bg) !important;
}

/* Override Popover Input (Search) - CRITICAL */
[class*="ColumnPanel"] input,
[class*="fixed"][class*="right-0"][class*="w-72"] input,
body [class*="ColumnPanel"] input,
body [class*="fixed"][class*="right-0"][class*="w-72"] input {
  background-color: var(--fibogrid-popover-input-bg) !important;
  color: var(--fibogrid-popover-input-text) !important;
  border-color: var(--fibogrid-popover-input-border) !important;
}

[class*="ColumnPanel"] input:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] input:hover,
body [class*="ColumnPanel"] input:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] input:hover {
  background-color: var(--fibogrid-popover-input-bg-hover) !important;
  border-color: var(--fibogrid-popover-input-border-hover) !important;
}

[class*="ColumnPanel"] input:focus,
[class*="ColumnPanel"] input:focus-visible,
[class*="fixed"][class*="right-0"][class*="w-72"] input:focus,
[class*="fixed"][class*="right-0"][class*="w-72"] input:focus-visible,
body [class*="ColumnPanel"] input:focus,
body [class*="ColumnPanel"] input:focus-visible,
body [class*="fixed"][class*="right-0"][class*="w-72"] input:focus,
body [class*="fixed"][class*="right-0"][class*="w-72"] input:focus-visible {
  background-color: var(--fibogrid-popover-input-bg-focus) !important;
  border-color: var(--fibogrid-popover-input-border-focus) !important;
  outline: none !important;
  box-shadow: 0 0 0 var(--fibogrid-popover-input-ring-offset) var(--fibogrid-popover-bg), 0 0 0 calc(var(--fibogrid-popover-input-ring-offset) + var(--fibogrid-popover-input-ring-width)) var(--fibogrid-popover-input-ring-color) !important;
}

[class*="ColumnPanel"] input::placeholder,
[class*="fixed"][class*="right-0"][class*="w-72"] input::placeholder,
body [class*="ColumnPanel"] input::placeholder,
body [class*="fixed"][class*="right-0"][class*="w-72"] input::placeholder {
  color: var(--fibogrid-popover-input-text-placeholder) !important;
}

/* Override Popover Items - hover, focus, active, drag-over - CRITICAL */
/* Override ALL hover states in ColumnPanel */
[class*="ColumnPanel"] [class*="hover:bg-muted"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="hover:bg-muted"],
body [class*="ColumnPanel"] [class*="hover:bg-muted"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="hover:bg-muted"],
[class*="ColumnPanel"] div[class*="hover:bg-muted"],
[class*="fixed"][class*="right-0"][class*="w-72"] div[class*="hover:bg-muted"] {
  background-color: transparent !important;
}

/* CRITICAL: Override hover state with MAXIMUM specificity */
[class*="ColumnPanel"] [class*="hover:bg-muted"]:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="hover:bg-muted"]:hover,
body [class*="ColumnPanel"] [class*="hover:bg-muted"]:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="hover:bg-muted"]:hover,
[class*="ColumnPanel"] div[class*="hover:bg-muted"]:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] div[class*="hover:bg-muted"]:hover,
[class*="ColumnPanel"] div:hover[class*="hover:bg-muted"],
[class*="fixed"][class*="right-0"][class*="w-72"] div:hover[class*="hover:bg-muted"] {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text-hover) !important;
}

/* Override bg-muted class directly on hover */
[class*="ColumnPanel"] .bg-muted:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] .bg-muted:hover,
body [class*="ColumnPanel"] .bg-muted:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] .bg-muted:hover {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text-hover) !important;
}

/* Override any element with hover:bg-muted class when hovered */
[class*="ColumnPanel"] *:hover[class*="hover:bg-muted"],
[class*="fixed"][class*="right-0"][class*="w-72"] *:hover[class*="hover:bg-muted"],
body [class*="ColumnPanel"] *:hover[class*="hover:bg-muted"],
body [class*="fixed"][class*="right-0"][class*="w-72"] *:hover[class*="hover:bg-muted"] {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
  color: var(--fibogrid-popover-item-text-hover) !important;
}

[class*="ColumnPanel"] [class*="hover:bg-muted"]:focus,
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="hover:bg-muted"]:focus,
body [class*="ColumnPanel"] [class*="hover:bg-muted"]:focus,
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="hover:bg-muted"]:focus {
  background-color: var(--fibogrid-popover-item-bg-focus) !important;
  color: var(--fibogrid-popover-item-text-focus) !important;
  border-color: var(--fibogrid-popover-item-border-focus) !important;
  outline: 2px solid var(--fibogrid-popover-item-border-focus) !important;
  outline-offset: 2px !important;
}

[class*="ColumnPanel"] [class*="bg-primary/10"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="bg-primary/10"],
body [class*="ColumnPanel"] [class*="bg-primary/10"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="bg-primary/10"] {
  background-color: var(--fibogrid-popover-item-bg-drag-over) !important;
}

[class*="ColumnPanel"] [class*="opacity-50"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="opacity-50"],
body [class*="ColumnPanel"] [class*="opacity-50"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="opacity-50"] {
  opacity: var(--fibogrid-popover-item-opacity-dragging) !important;
}

/* Override Popover Icons - CRITICAL */
[class*="ColumnPanel"] [class*="text-muted-foreground"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="text-muted-foreground"],
body [class*="ColumnPanel"] [class*="text-muted-foreground"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="text-muted-foreground"],
[class*="ColumnPanel"] svg,
[class*="fixed"][class*="right-0"][class*="w-72"] svg,
body [class*="ColumnPanel"] svg,
body [class*="fixed"][class*="right-0"][class*="w-72"] svg,
[class*="ColumnPanel"] [class*="lucide"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="lucide"],
body [class*="ColumnPanel"] [class*="lucide"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="lucide"] {
  color: var(--fibogrid-popover-icon-color) !important;
  fill: var(--fibogrid-popover-icon-color) !important;
  stroke: var(--fibogrid-popover-icon-color) !important;
}

[class*="ColumnPanel"] [class*="opacity-0"][class*="group-hover:opacity-100"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="opacity-0"][class*="group-hover:opacity-100"],
body [class*="ColumnPanel"] [class*="opacity-0"][class*="group-hover:opacity-100"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="opacity-0"][class*="group-hover:opacity-100"] {
  opacity: var(--fibogrid-popover-icon-opacity-default) !important;
}

[class*="ColumnPanel"] [class*="group"]:hover [class*="opacity-0"][class*="group-hover:opacity-100"],
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="group"]:hover [class*="opacity-0"][class*="group-hover:opacity-100"],
body [class*="ColumnPanel"] [class*="group"]:hover [class*="opacity-0"][class*="group-hover:opacity-100"],
body [class*="fixed"][class*="right-0"][class*="w-72"] [class*="group"]:hover [class*="opacity-0"][class*="group-hover:opacity-100"],
[class*="ColumnPanel"] [class*="group"]:hover svg,
[class*="fixed"][class*="right-0"][class*="w-72"] [class*="group"]:hover svg {
  opacity: var(--fibogrid-popover-icon-opacity-hover) !important;
  color: var(--fibogrid-popover-icon-color-hover) !important;
  fill: var(--fibogrid-popover-icon-color-hover) !important;
  stroke: var(--fibogrid-popover-icon-color-hover) !important;
}

/* Override icons in buttons */
[class*="ColumnPanel"] button svg,
[class*="fixed"][class*="right-0"][class*="w-72"] button svg,
body [class*="ColumnPanel"] button svg,
body [class*="fixed"][class*="right-0"][class*="w-72"] button svg {
  color: var(--fibogrid-button-text) !important;
  fill: var(--fibogrid-button-text) !important;
  stroke: var(--fibogrid-button-text) !important;
}

[class*="ColumnPanel"] button:hover svg,
[class*="fixed"][class*="right-0"][class*="w-72"] button:hover svg,
body [class*="ColumnPanel"] button:hover svg,
body [class*="fixed"][class*="right-0"][class*="w-72"] button:hover svg {
  color: var(--fibogrid-button-text-hover) !important;
  fill: var(--fibogrid-button-text-hover) !important;
  stroke: var(--fibogrid-button-text-hover) !important;
}

/* Override Popover Scrollbar */
[class*="ColumnPanel"] [data-radix-scroll-area-thumb],
[class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-scroll-area-thumb],
body [class*="ColumnPanel"] [data-radix-scroll-area-thumb],
body [class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-scroll-area-thumb] {
  background-color: var(--fibogrid-popover-scrollbar-thumb-bg) !important;
}

[class*="ColumnPanel"] [data-radix-scroll-area-thumb]:hover,
[class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-scroll-area-thumb]:hover,
body [class*="ColumnPanel"] [data-radix-scroll-area-thumb]:hover,
body [class*="fixed"][class*="right-0"][class*="w-72"] [data-radix-scroll-area-thumb]:hover {
  background-color: var(--fibogrid-popover-scrollbar-thumb-bg-hover) !important;
}

.fibogrid.theme-builder-preview [class*="ColumnPanel"],
.fibogrid.theme-builder-preview [class*="fixed"][class*="right-0"] {
  background-color: var(--fibogrid-popover-bg) !important;
  border-color: var(--fibogrid-popover-border) !important;
  color: var(--fibogrid-popover-item-text) !important;
}

[class*="ColumnPanel"] [class*="hover:bg-muted"],
[class*="fixed"][class*="right-0"] [class*="hover:bg-muted"],
body [class*="ColumnPanel"] [class*="hover:bg-muted"],
body [class*="fixed"][class*="right-0"] [class*="hover:bg-muted"] {
  background-color: transparent !important;
}

[class*="ColumnPanel"] [class*="hover:bg-muted"]:hover,
[class*="fixed"][class*="right-0"] [class*="hover:bg-muted"]:hover,
body [class*="ColumnPanel"] [class*="hover:bg-muted"]:hover,
body [class*="fixed"][class*="right-0"] [class*="hover:bg-muted"]:hover {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
}

.fibogrid.theme-builder-preview [class*="ColumnPanel"] [class*="hover:bg-muted"],
.fibogrid.theme-builder-preview [class*="fixed"][class*="right-0"] [class*="hover:bg-muted"] {
  background-color: transparent !important;
}

.fibogrid.theme-builder-preview [class*="ColumnPanel"] [class*="hover:bg-muted"]:hover,
.fibogrid.theme-builder-preview [class*="fixed"][class*="right-0"] [class*="hover:bg-muted"]:hover {
  background-color: var(--fibogrid-popover-item-bg-hover) !important;
}

/* Override checkbox column - CRITICAL */
.fibogrid.theme-builder-preview [style*="width: 48"][style*="minWidth: 48"],
.fibogrid.theme-builder-preview [style*="width: 48px"][style*="minWidth: 48px"] {
  background-color: var(--fibogrid-checkbox-column-bg) !important;
  border-color: var(--fibogrid-checkbox-column-border) !important;
  color: var(--fibogrid-text) !important;
}

/* Override checkbox column in header specifically */
.fibogrid.theme-builder-preview [class*="header"] [style*="width: 48"] {
  background-color: var(--fibogrid-checkbox-column-bg) !important;
}

/* Override checkbox column in rows - even/odd/selected */
.fibogrid.theme-builder-preview [class*="row"]:nth-child(even) [style*="width: 48"] {
  background-color: var(--fibogrid-checkbox-column-bg) !important;
}

.fibogrid.theme-builder-preview [class*="row"]:nth-child(odd) [style*="width: 48"] {
  background-color: var(--fibogrid-checkbox-column-bg) !important;
}

.fibogrid.theme-builder-preview [class*="row"][class*="selected"] [style*="width: 48"],
.fibogrid.theme-builder-preview [class*="row"].bg-primary\\/10 [style*="width: 48"] {
  background-color: var(--fibogrid-checkbox-column-bg) !important;
}

/* Override checkboxes - CRITICAL */
.fibogrid.theme-builder-preview input[type="checkbox"],
.fibogrid.theme-builder-preview input[type="checkbox"]:checked {
  background-color: var(--fibogrid-checkbox-bg) !important;
  border-color: var(--fibogrid-checkbox-border) !important;
  accent-color: var(--fibogrid-checkbox-bg-checked) !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:checked {
  background-color: var(--fibogrid-checkbox-bg-checked) !important;
  border-color: var(--fibogrid-checkbox-border-checked) !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:hover {
  background-color: var(--fibogrid-checkbox-bg-hover) !important;
  border-color: var(--fibogrid-checkbox-border-hover) !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:checked::after {
  color: var(--fibogrid-checkbox-checkmark) !important;
}

/* Override checkbox using appearance */
.fibogrid.theme-builder-preview input[type="checkbox"] {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: var(--fibogrid-checkbox-size, 16px) !important;
  height: var(--fibogrid-checkbox-size, 16px) !important;
  border: 1px solid var(--fibogrid-checkbox-border) !important;
  border-radius: 4px !important;
  background-color: var(--fibogrid-checkbox-bg) !important;
  position: relative !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:checked {
  background-color: var(--fibogrid-checkbox-bg-checked) !important;
  border-color: var(--fibogrid-checkbox-border-checked) !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:checked::before {
  content: '✓' !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  color: var(--fibogrid-checkbox-checkmark) !important;
  font-size: 12px !important;
  font-weight: bold !important;
  line-height: 1 !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:indeterminate {
  background-color: var(--fibogrid-checkbox-bg-checked) !important;
  border-color: var(--fibogrid-checkbox-border-checked) !important;
}

.fibogrid.theme-builder-preview input[type="checkbox"]:indeterminate::before {
  content: '−' !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  color: var(--fibogrid-checkbox-checkmark) !important;
  font-size: 14px !important;
  font-weight: bold !important;
  line-height: 1 !important;
}

/* Override inputs */
.fibogrid.theme-builder-preview input,
.fibogrid.theme-builder-preview textarea,
.fibogrid.theme-builder-preview select {
  background-color: var(--fibogrid-input-bg) !important;
  color: var(--fibogrid-input-text) !important;
  border-color: var(--fibogrid-input-border) !important;
}

.fibogrid.theme-builder-preview input::placeholder {
  color: var(--fibogrid-input-text-placeholder) !important;
}

/* Override buttons */
.fibogrid.theme-builder-preview button {
  background-color: var(--fibogrid-button-bg) !important;
  color: var(--fibogrid-button-text) !important;
  border-color: var(--fibogrid-button-border) !important;
}

/* Override icons */
.fibogrid.theme-builder-preview svg,
.fibogrid.theme-builder-preview [class*="icon"] {
  color: var(--fibogrid-icon-color) !important;
  fill: var(--fibogrid-icon-color) !important;
}`;
    
    styleRef.current.textContent = css;
    
    // Also directly modify inline styles via DOM (for elements with style="backgroundColor: hsl(var(--muted))")
    // Use MutationObserver to watch for dynamically added elements (like ColumnPanel)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            // Check if it's ColumnPanel or contains checkboxes/buttons
            if (element.classList.contains('bg-popover') || 
                element.querySelector('[data-radix-checkbox-root]') ||
                element.querySelector('button') ||
                element.closest('[class*="fixed"][class*="right-0"]')) {
              applyThemeToElement(element);
            }
          }
        });
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Function to apply theme to an element and its children
    const applyThemeToElement = (element: HTMLElement) => {
      // Apply to checkboxes
      const checkboxes = element.querySelectorAll('[data-radix-checkbox-root]');
      checkboxes.forEach((checkbox) => {
        const checkboxEl = checkbox as HTMLElement;
        const isChecked = checkboxEl.getAttribute('data-state') === 'checked';
        checkboxEl.style.setProperty('background-color', isChecked ? theme['--fibogrid-checkbox-bg-checked'] : theme['--fibogrid-checkbox-bg'], 'important');
        checkboxEl.style.setProperty('border-color', isChecked ? theme['--fibogrid-checkbox-border-checked'] : theme['--fibogrid-checkbox-border'], 'important');
        
        const indicator = checkboxEl.querySelector('[data-radix-checkbox-indicator]');
        if (indicator) {
          (indicator as HTMLElement).style.setProperty('color', theme['--fibogrid-checkbox-checkmark'], 'important');
        }
      });
      
      // Apply to buttons
      const buttons = element.querySelectorAll('button');
      buttons.forEach((button) => {
        const buttonEl = button as HTMLElement;
        if (!buttonEl.disabled) {
          buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
          buttonEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
          buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
          buttonEl.style.setProperty('border-top-color', theme['--fibogrid-button-border'], 'important');
          buttonEl.style.setProperty('border-right-color', theme['--fibogrid-button-border'], 'important');
          buttonEl.style.setProperty('border-bottom-color', theme['--fibogrid-button-border'], 'important');
          buttonEl.style.setProperty('border-left-color', theme['--fibogrid-button-border'], 'important');
          
          // Add hover event listener to force override
          const handleMouseEnter = () => {
            buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg-hover'], 'important');
            buttonEl.style.setProperty('color', theme['--fibogrid-button-text-hover'], 'important');
            buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border-hover'], 'important');
          };
          const handleMouseLeave = () => {
            buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
            buttonEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
            buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
          };
          buttonEl.addEventListener('mouseenter', handleMouseEnter, true);
          buttonEl.addEventListener('mouseleave', handleMouseLeave, true);
        }
      });
      
      // Apply to icons
      const icons = element.querySelectorAll('svg, [class*="lucide"]');
      icons.forEach((icon) => {
        const iconEl = icon as HTMLElement;
        iconEl.style.setProperty('color', theme['--fibogrid-popover-icon-color'], 'important');
        iconEl.style.setProperty('fill', theme['--fibogrid-popover-icon-color'], 'important');
        iconEl.style.setProperty('stroke', theme['--fibogrid-popover-icon-color'], 'important');

        const handleMouseDown = () => {
          iconEl.style.setProperty('color', theme['--fibogrid-popover-icon-color-active'], 'important');
          iconEl.style.setProperty('fill', theme['--fibogrid-popover-icon-color-active'], 'important');
          iconEl.style.setProperty('stroke', theme['--fibogrid-popover-icon-color-active'], 'important');
        };
        const handleMouseUp = () => {
          iconEl.style.setProperty('color', theme['--fibogrid-popover-icon-color'], 'important');
          iconEl.style.setProperty('fill', theme['--fibogrid-popover-icon-color'], 'important');
          iconEl.style.setProperty('stroke', theme['--fibogrid-popover-icon-color'], 'important');
        };
        iconEl.addEventListener('mousedown', handleMouseDown, true);
        iconEl.addEventListener('mouseup', handleMouseUp, true);
      });

      // Apply hover to items with hover:bg-muted class
      const hoverItems = element.querySelectorAll('[class*="hover:bg-muted"]');
      hoverItems.forEach((item) => {
        const itemEl = item as HTMLElement;
        const handleMouseEnter = () => {
          itemEl.style.setProperty('background-color', theme['--fibogrid-popover-item-bg-hover'], 'important');
          itemEl.style.setProperty('color', theme['--fibogrid-popover-item-text-hover'], 'important');
        };
        const handleMouseLeave = () => {
          itemEl.style.setProperty('background-color', 'transparent', 'important');
          itemEl.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
        };
        itemEl.addEventListener('mouseenter', handleMouseEnter, true);
        itemEl.addEventListener('mouseleave', handleMouseLeave, true);
      });
      
      // Apply to bg-popover
      if (element.classList.contains('bg-popover')) {
        element.style.setProperty('background-color', theme['--fibogrid-popover-bg'], 'important');
        element.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
        element.style.setProperty('border-color', theme['--fibogrid-popover-border'], 'important');
      }
    };
    
    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const gridElement = document.querySelector('.fibogrid.theme-builder-preview');
      if (gridElement) {
        // Find all elements with inline backgroundColor styles and override them
        const elementsWithInlineBg = gridElement.querySelectorAll('[style*="backgroundColor"]');
        elementsWithInlineBg.forEach((el) => {
          const htmlEl = el as HTMLElement;
          // Check if it's in header area
          if (htmlEl.closest('[class*="header"]') || htmlEl.closest('[class*="sticky"]') || htmlEl.closest('[class*="flex-col"]')) {
            htmlEl.style.setProperty('background-color', theme['--fibogrid-header-bg'], 'important');
            htmlEl.style.setProperty('color', theme['--fibogrid-header-text'], 'important');
          }
        });
        
        // Override header container specifically
        const headerContainer = gridElement.querySelector('[class*="flex"][class*="flex-col"][class*="border-b"]');
        if (headerContainer) {
          const headerEl = headerContainer as HTMLElement;
          headerEl.style.setProperty('background-color', theme['--fibogrid-header-bg'], 'important');
          headerEl.style.setProperty('color', theme['--fibogrid-header-text'], 'important');
          headerEl.style.setProperty('border-color', theme['--fibogrid-header-border-bottom'], 'important');
        }
        
        // Override all header cells - be very specific
        const headerCells = gridElement.querySelectorAll('[class*="header"] > div, [class*="header"] div, [class*="sticky"] > div');
        headerCells.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.backgroundColor) {
            // Check if it's pinned
            if (htmlEl.classList.contains('sticky')) {
              htmlEl.style.setProperty('background-color', theme['--fibogrid-pinned-header-bg'], 'important');
            } else {
              htmlEl.style.setProperty('background-color', theme['--fibogrid-header-bg'], 'important');
            }
            htmlEl.style.setProperty('color', theme['--fibogrid-header-text'], 'important');
          }
        });
        
        // Override pinned cells in rows
        const pinnedCells = gridElement.querySelectorAll('[class*="row"] [class*="sticky"]');
        pinnedCells.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const row = htmlEl.closest('[class*="row"]');
          if (row) {
            const isEven = Array.from(row.parentElement?.children || []).indexOf(row) % 2 === 0;
            const isSelected = row.classList.contains('fibogrid-row-selected') || row.classList.contains('selected');
            if (isSelected) {
              htmlEl.style.setProperty('background-color', theme['--fibogrid-pinned-cell-bg-selected'], 'important');
            } else if (isEven) {
              htmlEl.style.setProperty('background-color', theme['--fibogrid-pinned-cell-bg-even'], 'important');
            } else {
              htmlEl.style.setProperty('background-color', theme['--fibogrid-pinned-cell-bg-odd'], 'important');
            }
          }
        });
        
        // Override checkbox column - CRITICAL
        const checkboxColumns = gridElement.querySelectorAll('[style*="width: 48"], [style*="width: 48px"]');
        checkboxColumns.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('background-color', theme['--fibogrid-checkbox-column-bg'], 'important');
          htmlEl.style.setProperty('border-color', theme['--fibogrid-checkbox-column-border'], 'important');
        });
        
        // Override checkboxes directly
        const checkboxes = gridElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((el) => {
          const htmlEl = el as HTMLInputElement;
          htmlEl.style.setProperty('background-color', htmlEl.checked ? theme['--fibogrid-checkbox-bg-checked'] : theme['--fibogrid-checkbox-bg'], 'important');
          htmlEl.style.setProperty('border-color', htmlEl.checked ? theme['--fibogrid-checkbox-border-checked'] : theme['--fibogrid-checkbox-border'], 'important');
          htmlEl.style.setProperty('accent-color', theme['--fibogrid-checkbox-bg-checked'], 'important');
        });
        
        // Override selected rows - CRITICAL
        const selectedRows = gridElement.querySelectorAll('[class*="row"].bg-primary\\/10, [class*="row"][class*="selected"]');
        selectedRows.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('background-color', theme['--fibogrid-row-bg-selected'], 'important');
        });
        
        // Override buttons
        const buttons = gridElement.querySelectorAll('button, [role="button"]');
        buttons.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (!htmlEl.disabled) {
            htmlEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
            htmlEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
            htmlEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
            htmlEl.style.setProperty('border-top-color', theme['--fibogrid-button-border'], 'important');
            htmlEl.style.setProperty('border-right-color', theme['--fibogrid-button-border'], 'important');
            htmlEl.style.setProperty('border-bottom-color', theme['--fibogrid-button-border'], 'important');
            htmlEl.style.setProperty('border-left-color', theme['--fibogrid-button-border'], 'important');
          }
        });
        
        // Override text in header
        const headerText = gridElement.querySelectorAll('[class*="header"] span, [class*="header"] *');
        headerText.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.tagName === 'SPAN' || htmlEl.textContent) {
            htmlEl.style.setProperty('color', theme['--fibogrid-header-text'], 'important');
          }
        });
        
        // Override popovers - find all popover elements outside the grid
        const popovers = document.querySelectorAll('[data-radix-popover-content], [role="dialog"]');
        popovers.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('background-color', theme['--fibogrid-popover-bg'], 'important');
          htmlEl.style.setProperty('border-color', theme['--fibogrid-popover-border'], 'important');
          htmlEl.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
          
          // Override borders inside popover
          const borderElements = htmlEl.querySelectorAll('[class*="border"], [class*="border-b"], [class*="border-t"]');
          borderElements.forEach((borderEl) => {
            const borderHtmlEl = borderEl as HTMLElement;
            borderHtmlEl.style.setProperty('border-color', theme['--fibogrid-popover-border'], 'important');
            if (borderHtmlEl.classList.contains('border-b') || borderHtmlEl.className.includes('border-b')) {
              borderHtmlEl.style.setProperty('border-bottom-color', theme['--fibogrid-popover-border'], 'important');
            }
            if (borderHtmlEl.classList.contains('border-t') || borderHtmlEl.className.includes('border-t')) {
              borderHtmlEl.style.setProperty('border-top-color', theme['--fibogrid-popover-border'], 'important');
            }
          });
          
          // Override icons inside popover
          const icons = htmlEl.querySelectorAll('svg, [class*="lucide"], [class*="text-muted-foreground"]');
          icons.forEach((icon) => {
            const iconEl = icon as HTMLElement;
            iconEl.style.setProperty('color', theme['--fibogrid-popover-icon-color'], 'important');
            iconEl.style.setProperty('fill', theme['--fibogrid-popover-icon-color'], 'important');
            iconEl.style.setProperty('stroke', theme['--fibogrid-popover-icon-color'], 'important');
          });
          
          // Override buttons inside popover
          const buttons = htmlEl.querySelectorAll('button');
          buttons.forEach((button) => {
            const buttonEl = button as HTMLElement;
            if (!buttonEl.disabled) {
              buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
              buttonEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
              buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
              buttonEl.style.setProperty('border-top-color', theme['--fibogrid-button-border'], 'important');
              
              // Add hover listeners
              const handleMouseEnter = () => {
                buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg-hover'], 'important');
                buttonEl.style.setProperty('color', theme['--fibogrid-button-text-hover'], 'important');
                buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border-hover'], 'important');
                buttonEl.style.setProperty('border-top-color', theme['--fibogrid-button-border-hover'], 'important');
              };
              const handleMouseLeave = () => {
                buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
                buttonEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
                buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
                buttonEl.style.setProperty('border-top-color', theme['--fibogrid-button-border'], 'important');
              };
              buttonEl.addEventListener('mouseenter', handleMouseEnter, true);
              buttonEl.addEventListener('mouseleave', handleMouseLeave, true);
            }
          });
        });
        
        // Override dropdown menus (ColumnMenu)
        const dropdownMenus = document.querySelectorAll('[data-radix-dropdown-menu-content], [role="menu"]');
        dropdownMenus.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('background-color', theme['--fibogrid-column-menu-bg'], 'important');
          htmlEl.style.setProperty('border-color', theme['--fibogrid-popover-border'], 'important');
          htmlEl.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
        });
        
        // Override ColumnPanel (fixed panel)
        const columnPanels = document.querySelectorAll('[class*="fixed"][class*="right-0"]');
        columnPanels.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.textContent?.includes('Columns') || htmlEl.querySelector('[class*="ColumnPanel"]')) {
            htmlEl.style.setProperty('background-color', theme['--fibogrid-popover-bg'], 'important');
            htmlEl.style.setProperty('border-color', theme['--fibogrid-popover-border'], 'important');
            htmlEl.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
            
            // Override checkboxes inside ColumnPanel (Radix UI)
            const checkboxes = htmlEl.querySelectorAll('[data-radix-checkbox-root]');
            checkboxes.forEach((checkbox) => {
              const checkboxEl = checkbox as HTMLElement;
              const isChecked = checkboxEl.getAttribute('data-state') === 'checked';
              checkboxEl.style.setProperty('background-color', isChecked ? theme['--fibogrid-checkbox-bg-checked'] : theme['--fibogrid-checkbox-bg'], 'important');
              checkboxEl.style.setProperty('border-color', isChecked ? theme['--fibogrid-checkbox-border-checked'] : theme['--fibogrid-checkbox-border'], 'important');
              
              const indicator = checkboxEl.querySelector('[data-radix-checkbox-indicator]');
              if (indicator) {
                (indicator as HTMLElement).style.setProperty('color', theme['--fibogrid-checkbox-checkmark'], 'important');
              }
            });
            
            // Override buttons inside ColumnPanel with hover listeners
            const buttons = htmlEl.querySelectorAll('button');
            buttons.forEach((button) => {
              const buttonEl = button as HTMLElement;
              if (!buttonEl.disabled) {
                buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
                buttonEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
                buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
                
                // Add hover event listeners
                const handleMouseEnter = () => {
                  buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg-hover'], 'important');
                  buttonEl.style.setProperty('color', theme['--fibogrid-button-text-hover'], 'important');
                  buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border-hover'], 'important');
                };
                const handleMouseLeave = () => {
                  buttonEl.style.setProperty('background-color', theme['--fibogrid-button-bg'], 'important');
                  buttonEl.style.setProperty('color', theme['--fibogrid-button-text'], 'important');
                  buttonEl.style.setProperty('border-color', theme['--fibogrid-button-border'], 'important');
                };
                buttonEl.addEventListener('mouseenter', handleMouseEnter, true);
                buttonEl.addEventListener('mouseleave', handleMouseLeave, true);
              }
            });
            
            // Override items with hover:bg-muted class - CRITICAL FOR HOVER
            const hoverItems = htmlEl.querySelectorAll('[class*="hover:bg-muted"]');
            hoverItems.forEach((item) => {
              const itemEl = item as HTMLElement;
              itemEl.style.setProperty('background-color', 'transparent', 'important');
              
              // Add hover event listeners to force override
              const handleMouseEnter = () => {
                itemEl.style.setProperty('background-color', theme['--fibogrid-popover-item-bg-hover'], 'important');
                itemEl.style.setProperty('color', theme['--fibogrid-popover-item-text-hover'], 'important');
              };
              const handleMouseLeave = () => {
                itemEl.style.setProperty('background-color', 'transparent', 'important');
                itemEl.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
              };
              itemEl.addEventListener('mouseenter', handleMouseEnter, true);
              itemEl.addEventListener('mouseleave', handleMouseLeave, true);
            });
            
            // Override icons - CRITICAL
            const icons = htmlEl.querySelectorAll('svg, [class*="lucide"]');
            icons.forEach((icon) => {
              const iconEl = icon as HTMLElement;
              iconEl.style.setProperty('color', theme['--fibogrid-popover-icon-color'], 'important');
              iconEl.style.setProperty('fill', theme['--fibogrid-popover-icon-color'], 'important');
              iconEl.style.setProperty('stroke', theme['--fibogrid-popover-icon-color'], 'important');
            });
            
            // Override border-top in footer buttons area
            const borderTopElements = htmlEl.querySelectorAll('[class*="border-t"], [class*="border-top"]');
            borderTopElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.setProperty('border-top-color', theme['--fibogrid-popover-border'], 'important');
            });
          }
        });
        
        // Override bg-popover class everywhere
        const bgPopoverElements = document.querySelectorAll('.bg-popover, [class*="bg-popover"]');
        bgPopoverElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('background-color', theme['--fibogrid-popover-bg'], 'important');
          htmlEl.style.setProperty('color', theme['--fibogrid-popover-item-text'], 'important');
        });
        
        // Override all Radix UI checkboxes globally
        const allRadixCheckboxes = document.querySelectorAll('[data-radix-checkbox-root]');
        allRadixCheckboxes.forEach((checkbox) => {
          const checkboxEl = checkbox as HTMLElement;
          const isChecked = checkboxEl.getAttribute('data-state') === 'checked';
          checkboxEl.style.setProperty('background-color', isChecked ? theme['--fibogrid-checkbox-bg-checked'] : theme['--fibogrid-checkbox-bg'], 'important');
          checkboxEl.style.setProperty('border-color', isChecked ? theme['--fibogrid-checkbox-border-checked'] : theme['--fibogrid-checkbox-border'], 'important');
          
          const indicator = checkboxEl.querySelector('[data-radix-checkbox-indicator]');
          if (indicator) {
            (indicator as HTMLElement).style.setProperty('color', theme['--fibogrid-checkbox-checkmark'], 'important');
          }
        });
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [theme]);

  const applyPreset = (presetKey: string) => {
    const preset = themePresets[presetKey];
    if (preset) {
      setTheme(preset.theme);
      setSelectedPreset(presetKey);
      setThemeName(preset.name.toLowerCase().replace(/\s+/g, '-'));
      toast({ title: 'Preset Applied', description: `${preset.name} theme loaded` });
    }
  };

  const updateTheme = (key: keyof ThemeValue, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    setSelectedPreset('custom');
  };

  const generateCSS = () => {
    return `/* FiboGrid Custom Theme: ${themeName} */
/* Generated by FiboGrid Theme Builder */

.fibogrid.${themeName} {
${Object.entries(theme)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}`;
  };

  const downloadCSS = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeName || 'custom-theme'}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'CSS Downloaded', description: `Theme saved as ${themeName || 'custom-theme'}.css` });
  };

  const copyToClipboard = async () => {
    const css = generateCSS();
    await navigator.clipboard.writeText(css);
    setCopied(true);
    toast({ title: 'Copied!', description: 'CSS copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const ColorInput = ({ label, key, description }: { label: string; key: keyof ThemeValue; description?: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      <div className="flex gap-2">
        <Input
          id={key}
          type="color"
          value={theme[key]}
          onChange={(e) => updateTheme(key, e.target.value)}
          className="w-16 h-10 cursor-pointer"
        />
        <Input
          type="text"
          value={theme[key]}
          onChange={(e) => updateTheme(key, e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const NumberInput = ({ label, key, min, max, step, unit = 'px' }: { 
    label: string; 
    key: keyof ThemeValue; 
    min?: number; 
    max?: number; 
    step?: number;
    unit?: string;
  }) => {
    const currentValue = theme[key];
    const numericValue = unit ? parseFloat(currentValue) || 0 : parseFloat(currentValue) || 0;
    
    return (
      <div className="space-y-2">
        <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
        <div className="flex gap-2 items-center">
          <Input
            id={key}
            type="number"
            value={numericValue}
            onChange={(e) => {
              const val = e.target.value;
              updateTheme(key, unit ? `${val}${unit}` : val);
            }}
            min={min}
            max={max}
            step={step || 1}
            className="flex-1"
          />
          {unit && <span className="text-sm text-muted-foreground w-8">{unit}</span>}
        </div>
      </div>
    );
  };

  const columns: ColumnDef<typeof sampleData[0]>[] = useMemo(() => [
    { 
      field: 'country', 
      headerName: 'Country', 
      sortable: true,
      width: 140,
      pinned: 'left'
    },
    { 
      field: 'sport', 
      headerName: 'Sport', 
      sortable: true,
      width: 160,
    },
    { 
      field: 'athlete', 
      headerName: 'Name', 
      sortable: true,
      width: 160,
    },
    { 
      field: 'total', 
      headerName: 'Total winnings', 
      sortable: true,
      width: 150,
      cellRenderer: ({ value }) => `$${value.toLocaleString()}`
    },
    { 
      field: 'year2023', 
      headerName: '2023 winnings', 
      sortable: true,
      width: 150,
      cellRenderer: ({ value }) => `$${value.toLocaleString()}`
    },
    { 
      field: 'year2022', 
      headerName: '2022 winnings', 
      sortable: true,
      width: 150,
      cellRenderer: ({ value }) => `$${value.toLocaleString()}`
    },
  ], []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">FiboGrid Theme Builder</span>
            </Link>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/docs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Docs
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Controls Panel */}
          <ScrollArea className="h-[calc(100vh-120px)]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(themePresets)
                      .filter(([key]) => key !== 'custom')
                      .map(([key, preset]) => (
                        <Button
                          key={key}
                          variant={selectedPreset === key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => applyPreset(key)}
                          className="h-auto py-2 flex flex-col items-start"
                        >
                          <span className="font-medium text-xs">{preset.name}</span>
                          <span className="text-[10px] text-muted-foreground">{preset.description}</span>
                        </Button>
                      ))}
                  </div>
                </div>

                <Separator />

                {/* Theme Name */}
                <div className="space-y-2">
                  <Label htmlFor="themeName" className="text-sm font-medium">Theme Class Name</Label>
                  <Input
                    id="themeName"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="my-custom-theme"
                    className="font-mono"
                  />
                </div>

                <Separator />

                {/* Theme Controls */}
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="borders">Borders</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                  </TabsList>

                  <TabsContent value="colors" className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-sm">Background & Surface</h3>
                      <div className="space-y-3">
                        <ColorInput label="Background" key="--fibogrid-bg" />
                        <ColorInput label="Surface" key="--fibogrid-surface" />
                        <ColorInput label="Surface Hover" key="--fibogrid-surface-hover" />
                        <ColorInput label="Surface Selected" key="--fibogrid-surface-selected" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3 text-sm">Text Colors</h3>
                      <div className="space-y-3">
                        <ColorInput label="Text" key="--fibogrid-text" />
                        <ColorInput label="Text Secondary" key="--fibogrid-text-secondary" />
                        <ColorInput label="Text Muted" key="--fibogrid-text-muted" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3 text-sm">Primary Colors</h3>
                      <div className="space-y-3">
                        <ColorInput label="Primary" key="--fibogrid-primary" />
                        <ColorInput label="Primary Hover" key="--fibogrid-primary-hover" />
                        <ColorInput label="Primary Active" key="--fibogrid-primary-active" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="borders" className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-sm">General Borders</h3>
                      <div className="space-y-3">
                        <ColorInput label="Border" key="--fibogrid-border" />
                        <ColorInput label="Border Strong" key="--fibogrid-border-strong" />
                        <ColorInput label="Cell Border Right" key="--fibogrid-cell-border-right" />
                        <ColorInput label="Cell Border Bottom" key="--fibogrid-cell-border-bottom" />
                        <ColorInput label="Header Border Bottom" key="--fibogrid-header-border-bottom" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3 text-sm">Border Radius</h3>
                      <div className="space-y-3">
                        <NumberInput label="Radius SM" key="--fibogrid-radius-sm" min={0} max={20} />
                        <NumberInput label="Radius MD" key="--fibogrid-radius-md" min={0} max={20} />
                        <NumberInput label="Radius LG" key="--fibogrid-radius-lg" min={0} max={20} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-sm">Heights</h3>
                      <div className="space-y-3">
                        <NumberInput label="Header Height" key="--fibogrid-header-height" min={20} max={100} />
                        <NumberInput label="Row Height" key="--fibogrid-row-height" min={20} max={100} />
                        <NumberInput label="Cell Padding" key="--fibogrid-cell-padding" min={4} max={32} />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3 text-sm">Typography</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Font Family</Label>
                          <Input
                            value={theme['--fibogrid-font-family']}
                            onChange={(e) => updateTheme('--fibogrid-font-family', e.target.value)}
                            placeholder="Inter, sans-serif"
                          />
                        </div>
                        <NumberInput label="Font Size" key="--fibogrid-font-size" min={10} max={20} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1">
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy CSS'}
                  </Button>
                  <Button size="sm" onClick={downloadCSS} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] border rounded-lg overflow-hidden" ref={gridContainerRef}>
                  <FiboGrid
                    className="theme-builder-preview"
                    rowData={sampleData}
                    columnDefs={columns}
                    getRowId={(row) => row.id}
                    rowSelection="multiple"
                    showToolbar={true}
                    showStatusBar={true}
                    pagination={true}
                    paginationPageSize={25}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generated CSS */}
            <Card>
              <CardHeader>
                <CardTitle>Generated CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <pre className="text-xs font-mono">
                    <code>{generateCSS()}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
