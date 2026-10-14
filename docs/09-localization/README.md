# 09 - Localizacao

## Localizacao

```
src/components/FiboGrid/locales/
```

---

## Idiomas Suportados

| Locale | Idioma | Import |
|--------|--------|--------|
| `enUS` | Ingles (EUA) | `import { enUS } from 'fibogrid'` |
| `ptBR` | Portugues (Brasil) | `import { ptBR } from 'fibogrid'` |
| `esES` | Espanhol | `import { esES } from 'fibogrid'` |
| `frFR` | Frances | `import { frFR } from 'fibogrid'` |
| `jaJP` | Japones | `import { jaJP } from 'fibogrid'` |
| `zhCN` | Chines Simplificado | `import { zhCN } from 'fibogrid'` |
| `ruRU` | Russo | `import { ruRU } from 'fibogrid'` |
| `caES` | Catalao | `import { caES } from 'fibogrid'` |
| `koKR` | Coreano | `import { koKR } from 'fibogrid'` |

---

## Uso

```tsx
import { FiboGrid, ptBR } from 'fibogrid';

<FiboGrid
  lang={ptBR}
  rowData={dados}
  columnDefs={colunas}
/>
```

---

## Interface FiboGridLocale

```typescript
interface FiboGridLocale {
  toolbar: {
    searchPlaceholder: string;
    columns: string;
    showAll: string;
    hideAll: string;
    copy: string;
    copied: string;
    export: string;
    activeFilters: string;
    resetAll: string;
    toggleColumns: string;
    selectedCount: (selected: number, total: number) => string;
    filterLabel: (column: string, value: string) => string;
    filterLabelCount: (column: string, count: number) => string;
  };
  pagination: {
    rowsPerPage: string;
    pageInfo: (start: number, end: number, total: number) => string;
    zeroRows: string;
    pageOf: (current: number, total: number) => string;
  };
  statusBar: {
    rows: string;
    selected: (count: number) => string;
    totalRows: (count: number) => string;
    aggregations: {
      sum: string;
      avg: string;
      min: string;
      max: string;
      count: string;
    };
  };
  columnMenu: {
    sortAsc: string;
    sortDesc: string;
    pinColumn: string;
    noPin: string;
    pinLeft: string;
    pinRight: string;
    autosizeColumn: string;
    autosizeAll: string;
    filter: string;
    hideColumn: string;
  };
  filter: {
    values: string;
    condition: string;
    searchPlaceholder: string;
    selectAll: string;
    clear: string;
    apply: string;
    noValues: string;
    operators: {
      contains: string;
      equals: string;
      startsWith: string;
      endsWith: string;
      greaterThan: string;
      lessThan: string;
      between: string;
      after: string;
      before: string;
    };
    boolean: {
      true: string;
      false: string;
    };
    placeholder: {
      value: string;
      select: string;
    };
    blank: string;
    advancedFilter: string;
  };
  overlay: {
    loading: string;
    noRows: string;
  };
}
```

---

## Locale Customizado

Criar um locale completo ou parcial.

### Completo

```typescript
import type { FiboGridLocale } from 'fibogrid';

const meuLocale: FiboGridLocale = {
  toolbar: {
    searchPlaceholder: 'Pesquisar...',
    columns: 'Colunas',
    showAll: 'Mostrar todas',
    hideAll: 'Esconder todas',
    copy: 'Copiar',
    copied: 'Copiado!',
    export: 'Exportar',
    activeFilters: 'Filtros ativos:',
    resetAll: 'Limpar todos',
    toggleColumns: 'Alternar colunas',
    selectedCount: (sel, total) => `${sel} de ${total} selecionados`,
    filterLabel: (col, val) => `${col}: ${val}`,
    filterLabelCount: (col, count) => `${col}: ${count} selecionados`,
  },
  pagination: {
    rowsPerPage: 'Linhas por pagina:',
    pageInfo: (start, end, total) => `${start}-${end} de ${total}`,
    zeroRows: '0 linhas',
    pageOf: (current, total) => `Pagina ${current} de ${total}`,
  },
  statusBar: {
    rows: 'linhas',
    selected: (count) => `${count} selecionados`,
    totalRows: (count) => `de ${count}`,
    aggregations: { sum: 'Soma', avg: 'Media', min: 'Min', max: 'Max', count: 'Qtd' },
  },
  columnMenu: {
    sortAsc: 'Ordenar crescente',
    sortDesc: 'Ordenar decrescente',
    pinColumn: 'Fixar coluna',
    noPin: 'Nao fixar',
    pinLeft: 'Fixar a esquerda',
    pinRight: 'Fixar a direita',
    autosizeColumn: 'Ajustar largura',
    autosizeAll: 'Ajustar todas',
    filter: 'Filtrar...',
    hideColumn: 'Esconder coluna',
  },
  filter: {
    values: 'Valores',
    condition: 'Condicao',
    searchPlaceholder: 'Pesquisar...',
    selectAll: '(Selecionar todos)',
    clear: 'Limpar',
    apply: 'Aplicar',
    noValues: 'Nenhum valor encontrado',
    operators: {
      contains: 'Contem',
      equals: 'Igual a',
      startsWith: 'Comeca com',
      endsWith: 'Termina com',
      greaterThan: 'Maior que',
      lessThan: 'Menor que',
      between: 'Entre',
      after: 'Depois de',
      before: 'Antes de',
    },
    boolean: { true: 'Sim', false: 'Nao' },
    placeholder: { value: 'Inserir valor...', select: 'Selecionar...' },
    blank: '(Vazio)',
    advancedFilter: 'Filtro avancado',
  },
  overlay: {
    loading: 'Carregando...',
    noRows: 'Nenhuma linha para exibir',
  },
};
```

### Parcial (Extend)

```typescript
import { ptBR } from 'fibogrid';

const meuPtBR: FiboGridLocale = {
  ...ptBR,
  overlay: {
    ...ptBR.overlay,
    noRows: 'Sem resultados para esta pesquisa',
  },
};
```
