import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';

export const themes = [
  { value: '', label: 'Default (Golden Ratio)' },
  { value: 'theme-compact', label: 'Compact' },
  { value: 'theme-comfortable', label: 'Comfortable' },
  { value: 'theme-material', label: 'Material Design' },
  { value: 'theme-minimal', label: 'Minimal' },
  { value: 'theme-dark-modern', label: 'Dark Modern' },
  { value: 'theme-light-airy', label: 'Light Airy' },
  { value: 'theme-warm-sunset', label: 'Warm Sunset' },
];

interface ThemeSelectorProps {
  onThemeChange?: (theme: string) => void;
  className?: string;
}

export function ThemeSelector({ onThemeChange, className = '' }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    // Load theme CSS files dynamically
    const themeFiles = [
      '/src/themes/compact.css',
      '/src/themes/comfortable.css',
      '/src/themes/material.css',
      '/src/themes/minimal.css',
      '/src/themes/dark-modern.css',
      '/src/themes/light-airy.css',
      '/src/themes/warm-sunset.css',
    ];

    themeFiles.forEach(file => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = file;
      document.head.appendChild(link);
    });
  }, []);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Palette className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedTheme} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map(theme => (
            <SelectItem key={theme.value} value={theme.value}>
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
