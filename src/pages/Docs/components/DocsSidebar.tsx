import React from 'react';
import { cn } from '@/lib/utils';
import {
    Book, Code, Layout, Layers, Database, Shield, Zap, Terminal, Command
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export type DocSection =
    | 'intro' | 'install' | 'quick-start'
    | 'columns' | 'rows' | 'styling'
    | 'filtering' | 'sorting' | 'pagination' | 'selection'
    | 'editing' | 'server-side' | 'performance'
    | 'security' | 'registry' | 'hooks'
    | 'api-grid' | 'api-manager' | 'api-events' | 'api-interfaces'
    | 'advanced-selection' | 'column-management' | 'editing-advanced'
    | 'params-builder' | 'transaction-system';

interface NavGroup {
    title: string;
    icon: React.ElementType;
    items: { id: DocSection; label: string }[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Getting Started',
        icon: Book,
        items: [
            { id: 'intro', label: 'Introduction' },
            { id: 'install', label: 'Installation' },
            { id: 'quick-start', label: 'Quick Start' },
        ]
    },
    {
        title: 'Core Concepts',
        icon: Layout,
        items: [
            { id: 'columns', label: 'Columns & Definitions' },
            { id: 'rows', label: 'Rows & Data' },
            { id: 'styling', label: 'Styling & Theming' },
        ]
    },
    {
        title: 'Data Features',
        icon: Database,
        items: [
            { id: 'filtering', label: 'Filtering' },
            { id: 'sorting', label: 'Sorting' },
            { id: 'pagination', label: 'Pagination' },
            { id: 'selection', label: 'Selection' },
        ]
    },
    {
        title: 'Advanced',
        icon: Zap,
        items: [
            { id: 'editing', label: 'Editing' },
            { id: 'server-side', label: 'Server-Side Data' },
            { id: 'performance', label: 'Performance' },
        ]
    },
    {
        title: 'Enterprise',
        icon: Shield,
        items: [
            { id: 'security', label: 'Security' },
            { id: 'registry', label: 'Grid Registry' },
            { id: 'hooks', label: 'Hooks & Headless' },
        ]
    },
    {
        title: 'Advanced Topics',
        icon: Zap,
        items: [
            { id: 'advanced-selection', label: 'Advanced Selection' },
            { id: 'column-management', label: 'Column Management' },
            { id: 'editing-advanced', label: 'Advanced Editing' },
        ]
    },
    {
        title: 'API Reference',
        icon: Terminal,
        items: [
            { id: 'api-grid', label: 'Grid API' },
            { id: 'api-manager', label: 'Manager API' },
            { id: 'api-events', label: 'Events' },
            { id: 'api-interfaces', label: 'Interfaces' },
        ]
    },
    {
        title: 'Internals',
        icon: Code,
        items: [
            { id: 'params-builder', label: 'Params Builder' },
            { id: 'transaction-system', label: 'Transaction System' },
        ]
    }
];

interface DocsSidebarProps {
    activeSection: DocSection;
    onNavigate: (section: DocSection) => void;
    className?: string;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({ activeSection, onNavigate, className }) => {
    return (
        <aside className={cn("w-64 shrink-0 hidden lg:block border-r border-primary/10 h-[calc(100vh-4rem)] sticky top-16", className)}>
            <ScrollArea className="h-full py-6 pr-4">
                <nav className="space-y-6">
                    {navGroups.map((group) => (
                        <div key={group.title}>
                            <h4 className="mb-2 px-2 text-sm font-semibold text-primary flex items-center gap-2">
                                <group.icon className="h-4 w-4" />
                                {group.title}
                            </h4>
                            <ul className="space-y-1">
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => onNavigate(item.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                                                activeSection === item.id
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </ScrollArea>
        </aside>
    );
};
