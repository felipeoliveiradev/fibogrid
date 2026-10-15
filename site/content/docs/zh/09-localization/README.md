# 09 - 本地化

## 位置

```
src/components/FiboGrid/locales/
```

---

## 支持的语言

| Locale | 语言 | 导入 |
|--------|------|------|
| `enUS` | 英语（美国） | `import { enUS } from 'fibogrid'` |
| `ptBR` | 葡萄牙语（巴西） | `import { ptBR } from 'fibogrid'` |
| `esES` | 西班牙语 | `import { esES } from 'fibogrid'` |
| `frFR` | 法语 | `import { frFR } from 'fibogrid'` |
| `jaJP` | 日语 | `import { jaJP } from 'fibogrid'` |
| `zhCN` | 简体中文 | `import { zhCN } from 'fibogrid'` |
| `ruRU` | 俄语 | `import { ruRU } from 'fibogrid'` |
| `caES` | 加泰罗尼亚语 | `import { caES } from 'fibogrid'` |
| `koKR` | 韩语 | `import { koKR } from 'fibogrid'` |

---

## 用法

```tsx
import { FiboGrid, ptBR } from 'fibogrid';

<FiboGrid
  lang={ptBR}
  rowData={dados}
  columnDefs={colunas}
/>
```

---

## FiboGridLocale 接口

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

## 自定义 Locale

创建完整或部分的 locale。

### 完整

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

### 部分（扩展）

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
