# Guía de Temas de FiboGrid

FiboGrid usa un **sistema aislado de variables CSS** que no entrará en conflicto con los estilos de tu aplicación.

## Inicio Rápido

```tsx
import { FiboGrid } from 'fibogrid';
import 'fibogrid/styles.css';

// The grid automatically gets the .fibogrid class
<FiboGrid rowData={data} columnDefs={columns} />
```

## Variables CSS

Todos los estilos de FiboGrid están acotados bajo la clase `.fibogrid`, con variables CSS con el prefijo `--fibogrid-*`.

### Variables Disponibles

#### Colores - Fondo y Superficie
```css
--fibogrid-bg: #ffffff;
--fibogrid-surface: #fafafa;
--fibogrid-surface-hover: #f5f5f5;
--fibogrid-surface-selected: #e8f4fd;
```

#### Colores - Texto
```css
--fibogrid-text: #1a1a1a;
--fibogrid-text-secondary: #666666;
--fibogrid-text-muted: #999999;
--fibogrid-text-inverse: #ffffff;
```

#### Colores - Borde
```css
--fibogrid-border: #e0e0e0;
--fibogrid-border-strong: #c0c0c0;
--fibogrid-border-hover: #b0b0b0;
```

#### Colores - Primario (Dorado)
```css
--fibogrid-primary: hsl(40, 65%, 45%);
--fibogrid-primary-hover: hsl(42, 70%, 50%);
--fibogrid-primary-active: hsl(38, 60%, 40%);
--fibogrid-primary-text: #ffffff;
```

#### Colores - Estados
```css
--fibogrid-success: #22c55e;
--fibogrid-warning: #f59e0b;
--fibogrid-error: #ef4444;
--fibogrid-info: #3b82f6;
```

#### Tamaños
```css
--fibogrid-header-height: 44px;
--fibogrid-row-height: 40px;
--fibogrid-toolbar-height: 48px;
--fibogrid-statusbar-height: 36px;
--fibogrid-cell-padding: 12px;
```

#### Tipografía
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

#### Espaciado
```css
--fibogrid-spacing-xs: 4px;
--fibogrid-spacing-sm: 8px;
--fibogrid-spacing-md: 12px;
--fibogrid-spacing-lg: 16px;
--fibogrid-spacing-xl: 24px;
```

#### Radio de Borde
```css
--fibogrid-radius-sm: 4px;
--fibogrid-radius-md: 6px;
--fibogrid-radius-lg: 8px;
```

## Temas Personalizados

### Opción 1: Clase CSS Personalizada

Crea un tema personalizado sobrescribiendo las variables:

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

Luego aplica la clase:

```tsx
<FiboGrid 
  className="my-purple-theme"
  rowData={data} 
  columnDefs={columns} 
/>
```

### Opción 2: Estilos Inline

Sobrescribe las variables directamente:

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

### Opción 3: Tema Global

Sobrescribe globalmente para todos los grids:

```css
/* your-app.css */
.fibogrid {
  --fibogrid-primary: #8b5cf6;
  --fibogrid-primary-hover: #7c3aed;
}
```

## Temas Predefinidos

### Tema Compacto

Diseño más pequeño y denso:

```css
.fibogrid.fibogrid-compact {
  --fibogrid-row-height: 32px;
  --fibogrid-header-height: 36px;
  --fibogrid-cell-padding: 8px;
  --fibogrid-font-size: 13px;
}
```

### Tema Cómodo

Diseño más espacioso:

```css
.fibogrid.fibogrid-comfortable {
  --fibogrid-row-height: 48px;
  --fibogrid-header-height: 52px;
  --fibogrid-cell-padding: 16px;
  --fibogrid-font-size: 15px;
}
```

### Tema Material

Inspirado en Material Design:

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

### Tema Minimal

Diseño limpio y minimalista:

```css
.fibogrid.fibogrid-minimal {
  --fibogrid-border: transparent;
  --fibogrid-surface: transparent;
  --fibogrid-surface-hover: #f9fafb;
}
```

## Modo Oscuro

FiboGrid soporta automáticamente el modo oscuro cuando se usa el modo oscuro de Tailwind:

```tsx
// Automatic (respects user's system preference)
<html class="dark">
  <FiboGrid rowData={data} columnDefs={columns} />
</html>
```

O fuerza el modo oscuro:

```tsx
<FiboGrid 
  className="fibogrid-dark"
  rowData={data} 
  columnDefs={columns} 
/>
```

## ¿Por Qué Variables Aisladas?

- ✅ **Sin Conflictos**: No afectará los estilos de tu aplicación
- ✅ **Fácil Personalización**: Sobrescribe solo lo que necesites
- ✅ **Predecible**: Todas las variables tienen el prefijo `--fibogrid-*`
- ✅ **Acotado**: Todos los estilos bajo la clase `.fibogrid`
- ✅ **Eficiente**: Las variables CSS son rápidas y eficientes

## Ejemplo: Tema Personalizado Completo

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

## ¿Necesitas Ayuda?

- 📚 Documentación completa: https://felipeoliveiradev.github.io/fibogrid
- 🐛 Reportar problemas: https://github.com/felipeoliveiradev/fibogrid/issues
- 💬 Discusiones: https://github.com/felipeoliveiradev/fibogrid/discussions
