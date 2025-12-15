export interface FiboGridLocale {
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
        }
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
