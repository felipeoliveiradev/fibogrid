# 07 - Configuración

## FiboGridConfigs

Configuración avanzada del layout del grid mediante la prop `configs`.

```tsx
<FiboGrid
  configs={{
    compact: true,
    zIndex: { popover: 50, select: 40, modal: 100 },
    header: {
      show: true,
      layout: ['search', 'spacer', 'filter-button', 'export-button', 'columns-button'],
      search: true,
      filterButton: true,
      densityButton: true,
      exportButton: true,
      columnsButton: true,
      copyButton: true,
      refreshButton: false,
      filterRow: false,
      customActions: <MeuBotao />,
    },
    center: {
      rowNumbers: true,
      checkboxSelection: true,
      stripes: true,
      borders: true,
    },
    footer: {
      show: true,
      layout: ['pagination', 'spacer', 'status-bar'],
      pagination: true,
      information: true,
    },
  }}
/>
```

### Header Layout Items

| Item | Descripción |
|------|-----------|
| `search` | Campo de búsqueda rápida |
| `active-filters` | Chips con los filtros activos |
| `filter-button` | Botón para abrir el panel de filtros |
| `density-button` | Toggle compact/normal/comfortable |
| `export-button` | Export CSV/Excel |
| `columns-button` | Panel de gestión de columnas |
| `copy-button` | Copiar al clipboard |
| `refresh-button` | Botón de refresh |
| `custom-actions` | Acciones personalizadas (ReactNode) |
| `spacer` | Espaciador flexible |

### Footer Layout Items

| Item | Descripción |
|------|-----------|
| `pagination` | Controles de paginación completos |
| `pagination-page-size` | Selector de tamaño de página |
| `pagination-info` | Texto "1-20 de 100" |
| `pagination-controls` | Botones prev/next |
| `status-bar` | Barra de estado completa |
| `status-info` | Conteo de filas |
| `status-selected` | Conteo de seleccionados |
| `status-aggregations` | Valores de agregación |
| `spacer` | Espaciador flexible |

---

## Default Column Definition

Definir propiedades por defecto para todas las columnas.

```tsx
<FiboGrid
  defaultColDef={{
    sortable: true,
    filterable: true,
    resizable: true,
    minWidth: 100,
  }}
  columnDefs={[
    { field: 'nome', headerName: 'Nome' },           // herda sortable, filterable, resizable
    { field: 'id', headerName: 'ID', sortable: false }, // override: nao ordena
  ]}
/>
```

---

## Temas

### Vía prop

```tsx
<FiboGrid theme="light" />  // ou "dark" ou "auto"
```

### CSS Variables (Light)

```css
.fibogrid {
  --fibogrid-bg: #ffffff;
  --fibogrid-surface: #fafafa;
  --fibogrid-text: #1a1a1a;
  --fibogrid-text-secondary: #666666;
  --fibogrid-text-muted: #999999;
  --fibogrid-primary: hsl(40, 65%, 45%);
  --fibogrid-primary-hover: hsl(40, 65%, 55%);
  --fibogrid-primary-text: #ffffff;
  --fibogrid-border: #e0e0e0;
  --fibogrid-border-cell: #f0f0f0;
  --fibogrid-row-hover: #f5f5f5;
  --fibogrid-row-selected: hsl(40, 65%, 95%);
  --fibogrid-row-stripe: #fafafa;
  --fibogrid-header-bg: #f8f8f8;
  --fibogrid-header-text: #333333;
}
```

### CSS Variables (Dark)

```css
.fibogrid[data-theme="dark"] {
  --fibogrid-bg: #1a1a2e;
  --fibogrid-surface: #16213e;
  --fibogrid-text: #e8e8e8;
  --fibogrid-text-secondary: #a0a0a0;
  --fibogrid-primary: hsl(40, 65%, 55%);
  --fibogrid-border: #2a2a4a;
  --fibogrid-row-hover: #1e2a4a;
  --fibogrid-row-selected: hsl(40, 65%, 20%);
  --fibogrid-header-bg: #0f1a35;
}
```

### Variables de dimensión

```css
.fibogrid {
  --fibogrid-row-height: 40px;
  --fibogrid-header-height: 44px;
  --fibogrid-cell-padding: 12px;
  --fibogrid-font-size: 14px;
  --fibogrid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Temas predefinidos

| Clase | Descripción |
|--------|-----------|
| `fibogrid-compact` | Layout denso (row-height menor) |
| `fibogrid-comfortable` | Layout espacioso |
| `fibogrid-material` | Estilo Material Design |
| `fibogrid-minimal` | Diseño minimalista |

### Personalización

```css
/* Override via CSS */
.meu-grid .fibogrid {
  --fibogrid-primary: #3b82f6;
  --fibogrid-row-height: 36px;
  --fibogrid-font-size: 13px;
}
```

---

## Z-Index

Controlar las capas de overlays y popovers.

```tsx
<FiboGrid
  configs={{
    zIndex: {
      popover: 50,
      select: 40,
      modal: 100,
    },
  }}
/>
```

---

## Densidad

Alternar entre densidades mediante la toolbar o de forma programática.

| Densidad | Row Height | Descripción |
|-----------|-----------|-----------|
| `compact` | ~32px | Más datos visibles |
| `normal` | ~40px | Por defecto |
| `comfortable` | ~52px | Más espacio para respirar |

---

## Paginación

### Client-Side

```tsx
<FiboGrid
  pagination
  paginationPageSize={20}
  paginationPageSizeOptions={[10, 20, 50, 100]}
/>
```

### Server-Side

```tsx
<FiboGrid
  pagination
  paginationMode="server"
  paginationPageSize={50}
  serverSideDataSource={dataSource}
/>
```

---

## Overlays

### Loading

```tsx
<FiboGrid
  loading={isLoading}
  loadingOverlayComponent={<MeuSpinner />}
/>
```

### Sin datos

```tsx
<FiboGrid
  rowData={[]}
  noRowsOverlayComponent={<p>Nenhum resultado encontrado</p>}
/>
```

---

## Filtro de valores virtualizado

Para columnas con muchos valores únicos, activar la virtualización en el filtro.

```tsx
<FiboGrid
  enableFilterValueVirtualization
  filterValues={{
    status: ['ativo', 'inativo', 'pendente'],
    tipo: ['A', 'B', 'C'],
  }}
/>
```
