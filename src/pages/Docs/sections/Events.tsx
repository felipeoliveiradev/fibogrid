import React from 'react';
import { ApiTable } from '../components/ApiTable';

export const Events = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Events</h1>
                <p className="text-lg text-muted-foreground">
                    Comprehensive list of events emitted by FiboGrid.
                </p>
            </div>

            <div className="space-y-4">
                <ApiTable items={[
                    { name: 'onGridReady', type: 'GridReadyEvent', description: 'Fired when the grid is fully initialized. Contains the API.' },
                    { name: 'onRowClicked', type: 'RowClickedEvent', description: 'Row was clicked.' },
                    { name: 'onRowDoubleClicked', type: 'RowDoubleClickedEvent', description: 'Row was double clicked.' },
                    { name: 'onRowSelected', type: 'RowSelectedEvent', description: 'A rows selection state changed.' },
                    { name: 'onSelectionChanged', type: 'SelectionChangedEvent', description: 'The set of selected rows has changed.' },
                    { name: 'onCellValueChanged', type: 'CellValueChangedEvent', description: 'A cell value was edited.' },
                    { name: 'onFilterChanged', type: 'FilterChangedEvent', description: 'Filter model changed.' },
                    { name: 'onSortChanged', type: 'SortChangedEvent', description: 'Sort model changed.' },
                    { name: 'onPaginationChanged', type: 'PaginationChangedEvent', description: 'Page or page size changed.' },
                ]} />
            </div>
        </div>
    );
};
