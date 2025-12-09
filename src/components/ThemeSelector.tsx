import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';

// Import theme CSS files statically - Vite will handle the paths correctly
import '../themes/compact.css';
import '../themes/comfortable.css';
import '../themes/material.css';
import '../themes/minimal.css';
import '../themes/dark-modern.css';
import '../themes/light-airy.css';
import '../themes/warm-sunset.css';

export const themes = [
  { value: 'theme-default', label: 'Default (Golden Ratio)' },
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
  const [selectedTheme, setSelectedTheme] = useState('theme-default');

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
