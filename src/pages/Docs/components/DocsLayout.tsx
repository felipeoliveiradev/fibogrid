import React, { useState, useEffect } from 'react';
import { DocsSidebar, DocSection } from './DocsSidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DocsLayoutProps {
    children: React.ReactNode;
    activeSection: DocSection;
    onNavigate: (section: DocSection) => void;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({ children, activeSection, onNavigate }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu on navigation
    useEffect(() => {
        setIsMobileOpen(false);
    }, [activeSection]);

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <DocsSidebar
                activeSection={activeSection}
                onNavigate={onNavigate}
                className="hidden lg:block pl-6"
            />

            {/* Content Area */}
            <main className="flex-1 min-w-0">
                <div className="lg:hidden flex items-center p-4 border-b border-primary/10">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72">
                            <div className="p-6">
                                <h2 className="font-display font-bold text-xl mb-6">Documentation</h2>
                                <DocsSidebar
                                    activeSection={activeSection}
                                    onNavigate={onNavigate}
                                    className="block border-none h-auto static w-full"
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="ml-4 font-semibold">Menu</span>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-10 lg:py-12">
                    {children}
                </div>
            </main>
        </div>
    );
};
