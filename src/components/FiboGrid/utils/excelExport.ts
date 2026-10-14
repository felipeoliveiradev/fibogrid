import { RowNode, ProcessedColumn } from '../types';
const PLAIN_NUMBER_REST = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
function neutralizeFormula(value: any): any {
  if (typeof value !== 'string') return value;
  if (value.length === 0) return value;
  const first = value.charAt(0);
  if (first === '=' || first === '@' || first === '\t' || first === '\r') {
    return `'${value}`;
  }
  if ((first === '+' || first === '-') && !PLAIN_NUMBER_REST.test(value.slice(1))) {
    return `'${value}`;
  }
  return value;
}
interface ExcelExportParams {
  fileName?: string;
  sheetName?: string;
  columnKeys?: string[];
  onlySelected?: boolean;
  skipHeader?: boolean;
}
export async function exportToExcel<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params: ExcelExportParams = {}
): Promise<void> {
  const {
    fileName = 'export.xlsx',
    sheetName = 'Sheet1',
    columnKeys,
    skipHeader = false,
  } = params;
  const exportColumns = columnKeys
    ? columns.filter((c) => columnKeys.includes(c.field))
    : columns.filter((c) => !c.hide);
  const data: any[][] = [];
  if (!skipHeader) {
    data.push(exportColumns.map((col) => neutralizeFormula(col.headerName)));
  }
  rows.forEach((row) => {
    const rowData = exportColumns.map((col) => {
      const value = (row.data as any)[col.field];
      const formatted = col.valueFormatter ? col.valueFormatter(value, row.data) : value;
      return neutralizeFormula(formatted);
    });
    data.push(rowData);
  });
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet(data);
  const colWidths = exportColumns.map((col) => ({
    wch: Math.max(col.headerName.length, 15),
  }));
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
export function exportToExcelWithStyles<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params: ExcelExportParams & {
    headerStyle?: any;
    cellStyle?: any;
  } = {}
): Promise<void> {
  return exportToExcel(rows, columns, params);
}
