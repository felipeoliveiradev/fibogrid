# FiboGrid 主题指南

FiboGrid 使用**隔离的 CSS 变量系统**，不会与你应用的样式冲突。

## 快速开始

```tsx
import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles.css';

// The grid automatically gets the .fibogrid class
<FiboGrid rowData={data} columnDefs={columns} />
```

## CSS 变量

所有 FiboGrid 样式都限定在 `.fibogrid` 类下，CSS 变量以 `--fibogrid-*` 为前缀。

### 可用变量

#### 颜色 - 背景与表面
```css
--fibogrid-bg: #ffffff;
--fibogrid-surface: #fafafa;
--fibogrid-surface-hover: #f5f5f5;
--fibogrid-surface-selected: #e8f4fd;
```

#### 颜色 - 文本
```css
--fibogrid-text: #1a1a1a;
--fibogrid-text-secondary: #666666;
--fibogrid-text-muted: #999999;
--fibogrid-text-inverse: #ffffff;
```

#### 颜色 - 边框
```css
--fibogrid-border: #e0e0e0;
--fibogrid-border-strong: #c0c0c0;
--fibogrid-border-hover: #b0b0b0;
```

#### 颜色 - 主色（金色）
```css
--fibogrid-primary: hsl(40, 65%, 45%);
--fibogrid-primary-hover: hsl(42, 70%, 50%);
--fibogrid-primary-active: hsl(38, 60%, 40%);
--fibogrid-primary-text: #ffffff;
```

#### 颜色 - 状态
```css
--fibogrid-success: #22c55e;
--fibogrid-warning: #f59e0b;
--fibogrid-error: #ef4444;
--fibogrid-info: #3b82f6;
```

#### 尺寸
```css
--fibogrid-header-height: 44px;
--fibogrid-row-height: 40px;
--fibogrid-toolbar-height: 48px;
--fibogrid-statusbar-height: 36px;
--fibogrid-cell-padding: 12px;
```

#### 字体排印
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

#### 间距
```css
--fibogrid-spacing-xs: 4px;
--fibogrid-spacing-sm: 8px;
--fibogrid-spacing-md: 12px;
--fibogrid-spacing-lg: 16px;
--fibogrid-spacing-xl: 24px;
```

#### 圆角
```css
--fibogrid-radius-sm: 4px;
--fibogrid-radius-md: 6px;
--fibogrid-radius-lg: 8px;
```

## 自定义主题

### 方式 1：自定义 CSS 类

通过覆盖变量创建自定义主题：

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

然后应用该类：

```tsx
<FiboGrid 
  className="my-purple-theme"
  rowData={data} 
  columnDefs={columns} 
/>
```

### 方式 2：内联样式

直接覆盖变量：

```tsx
<FiboGrid 
  style={ {
    '--fibogrid-primary': '#8b5cf6',
    '--fibogrid-row-height': '32px',
  } as React.CSSProperties}
  rowData={data} 
  columnDefs={columns} 
/>
```

### 方式 3：全局主题

为所有表格全局覆盖：

```css
/* your-app.css */
.fibogrid {
  --fibogrid-primary: #8b5cf6;
  --fibogrid-primary-hover: #7c3aed;
}
```

## 预置主题

### 紧凑主题

更小、更紧凑的布局：

```css
.fibogrid.fibogrid-compact {
  --fibogrid-row-height: 32px;
  --fibogrid-header-height: 36px;
  --fibogrid-cell-padding: 8px;
  --fibogrid-font-size: 13px;
}
```

### 舒适主题

更宽松的布局：

```css
.fibogrid.fibogrid-comfortable {
  --fibogrid-row-height: 48px;
  --fibogrid-header-height: 52px;
  --fibogrid-cell-padding: 16px;
  --fibogrid-font-size: 15px;
}
```

### Material 主题

受 Material Design 启发：

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

### 极简主题

简洁、极简的设计：

```css
.fibogrid.fibogrid-minimal {
  --fibogrid-border: transparent;
  --fibogrid-surface: transparent;
  --fibogrid-surface-hover: #f9fafb;
}
```

## 深色模式

使用 Tailwind 的深色模式时，FiboGrid 会自动支持深色模式：

```tsx
// Automatic (respects user's system preference)
<html class="dark">
  <FiboGrid rowData={data} columnDefs={columns} />
</html>
```

或者强制使用深色模式：

```tsx
<FiboGrid 
  className="fibogrid-dark"
  rowData={data} 
  columnDefs={columns} 
/>
```

## 为什么使用隔离变量？

- ✅ **无冲突**：不会影响你应用的样式
- ✅ **易于定制**：只覆盖你需要的部分
- ✅ **可预测**：所有变量都以 `--fibogrid-*` 为前缀
- ✅ **有作用域**：所有样式都在 `.fibogrid` 类下
- ✅ **高性能**：CSS 变量快速且高效

## 示例：完整的自定义主题

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

## 需要帮助？

- 📚 完整文档：https://felipeoliveiradev.github.io/fibogrid
- 🐛 报告问题：https://github.com/felipeoliveiradev/fibogrid/issues
- 💬 讨论区：https://github.com/felipeoliveiradev/fibogrid/discussions
