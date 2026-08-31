import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ContextMenuItem as ContextMenuItemType } from '../types';
import { ChevronRight } from 'lucide-react';

interface MenuPosition {
  x: number;
  y: number;
}

interface GridContextMenuProps {
  items: ContextMenuItemType[];
  position: MenuPosition | null;
  onClose: () => void;
  className?: string;
}

export function GridContextMenu({ items, position, onClose, className }: GridContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!position) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position !== null]);

  useEffect(() => {
    if (!position || !menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = position.x;
    let y = position.y;
    if (x + rect.width > vw) x = vw - rect.width - 4;
    if (y + rect.height > vh) y = vh - rect.height - 4;
    if (x < 0) x = 4;
    if (y < 0) y = 4;
    if (x !== position.x || y !== position.y) {
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [position]);

  if (!position || items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className
      )}
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => (
        <ContextMenuRow key={index} item={item} onClose={onClose} />
      ))}
    </div>
  );
}

function ContextMenuRow({ item, onClose }: { item: ContextMenuItemType; onClose: () => void }) {
  const [subOpen, setSubOpen] = React.useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  if (item.separator) {
    return <div className="-mx-1 my-1 h-px bg-border" />;
  }

  if (item.subMenu && item.subMenu.length > 0) {
    return (
      <div
        className="relative"
        onMouseEnter={() => {
          clearTimeout(timeoutRef.current);
          setSubOpen(true);
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => setSubOpen(false), 150);
        }}
      >
        <div
          className={cn(
            'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
            'hover:bg-accent hover:text-accent-foreground',
            item.disabled && 'pointer-events-none opacity-50'
          )}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.name}
          <ChevronRight className="ml-auto h-4 w-4" />
        </div>
        {subOpen && (
          <div className="absolute left-full top-0 z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            {item.subMenu.map((subItem, idx) => (
              <ContextMenuRow key={idx} item={subItem} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        item.disabled && 'pointer-events-none opacity-50'
      )}
      onClick={() => {
        if (item.disabled) return;
        item.action?.();
        onClose();
      }}
    >
      {item.icon && <span className="mr-2">{item.icon}</span>}
      {item.name}
    </div>
  );
}
