import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    BookOpen, Code, Zap, Settings, Layers, Filter, ArrowUpDown, Pin, Edit3,
    Download, Move, Package, Palette, Bell, Link2, Terminal, Server, List, Globe
} from 'lucide-react';

export const sections = [
    { id: 'installation', title: 'Installation', icon: Package },
    { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
    { id: 'basic-usage', title: 'Basic Usage', icon: Code },
    { id: 'columns', title: 'Column Definitions', icon: Layers },
    { id: 'sorting', title: 'Sorting', icon: ArrowUpDown },
    { id: 'filtering', title: 'Filtering', icon: Filter },
    { id: 'server-side', title: 'Server-Side Integration', icon: Server },
    { id: 'visual-customization', title: 'Visual Customization', icon: Palette }, // New
    { id: 'localization', title: 'Localization', icon: Globe }, // New
    { id: 'selection', title: 'Row Selection', icon: Settings },
    { id: 'editing', title: 'Inline Editing', icon: Edit3 },
    { id: 'pinning', title: 'Column Pinning', icon: Pin },
    { id: 'grouping', title: 'Row Grouping', icon: Layers },
    { id: 'drag-drop', title: 'Drag & Drop', icon: Move },
    { id: 'export', title: 'Export', icon: Download },
    { id: 'events', title: 'Events', icon: Bell },
    { id: 'context-menu', title: 'Context Menu', icon: List },
    { id: 'styling-validation', title: 'Styling & Validation', icon: Palette },
    { id: 'theming', title: 'Theming', icon: Palette },
    { id: 'linked-grids', title: 'Linked Grids', icon: Link2 },
    { id: 'performance', title: 'Performance', icon: Zap },
    { id: 'linked-grids', title: 'Linked Grids', icon: Link2 },
    { id: 'performance', title: 'Performance', icon: Zap },
    { id: 'api-manager', title: 'Manager API', icon: Terminal },
];

interface DocsSidebarProps {
    activeSection: string;
    setActiveSection: (id: string) => void;
}

export const DocsSidebar = ({ activeSection, setActiveSection }: DocsSidebarProps) => {
    return (
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <Card className="paper-aged border-primary/10 h-full">
                <ScrollArea className="h-full p-4">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 font-body ${activeSection === section.id
                                        ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                                        : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                                    }`}
                            >
                                <section.icon className="h-4 w-4" />
                                {section.title}
                            </button>
                        ))}
                    </nav>
                </ScrollArea>
            </Card>
        </aside>
    );
};
