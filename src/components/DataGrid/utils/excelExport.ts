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

  // Filter columns if specific keys provided
  const exportColumns = columnKeys
    ? columns.filter((c) => columnKeys.includes(c.field))
    : columns.filter((c) => !c.hide);

  // Prepare data
  const data: any[][] = [];

  // Add header row
  if (!skipHeader) {
    data.push(exportColumns.map((col) => col.headerName));
  }

  // Add data rows
  rows.forEach((row) => {
    const rowData = exportColumns.map((col) => {
      const value = (row.data as any)[col.field];
      
      // Apply value formatter if available
      if (col.valueFormatter) {
        return col.valueFormatter(value, row.data);
      }
      
      return value;
    });
    data.push(rowData);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = exportColumns.map((col) => ({
    wch: Math.max(col.headerName.length, 15),
  }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Save file
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
  // For basic export, use the simple function
  // For styled export, you would need xlsx-style or similar
  exportToExcel(rows, columns, params);
}
