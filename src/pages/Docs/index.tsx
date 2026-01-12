import { useState } from 'react';
import { DocsLayout } from './components/DocsLayout';
import { DocSection } from './components/DocsSidebar';

// Sections (Placeholders for now)
import { Introduction } from './sections/Introduction';
import { Installation } from './sections/Installation';
import { QuickStart } from './sections/QuickStart';
// Core
import { Columns } from './sections/Columns';
import { Rows } from './sections/Rows';
import { Styling } from './sections/Styling';
// Data
import { Filtering } from './sections/Filtering';
import { Sorting } from './sections/Sorting';
import { Pagination } from './sections/Pagination';
import { Selection } from './sections/Selection';
// Advanced
import { Editing } from './sections/Editing';
import { ServerSide } from './sections/ServerSide';
import { Performance } from './sections/Performance';
// Enterprise
import { Security } from './sections/Security';
import { Registry } from './sections/Registry';
import { Hooks } from './sections/Hooks';
// API
import { GridApi } from './sections/GridApi';
import { Manager } from './sections/Manager';
import { Events } from './sections/Events';
import { Interfaces } from './sections/Interfaces';
// Advanced Topics
import { AdvancedSelection } from './sections/AdvancedSelection';
import { ColumnManagement } from './sections/ColumnManagement';
import { EditingAdvanced } from './sections/EditingAdvanced';
// Internals
import { ParamsBuilder } from './sections/ParamsBuilder';
import { TransactionSystem } from './sections/TransactionSystem';

export default function Docs() {
    const [activeSection, setActiveSection] = useState<DocSection>('intro');

    const renderSection = () => {
        switch (activeSection) {
            case 'intro': return <Introduction />;
            case 'install': return <Installation />;
            case 'quick-start': return <QuickStart />;

            case 'columns': return <Columns />;
            case 'rows': return <Rows />;
            case 'styling': return <Styling />;

            case 'filtering': return <Filtering />;
            case 'sorting': return <Sorting />;
            case 'pagination': return <Pagination />;
            case 'selection': return <Selection />;

            case 'editing': return <Editing />;
            case 'server-side': return <ServerSide />;
            case 'performance': return <Performance />;

            case 'security': return <Security />;
            case 'registry': return <Registry />;
            case 'hooks': return <Hooks />;

            case 'api-grid': return <GridApi />;
            case 'api-manager': return <Manager />;
            case 'api-events': return <Events />;
            case 'api-interfaces': return <Interfaces />;

            case 'advanced-selection': return <AdvancedSelection />;
            case 'column-management': return <ColumnManagement />;
            case 'editing-advanced': return <EditingAdvanced />;

            case 'params-builder': return <ParamsBuilder />;
            case 'transaction-system': return <TransactionSystem />;

            default: return <Introduction />;
        }
    };

    return (
        <DocsLayout activeSection={activeSection} onNavigate={setActiveSection}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderSection()}
            </div>
        </DocsLayout>
    );
}
