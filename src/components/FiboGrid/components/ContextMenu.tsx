import React from 'react';
import {
  ContextMenu as RadixContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { ContextMenuItem as ContextMenuItemType } from '../types';

interface GridContextMenuProps {
  items: ContextMenuItemType[];
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function GridContextMenu({ items, children, className, onOpenChange }: GridContextMenuProps) {
  const renderMenuItem = (item: ContextMenuItemType, index: number) => {
    if (item.separator) {
      return <ContextMenuSeparator key={index} />;
    }

    if (item.subMenu && item.subMenu.length > 0) {
      return (
        <ContextMenuSub key={index}>
          <ContextMenuSubTrigger disabled={item.disabled}>
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.name}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {item.subMenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }

    return (
      <ContextMenuItem
        key={index}
        disabled={item.disabled}
        onClick={item.action}
      >
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.name}
      </ContextMenuItem>
    );
  };

  return (
    <RadixContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={cn("fibogrid w-48", className)}>
        {items.map((item, index) => renderMenuItem(item, index))}
      </ContextMenuContent>
    </RadixContextMenu>
  );
}
