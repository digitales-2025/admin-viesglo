"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";
import { ScrollArea } from "./scroll-area";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDesktop: boolean;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  dialogContentClassName?: string;
  dialogScrollAreaClassName?: string;
  dialogContentProps?: React.ComponentProps<typeof DialogContent>;
  drawerContentClassName?: string;
  drawerScrollAreaClassName?: string;
  drawerContentProps?: React.ComponentProps<typeof DrawerContent>;
  drawerProps?: React.ComponentProps<typeof Drawer>;
  dialogScrollAreaHeight?: string;
  drawerScrollAreaHeight?: string;
  showTrigger?: boolean;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  isDesktop,
  trigger,
  title,
  description,
  children,
  dialogContentClassName = "sm:px-0",
  dialogScrollAreaClassName = "h-full max-h-[80vh] px-0",
  dialogContentProps,
  drawerContentClassName,
  drawerScrollAreaClassName = "h-[40vh] px-0",
  drawerContentProps,
  drawerProps,
  dialogScrollAreaHeight,
  drawerScrollAreaHeight,
  showTrigger = true,
}: ResponsiveDialogProps) {
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          tabIndex={undefined}
          className={dialogContentClassName}
          onClick={(ev) => ev.stopPropagation()}
          {...dialogContentProps}
        >
          <DialogHeader className="px-4">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <ScrollArea
            className={dialogScrollAreaClassName}
            style={dialogScrollAreaHeight ? { height: dialogScrollAreaHeight } : undefined}
          >
            <div className="px-6">{children}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} {...drawerProps}>
      {showTrigger && trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        className={cn(drawerContentClassName)}
        onClick={(ev) => ev.stopPropagation()}
        {...drawerContentProps}
      >
        <DrawerHeader className="pb-2">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea
            className={drawerScrollAreaClassName}
            style={drawerScrollAreaHeight ? { height: drawerScrollAreaHeight } : undefined}
          >
            <div className="px-4">{children}</div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
