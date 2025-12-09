# FiboGrid Theming Guide

FiboGrid uses an **isolated CSS Variables system** that won't conflict with your application's styles.

## Quick Start

```tsx
import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles.css';

// The grid automatically gets the .fibogrid class
<FiboGrid rowData={data} columnDefs={columns} />
```

## CSS Variables

All FiboGrid styles are scoped under the `.fibogrid` class with CSS variables prefixed with `--fibogrid-*`.

### Available Variables

#### Colors - Background & Surface
```css
--fibogrid-bg: #ffffff;
--fibogrid-surface: #fafafa;
--fibogrid-surface-hover: #f5f5f5;
--fibogrid-surface-selected: #e8f4fd;
```

#### Colors - Text
```css
--fibogrid-text: #1a1a1a;
--fibogrid-text-secondary: #666666;
--fibogrid-text-muted: #999999;
--fibogrid-text-inverse: #ffffff;
```

#### Colors - Border
```css
--fibogrid-border: #e0e0e0;
--fibogrid-border-strong: #c0c0c0;
--fibogrid-border-hover: #b0b0b0;
```

#### Colors - Primary (Gold)
```css
--fibogrid-primary: hsl(40, 65%, 45%);
--fibogrid-primary-hover: hsl(42, 70%, 50%);
--fibogrid-primary-active: hsl(38, 60%, 40%);
--fibogrid-primary-text: #ffffff;
```

#### Colors - States
```css
--fibogrid-success: #22c55e;
--fibogrid-warning: #f59e0b;
--fibogrid-error: #ef4444;
--fibogrid-info: #3b82f6;
```

#### Sizing
```css
--fibogrid-header-height: 44px;
--fibogrid-row-height: 40px;
--fibogrid-toolbar-height: 48px;
--fibogrid-statusbar-height: 36px;
--fibogrid-cell-padding: 12px;
```

#### Typography
```css
--fibogrid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--fibogrid-font-size: 14px;
--fibogrid-font-size-sm: 12px;
--fibogrid-font-size-lg: 16px;
--fibogrid-font-weight-normal: 400;
--fibogrid-font-weight-medium: 500;
--fibogrid-font-weight-semibold: 600;
--fibogrid-font-weight-bold: 700;
--fibogrid-line-height: 1.5;
```

#### Spacing
```css
--fibogrid-spacing-xs: 4px;
--fibogrid-spacing-sm: 8px;
--fibogrid-spacing-md: 12px;
--fibogrid-spacing-lg: 16px;
--fibogrid-spacing-xl: 24px;
```

#### Border Radius
```css
--fibogrid-radius-sm: 4px;
--fibogrid-radius-md: 6px;
--fibogrid-radius-lg: 8px;
```

## Custom Themes

### Option 1: CSS Custom Class

Create a custom theme by overriding variables:

```css
/* your-app.css */
.fibogrid.my-purple-theme {
  --fibogrid-primary: #8b5cf6;
  --fibogrid-primary-hover: #7c3aed;
  --fibogrid-primary-active: #6d28d9;
  --fibogrid-bg: #f8fafc;
  --fibogrid-border: #cbd5e1;
}
```

Then apply the class:

```tsx
<FiboGrid 
  className="my-purple-theme"
  rowData={data} 
  columnDefs={columns} 
/>
```

### Option 2: Inline Styles

Override variables directly:

```tsx
<FiboGrid 
  style={{
    '--fibogrid-primary': '#8b5cf6',
    '--fibogrid-row-height': '32px',
  } as React.CSSProperties}
  rowData={data} 
  columnDefs={columns} 
/>
```

### Option 3: Global Theme

Override globally for all grids:

```css
/* your-app.css */
.fibogrid {
  --fibogrid-primary: #8b5cf6;
  --fibogrid-primary-hover: #7c3aed;
}
```

## Pre-built Themes

### Compact Theme

Smaller, denser layout:

```css
.fibogrid.fibogrid-compact {
  --fibogrid-row-height: 32px;
  --fibogrid-header-height: 36px;
  --fibogrid-cell-padding: 8px;
  --fibogrid-font-size: 13px;
}
```

### Comfortable Theme

More spacious layout:

```css
.fibogrid.fibogrid-comfortable {
  --fibogrid-row-height: 48px;
  --fibogrid-header-height: 52px;
  --fibogrid-cell-padding: 16px;
  --fibogrid-font-size: 15px;
}
```

### Material Theme

Material Design inspired:

```css
.fibogrid.fibogrid-material {
  --fibogrid-primary: #1976d2;
  --fibogrid-primary-hover: #1565c0;
  --fibogrid-primary-active: #0d47a1;
  --fibogrid-border: #e0e0e0;
  --fibogrid-radius-sm: 4px;
  --fibogrid-radius-md: 4px;
  --fibogrid-radius-lg: 4px;
}
```

### Minimal Theme

Clean, minimal design:

```css
.fibogrid.fibogrid-minimal {
  --fibogrid-border: transparent;
  --fibogrid-surface: transparent;
  --fibogrid-surface-hover: #f9fafb;
}
```

## Dark Mode

FiboGrid automatically supports dark mode when using Tailwind's dark mode:

```tsx
// Automatic (respects user's system preference)
<html class="dark">
  <FiboGrid rowData={data} columnDefs={columns} />
</html>
```

Or force dark mode:

```tsx
<FiboGrid 
  className="fibogrid-dark"
  rowData={data} 
  columnDefs={columns} 
/>
```

## Why Isolated Variables?

- ✅ **No Conflicts**: Won't affect your app's styles
- ✅ **Easy Customization**: Override just what you need
- ✅ **Predictable**: All variables are prefixed with `--fibogrid-*`
- ✅ **Scoped**: All styles under `.fibogrid` class
- ✅ **Performant**: CSS variables are fast and efficient

## Example: Complete Custom Theme

```css
/* custom-grid-theme.css */
.fibogrid.my-brand-theme {
  /* Brand colors */
  --fibogrid-primary: #ff6b6b;
  --fibogrid-primary-hover: #ff5252;
  --fibogrid-primary-active: #ff3838;
  
  /* Custom backgrounds */
  --fibogrid-bg: #fef2f2;
  --fibogrid-surface: #fee2e2;
  --fibogrid-surface-hover: #fecaca;
  --fibogrid-surface-selected: #fca5a5;
  
  /* Custom text */
  --fibogrid-text: #7f1d1d;
  --fibogrid-text-secondary: #991b1b;
  
  /* Custom borders */
  --fibogrid-border: #fecaca;
  --fibogrid-border-strong: #fca5a5;
  
  /* Custom sizing */
  --fibogrid-row-height: 44px;
  --fibogrid-font-size: 15px;
  
  /* Custom radius */
  --fibogrid-radius-md: 12px;
}
```

```tsx
import 'fibogrid/styles.css';
import './custom-grid-theme.css';

<FiboGrid 
  className="my-brand-theme"
  rowData={data} 
  columnDefs={columns} 
/>
```

## Need Help?

- 📚 Full documentation: https://felipeoliveiradev.github.io/fibogrid
- 🐛 Report issues: https://github.com/felipeoliveiradev/fibogrid/issues
- 💬 Discussions: https://github.com/felipeoliveiradev/fibogrid/discussions
