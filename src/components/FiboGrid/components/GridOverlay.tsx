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
  
  const overlayStyle = {
    top: `${topOffset}px`,
    left: 0,
    right: 0,
    bottom: 0,
  };

  if (customComponent) {
    return (
      <div 
        className="absolute flex items-center justify-center bg-background/80 z-10" 
        style={overlayStyle}
      >
        {customComponent}
      </div>
    );
  }

  if (type === 'loading') {
    return (
      <div 
        className="absolute flex items-center justify-center bg-background/80 z-10" 
        style={overlayStyle}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute flex items-center justify-center bg-background/50 z-10" 
      style={overlayStyle}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">No rows to display</span>
      </div>
    </div>
  );
}
