export const GridPermissions = {
    Manager: {
        Reset: 'manager.reset',
        Add: 'manager.add',
        Remove: 'manager.remove',
        Update: 'manager.update',
        ReplaceAll: 'manager.replaceAll',
        ResetEdits: 'manager.resetEdits',
        Execute: 'manager.execute',
        All: 'manager.*'
    },
    API: {
        GetSelectedRows: 'api.getSelectedRows',
        SelectAll: 'api.selectAll',
        DeselectAll: 'api.deselectAll',
        SetPage: 'api.setPage',
        SetFilterModel: 'api.setFilterModel',
        GetFilterModel: 'api.getFilterModel',
        SetSortModel: 'api.setSortModel',
        GetSortModel: 'api.getSortModel',
        All: 'api.*'
    },
    Events: {
        SelectionChanged: 'onSelectionChanged',
        FilterChanged: 'onFilterChanged',
        SortChanged: 'onSortChanged',
        CellValueChanged: 'onCellValueChanged',
        RowClicked: 'onRowClicked',
        All: 'on*'
    }
} as const;

export type GridPermissionType = typeof GridPermissions;
