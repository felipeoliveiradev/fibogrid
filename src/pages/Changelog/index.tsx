import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Github,
  ArrowLeft,
  Calendar,
  Tag,
  Sparkles,
  Wrench,
  Bug,
  FileText,
  Hexagon
} from 'lucide-react';
// @ts-ignore
import changelogMd from '../../../CHANGELOG.md?raw';

// Types for parsed changelog
interface Release {
  version: string;
  date: string;
  sections: ReleaseSection[];
}

interface ReleaseSection {
  type: 'Added' | 'Changed' | 'Fixed' | 'Removed' | 'Documentation' | 'Security' | 'Deprecated' | string;
  items: string[];
}

// Logo Component (reused from Home)
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
    <rect x="57" y="39" width="5" height="5" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="0.5" />
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

const parseChangelog = (md: string): Release[] => {
  const lines = md.split('\n');
  const releases: Release[] = [];
  let currentRelease: Release | null = null;
  let currentSection: ReleaseSection | null = null;

  // Regex helpers
  const releaseRegex = /^## \[(.+?)\] - (\d{4}-\d{2}-\d{2})/;
  const sectionRegex = /^### (.+)/;
  const itemRegex = /^-\s+(.+)/;

  lines.forEach(line => {
    // Match Release Header: ## [1.0.0] - 2024-01-01
    const releaseMatch = line.match(releaseRegex);
    if (releaseMatch) {
      if (currentRelease) {
        if (currentSection) {
          currentRelease.sections.push(currentSection);
          currentSection = null;
        }
        releases.push(currentRelease);
      }
      currentRelease = {
        version: releaseMatch[1],
        date: releaseMatch[2],
        sections: []
      };
      return;
    }

    // Match Section Header: ### Added
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch && currentRelease) {
      if (currentSection) {
        currentRelease.sections.push(currentSection);
      }
      currentSection = {
        type: sectionMatch[1].trim(),
        items: []
      };
      return;
    }

    // Match List Item: - Feature description
    const itemMatch = line.match(itemRegex);
    if (itemMatch && currentSection) {
      // Clean up markdown bold syntax if present
      let itemText = itemMatch[1];
      // Note: we'll render inner markdown (like **text**) in the UI component if needed, 
      // but simple string is fine for now.
      currentSection.items.push(itemText);
    }
  });

  // Push last release/section
  if (currentRelease) {
    if (currentSection) {
      currentRelease.sections.push(currentSection);
    }
    releases.push(currentRelease);
  }

  return releases;
};

const getSectionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'added': return <Sparkles className="h-4 w-4 text-green-500" />;
    case 'changed': return <FileText className="h-4 w-4 text-blue-500" />;
    case 'fixed': return <Bug className="h-4 w-4 text-red-500" />;
    case 'deprecated': return <Wrench className="h-4 w-4 text-amber-500" />;
    default: return <Tag className="h-4 w-4 text-gray-500" />;
  }
};

const getSectionColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'added': return 'text-green-600 dark:text-green-400';
    case 'changed': return 'text-blue-600 dark:text-blue-400';
    case 'fixed': return 'text-red-600 dark:text-red-400';
    case 'deprecated': return 'text-amber-600 dark:text-amber-400';
    default: return 'text-muted-foreground';
  }
};

export default function Changelog() {
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    const parsed = parseChangelog(changelogMd);
    setReleases(parsed);
  }, []);

  // Function to render markdown-like text (bold, code)
  const renderText = (text: string) => {
    // Replace **text** with <strong>text</strong>
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-primary/10 rounded text-sm font-mono text-primary">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <div className="fixed inset-0 texture-overlay pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 overflow-hidden border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <FiboLogo className="h-8 w-8" />
              <span className="text-xl font-display font-bold tracking-tight">FiboGrid</span>
              <Badge className="bg-primary/10 text-primary border-primary/30 font-body text-xs px-2 py-0.5">Beta</Badge>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Documentation
            </Link>
            <Link to="/demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Demo
            </Link>
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <a href="https://github.com/felipeoliveiradev/fibogrid" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/30 font-body">
            <Hexagon className="h-3 w-3 mr-2" />
            Product Updates
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
            <span className="text-gradient-gold">Changelog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Track the evolution of FiboGrid. New features, improvements, and fixes.
          </p>
        </div>

        <div className="space-y-12">
          {releases.map((release, i) => (
            <div
              key={release.version}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="grid md:grid-cols-[120px_1fr] gap-8 items-start">
                {/* Version & Date Column */}
                <div className="md:text-right md:sticky md:top-24">
                  <div className="font-display font-bold text-2xl text-foreground mb-1">
                    v{release.version}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center md:justify-end gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(release.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Content Column */}
                <Card className="paper-aged border-primary/10 shadow-parchment relative overflow-hidden transition-all duration-300 hover:shadow-gold hover:border-primary/30">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FiboLogo className="h-24 w-24 transform rotate-12" />
                  </div>

                  <CardContent className="p-6 md:p-8 space-y-8">
                    {release.sections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className={`flex items-center gap-2 font-display font-semibold text-lg mb-4 ${getSectionColor(section.type)}`}>
                          {getSectionIcon(section.type)}
                          {section.type}
                        </h3>
                        <ul className="space-y-3">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                              <span>{renderText(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {releases.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Loading updates...
          </div>
        )}
      </main>

      <footer className="border-t border-primary/10 py-12 mt-20 relative bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4 text-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FiboGrid. Released under MIT License.
          </div>
        </div>
      </footer>
    </div>
  );
}
