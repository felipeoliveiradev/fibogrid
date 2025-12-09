import React from 'react';
import { Loader2 } from 'lucide-react';

interface GridOverlayProps {
  type: 'loading' | 'noRows';
  customComponent?: React.ReactNode;
  headerHeight?: number;
  toolbarHeight?: number;
  filterRowHeight?: number;
}

export function GridOverlay({ type, customComponent, headerHeight = 44, toolbarHeight = 0, filterRowHeight = 0 }: GridOverlayProps) {

  const topOffset = toolbarHeight + headerHeight + filterRowHeight;
  
  const overlayStyle: React.CSSProperties = {
    top: `${topOffset}px`,
    left: 'var(--fibogrid-overlay-left)',
    right: 'var(--fibogrid-overlay-right)',
    bottom: 'var(--fibogrid-overlay-bottom)',
  };

  if (customComponent) {
    return (
      <div 
        className="absolute flex items-center justify-center z-10 fibogrid-overlay" 
        style={overlayStyle}
      >
        {customComponent}
      </div>
    );
  }

  if (type === 'loading') {
    return (
      <div 
        className="absolute flex items-center justify-center z-10 fibogrid-overlay" 
        style={overlayStyle}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--fibogrid-primary))]" />
          <span className="text-sm text-[color:var(--fibogrid-text-muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute flex items-center justify-center z-10 fibogrid-overlay" 
      style={overlayStyle}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-[color:var(--fibogrid-text-muted)]">No rows to display</span>
      </div>
    </div>
  );
}
