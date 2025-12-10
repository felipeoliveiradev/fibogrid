import { useState, useCallback } from 'react';
import { FiboGrid } from 'fibogrid';
import { ColumnDef } from 'fibogrid';

interface SimpleRow {
  id: string;
  name: string;
  value: number;
}

export default function EditTest() {
  const [rowData, setRowData] = useState<SimpleRow[]>([
    { id: '1', name: 'Item 1', value: 100 },
    { id: '2', name: 'Item 2', value: 200 },
    { id: '3', name: 'Item 3', value: 300 },
  ]);

  const columns: ColumnDef<SimpleRow>[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'value', headerName: 'Value', width: 150, editable: true, cellEditor: 'number' },
  ];

  const getRowId = useCallback((row: SimpleRow) => row.id, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Test</h1>
      <p className="mb-4">Double-click on Name or Value to edit. Press Enter to save.</p>
      
      <div className="mb-4 p-4 bg-muted rounded">
        <h2 className="font-semibold mb-2">Current Data:</h2>
        <pre>{JSON.stringify(rowData, null, 2)}</pre>
      </div>

      <FiboGrid
        rowData={rowData}
        columnDefs={columns}
        getRowId={getRowId}
        height={300}
        showToolbar={false}
        showStatusBar={false}
        onCellValueChanged={(e) => {
          console.log('[EditTest] onCellValueChanged:', {
            field: e.column.field,
            oldValue: e.oldValue,
            newValue: e.newValue,
            rowId: e.rowNode.id,
          });
          
          const field = e.column.field as keyof SimpleRow;
          const newValue = e.newValue;
          const rowId = e.rowNode.id;
          
          setRowData(prev => {
            const updated = prev.map(row => 
              row.id === rowId ? { ...row, [field]: newValue } : row
            );
            console.log('[EditTest] Updated rowData:', updated);
            return updated;
          });
        }}
      />
    </div>
  );
}
