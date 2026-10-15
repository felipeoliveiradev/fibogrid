# 07 - Configuracao

## FiboGridConfigs

Configuracao avancada de layout do grid via prop `configs`.

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

| Item | Descricao |
|------|-----------|
| `search` | Campo de pesquisa rapida |
| `active-filters` | Chips com filtros ativos |
| `filter-button` | Botao para abrir painel de filtros |
| `density-button` | Toggle compact/normal/comfortable |
| `export-button` | Export CSV/Excel |
| `columns-button` | Painel de gestao de colunas |
| `copy-button` | Copiar para clipboard |
| `refresh-button` | Botao de refresh |
| `custom-actions` | Acoes customizadas (ReactNode) |
| `spacer` | Espacador flexivel |

### Footer Layout Items

| Item | Descricao |
|------|-----------|
| `pagination` | Controles de paginacao completos |
| `pagination-page-size` | Selector de tamanho de pagina |
| `pagination-info` | Texto "1-20 de 100" |
| `pagination-controls` | Botoes prev/next |
| `status-bar` | Barra de status completa |
| `status-info` | Contagem de linhas |
| `status-selected` | Contagem de selecionados |
| `status-aggregations` | Valores de agregacao |
| `spacer` | Espacador flexivel |

---

## Default Column Definition

Definir propriedades padrao para todas as colunas.

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

### Via Prop

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

### Variaveis de Dimensao

```css
.fibogrid {
  --fibogrid-row-height: 40px;
  --fibogrid-header-height: 44px;
  --fibogrid-cell-padding: 12px;
  --fibogrid-font-size: 14px;
  --fibogrid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Temas Pre-definidos

| Classe | Descricao |
|--------|-----------|
| `fibogrid-compact` | Layout denso (row-height menor) |
| `fibogrid-comfortable` | Layout espacoso |
| `fibogrid-material` | Estilo Material Design |
| `fibogrid-minimal` | Design minimalista |

### Customizacao

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

Controlar camadas de overlays e popovers.

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

## Densidade

Toggle entre densidades via toolbar ou programaticamente.

| Densidade | Row Height | Descricao |
|-----------|-----------|-----------|
| `compact` | ~32px | Mais dados visiveis |
| `normal` | ~40px | Padrao |
| `comfortable` | ~52px | Mais respiracao |

---

## Paginacao

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

### Sem Dados

```tsx
<FiboGrid
  rowData={[]}
  noRowsOverlayComponent={<p>Nenhum resultado encontrado</p>}
/>
```

---

## Filtro de Valores Virtualizado

Para colunas com muitos valores unicos, ativar virtualizacao no filtro.

```tsx
<FiboGrid
  enableFilterValueVirtualization
  filterValues={{
    status: ['ativo', 'inativo', 'pendente'],
    tipo: ['A', 'B', 'C'],
  }}
/>
```
