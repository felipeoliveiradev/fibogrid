import * as XLSX from 'xlsx';
import { RowNode, ProcessedColumn } from '../types';

interface ExcelExportParams {
  fileName?: string;
  sheetName?: string;
  columnKeys?: string[];
  onlySelected?: boolean;
  skipHeader?: boolean;
}

export function exportToExcel<T>(
  rows: RowNode<T>[],
  columns: ProcessedColumn<T>[],
  params: ExcelExportParams = {}
): void {
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
    data.push(exportColumns.map((col) => col.headerName));
  }


  rows.forEach((row) => {
    const rowData = exportColumns.map((col) => {
      const value = (row.data as any)[col.field];
      

      if (col.valueFormatter) {
        return col.valueFormatter(value, row.data);
      }
      
      return value;
    });
    data.push(rowData);
  });


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
): void {


  exportToExcel(rows, columns, params);
}
