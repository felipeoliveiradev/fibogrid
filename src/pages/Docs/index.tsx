import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Hexagon } from 'lucide-react';

import { DocsSidebar } from './components/DocsSidebar';

// Sections
import { Setup } from './sections/Setup';
import { GridConfig } from './sections/GridConfig';
import { Features } from './sections/Features';
import { Advanced } from './sections/Advanced';
import { Styling } from './sections/Styling';
import { Filtering } from './sections/Filtering';
import { ServerSide } from './sections/ServerSide';
import { VisualCustomization } from './sections/VisualCustomization';
import { Localization } from './sections/Localization';

// FiboGrid Logo Component
const FiboLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(42 70% 55%)" />
        <stop offset="50%" stopColor="hsl(40 65% 45%)" />
        <stop offset="100%" stopColor="hsl(38 60% 35%)" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="34" height="34" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="2" />
    <rect x="44" y="10" width="21" height="21" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1" />
    <rect x="44" y="31" width="13" height="13" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1" />
    <rect x="57" y="31" width="8" height="8" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1" />
    <rect x="10" y="50" width="55" height="40" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="3" />
    <line x1="10" y1="60" x2="65" y2="60" stroke="url(#goldGradient)" strokeWidth="1.5" />
    <line x1="10" y1="70" x2="65" y2="70" stroke="url(#goldGradient)" strokeWidth="1" />
    <line x1="10" y1="80" x2="65" y2="80" stroke="url(#goldGradient)" strokeWidth="1" />
    <line x1="30" y1="50" x2="30" y2="90" stroke="url(#goldGradient)" strokeWidth="1" />
    <line x1="50" y1="50" x2="50" y2="90" stroke="url(#goldGradient)" strokeWidth="1" />
    <circle cx="80" cy="70" r="12" stroke="url(#goldGradient)" strokeWidth="2" fill="none" />
    <circle cx="80" cy="70" r="7" stroke="url(#goldGradient)" strokeWidth="1.5" fill="hsl(40 65% 45% / 0.2)" />
  </svg>
);

export default function Docs() {
  const [activeSection, setActiveSection] = useState('installation');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Texture overlay */}
      <div className="fixed inset-0 texture-overlay pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <FiboLogo className="h-8 w-8" />
              <span className="font-display font-bold text-xl">FiboGrid</span>
              <Badge className="bg-primary/10 text-primary border-primary/30 font-body text-xs px-2 py-0.5">Beta</Badge>
            </Link>
            <Badge className="bg-primary/10 text-primary border-primary/30 font-body">
              <Hexagon className="h-3 w-3 mr-1" />
              Documentation
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-body hover:bg-primary/5" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="font-body hover:bg-primary/5" asChild>
              <Link to="/changelog">
                Changelog
              </Link>
            </Button>
            <ThemeToggle />
            <Button size="sm" className="bg-gradient-gold text-primary-foreground shadow-gold font-body" asChild>
              <Link to="/demo">Live Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <DocsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

          {/* Content */}
          <main className="min-w-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="prose prose-neutral dark:prose-invert max-w-none pr-4">

                <Setup activeSection={activeSection} />

                {activeSection === 'filtering' && <Filtering />}

                {activeSection === 'server-side' && <ServerSide />}

                {activeSection === 'visual-customization' && <VisualCustomization />}

                {activeSection === 'localization' && <Localization />}

                <GridConfig activeSection={activeSection} />

                <Features activeSection={activeSection} />

                <Advanced activeSection={activeSection} />

                <Styling activeSection={activeSection} />

              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
}
