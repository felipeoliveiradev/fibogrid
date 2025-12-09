import { FiboGrid } from '@/components/FiboGrid';
import { ColumnDef } from '@/components/FiboGrid/types';

interface Product {
  id: string;
  name: string;
  category: string;
  status: string;
  price: number;
}

const products: Product[] = [
  { id: '1', name: 'Laptop', category: 'Electronics', status: 'Active', price: 999 },
  { id: '2', name: 'Phone', category: 'Electronics', status: 'Active', price: 699 },
  { id: '3', name: 'Desk', category: 'Furniture', status: 'Discontinued', price: 299 },
];

const columns: ColumnDef<Product>[] = [
  { field: 'name', headerName: 'Name', filterable: true },
  { field: 'category', headerName: 'Category', filterable: true },
  { field: 'status', headerName: 'Status', filterable: true },
  { field: 'price', headerName: 'Price', filterable: true },
];

/**
 * EXEMPLO 1: Sem filterValues (comportamento padrão)
 * O grid extrai automaticamente os valores únicos dos dados exibidos
 */
export function AutoFilterExample() {
  return (
    <FiboGrid
      rowData={products}
      columnDefs={columns}
      enableFilterValueVirtualization={true}
    />
  );
}

/**
 * EXEMPLO 2: Com filterValues customizado para algumas colunas
 * Útil quando você quer:
 * - Mostrar valores específicos mesmo que não existam nos dados atuais
 * - Ordenar os valores de forma customizada
 * - Limitar as opções disponíveis
 */
export function CustomFilterExample() {
  const customFilterValues = {
    // Define valores fixos para status
    status: ['Active', 'Inactive', 'Discontinued', 'Coming Soon'],
    
    // Define categorias predefinidas
    category: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports'],
    
    // Para 'name' e 'price', não especificamos - grid extrai dos dados
  };

  return (
    <FiboGrid
      rowData={products}
      columnDefs={columns}
      filterValues={customFilterValues}
      enableFilterValueVirtualization={true}
    />
  );
}

/**
 * EXEMPLO 3: Server-side com filterValues
 * Para server-side pagination, você pode passar os valores do servidor
 */
export function ServerSideFilterExample() {
  // Valores vindos do servidor (pode ser de um endpoint /api/filter-options)
  const serverFilterValues = {
    category: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Toys', 'Garden'],
    status: ['Active', 'Inactive', 'Discontinued', 'Coming Soon', 'Pre-order'],
  };

  return (
    <FiboGrid
      rowData={[]} // Vazio em server-side
      columnDefs={columns}
      pagination={true}
      paginationMode="server"
      serverSideDataSource={{
        async getRows(request) {
          const response = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(request),
          });
          return response.json();
        },
      }}
      filterValues={serverFilterValues}
      enableFilterValueVirtualization={true}
    />
  );
}

/**
 * EXEMPLO 4: Valores dinâmicos baseados em estado
 * Útil quando os valores do filtro mudam com base em outras seleções
 */
export function DynamicFilterExample() {
  const [selectedRegion, setSelectedRegion] = React.useState<string>('US');

  // Valores de filtro mudam baseado na região selecionada
  const dynamicFilterValues = React.useMemo(() => {
    if (selectedRegion === 'US') {
      return {
        category: ['Electronics', 'Furniture', 'Clothing'],
        status: ['Active', 'Discontinued'],
      };
    } else if (selectedRegion === 'EU') {
      return {
        category: ['Electronics', 'Books', 'Sports'],
        status: ['Active', 'Pre-order'],
      };
    }
    return {};
  }, [selectedRegion]);

  return (
    <>
      <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
        <option value="US">United States</option>
        <option value="EU">Europe</option>
      </select>

      <FiboGrid
        rowData={products}
        columnDefs={columns}
        filterValues={dynamicFilterValues}
        enableFilterValueVirtualization={true}
      />
    </>
  );
}

/**
 * EXEMPLO 5: Performance com muitos valores
 * Com virtualização habilitada, você pode ter milhares de valores únicos
 */
export function LargeFilterExample() {
  // Simula 10000 valores únicos
  const largeFilterValues = {
    name: Array.from({ length: 10000 }, (_, i) => `Product ${i + 1}`),
  };

  return (
    <FiboGrid
      rowData={products}
      columnDefs={columns}
      filterValues={largeFilterValues}
      enableFilterValueVirtualization={true} // IMPORTANTE para performance
    />
  );
}

/**
 * NOTAS:
 * 
 * 1. filterValues é opcional - se não passar, o grid extrai dos dados
 * 
 * 2. Formato: Record<string, any[]>
 *    - Chave: nome do campo (column.field)
 *    - Valor: array de valores possíveis
 * 
 * 3. Campos não especificados em filterValues usam extração automática
 * 
 * 4. Com enableFilterValueVirtualization={true}, recomendado para > 1000 valores
 * 
 * 5. Em server-side mode, filterValues é especialmente útil para
 *    mostrar todas as opções disponíveis no servidor, não apenas os dados
 *    da página atual
 */
