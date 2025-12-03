import React from 'react';
import { Loader2 } from 'lucide-react';

interface GridOverlayProps {
  type: 'loading' | 'noRows';
  customComponent?: React.ReactNode;
}

export function GridOverlay({ type, customComponent }: GridOverlayProps) {
  if (customComponent) {
    return <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">{customComponent}</div>;
  }

  if (type === 'loading') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">No rows to display</span>
      </div>
    </div>
  );
}
