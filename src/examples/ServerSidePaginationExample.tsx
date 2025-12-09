import { DataGrid } from '@/components/DataGrid';
import { ColumnDef, ServerSideDataSource, ServerSideDataSourceRequest, ServerSideDataSourceResponse } from '@/components/DataGrid/types';

interface MyData {
  id: string;
  name: string;
  value: number;
}

// Exemplo de como implementar o data source para server-side pagination
const serverSideDataSource: ServerSideDataSource<MyData> = {
  async getRows(request: ServerSideDataSourceRequest): Promise<ServerSideDataSourceResponse<MyData>> {
    // Monta os parâmetros da requisição
    const params = new URLSearchParams({
      page: request.page.toString(),
      pageSize: request.pageSize.toString(),
      // Adiciona sort se houver
      ...(request.sortModel.length > 0 && {
        sortField: request.sortModel[0].field,
        sortOrder: request.sortModel[0].direction || 'asc',
      }),
      // Adiciona filtro se houver
      ...(request.quickFilterText && {
        search: request.quickFilterText,
      }),
    });

    // Faz a requisição para o backend
    const response = await fetch(`/api/data?${params}`);
    const json = await response.json();

    // Retorna no formato esperado
    return {
      data: json.items,           // Array de dados da página atual
      totalRows: json.total,      // Total de registros no backend
      page: json.page,            // Página atual
      pageSize: json.pageSize,   // Tamanho da página
    };
  },
};

// Definição das colunas
const columns: ColumnDef<MyData>[] = [
  { field: 'id', headerName: 'ID', sortable: true },
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'value', headerName: 'Value', sortable: true },
];

export function ServerSidePaginationExample() {
  return (
    <DataGrid
      rowData={[]} // Vazio porque os dados vêm do server
      columnDefs={columns}
      pagination={true}
      paginationMode="server"
      paginationPageSize={25}
      paginationPageSizeOptions={[25, 50, 100]}
      serverSideDataSource={serverSideDataSource}
      loading={false} // Controle de loading baseado no estado da requisição
    />
  );
}

/**
 * FORMATO ESPERADO DO BACKEND:
 * 
 * GET /api/data?page=0&pageSize=25&sortField=name&sortOrder=asc&search=test
 * 
 * Response:
 * {
 *   "items": [
 *     { "id": "1", "name": "Item 1", "value": 100 },
 *     { "id": "2", "name": "Item 2", "value": 200 },
 *     ...
 *   ],
 *   "total": 1000,      // Total de registros
 *   "page": 0,          // Página atual (0-indexed)
 *   "pageSize": 25      // Tamanho da página
 * }
 * 
 * VARIAÇÕES COMUNS DE FORMATO:
 * 
 * 1. Laravel/PHP (com links):
 * {
 *   "data": [...],
 *   "total": 1000,
 *   "per_page": 25,
 *   "current_page": 1,  // 1-indexed
 *   "last_page": 40
 * }
 * 
 * 2. Spring Boot/Java:
 * {
 *   "content": [...],
 *   "totalElements": 1000,
 *   "size": 25,
 *   "number": 0,        // 0-indexed
 *   "totalPages": 40
 * }
 * 
 * 3. ASP.NET:
 * {
 *   "items": [...],
 *   "totalCount": 1000,
 *   "pageSize": 25,
 *   "pageNumber": 1,    // 1-indexed
 *   "totalPages": 40
 * }
 * 
 * ADAPTER PARA DIFERENTES FORMATOS:
 */

// Adapter para Laravel
export const laravelDataSource: ServerSideDataSource<MyData> = {
  async getRows(request) {
    const response = await fetch(`/api/data?page=${request.page + 1}&per_page=${request.pageSize}`);
    const json = await response.json();
    
    return {
      data: json.data,
      totalRows: json.total,
      page: json.current_page - 1, // Converte de 1-indexed para 0-indexed
      pageSize: json.per_page,
    };
  },
};

// Adapter para Spring Boot
export const springBootDataSource: ServerSideDataSource<MyData> = {
  async getRows(request) {
    const response = await fetch(`/api/data?page=${request.page}&size=${request.pageSize}`);
    const json = await response.json();
    
    return {
      data: json.content,
      totalRows: json.totalElements,
      page: json.number,
      pageSize: json.size,
    };
  },
};

// Adapter para ASP.NET
export const aspNetDataSource: ServerSideDataSource<MyData> = {
  async getRows(request) {
    const response = await fetch(`/api/data?pageNumber=${request.page + 1}&pageSize=${request.pageSize}`);
    const json = await response.json();
    
    return {
      data: json.items,
      totalRows: json.totalCount,
      page: json.pageNumber - 1, // Converte de 1-indexed para 0-indexed
      pageSize: json.pageSize,
    };
  },
};
