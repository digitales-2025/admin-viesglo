"use client";

import type * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

// Componente Sheet adaptativo
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Drawer {...props} />;
  }

  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

// Componente SheetTrigger adaptativo
function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTrigger {...props} />;
  }

  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

// Componente SheetClose adaptativo
function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerClose {...props} />;
  }

  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

// Componente SheetPortal adaptativo
function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerPortal {...props} />;
  }

  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

// SheetOverlay - estructura del básico
function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

// SheetContent adaptativo con estructura del básico
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const isMobile = useIsMobile();

  // En móviles, usamos DrawerContent
  if (isMobile) {
    return (
      <DrawerContent className={className} {...props}>
        {children}
        <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DrawerClose>
      </DrawerContent>
    );
  }

  // En escritorio, usamos Sheet con estructura del básico
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

// SheetHeader con estructura del básico
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerHeader className={className} {...props} />;
  }

  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

// SheetFooter con estructura del básico
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerFooter className={className} {...props} />;
  }

  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

// SheetTitle con estructura del básico
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitle className={className} {...props} />;
  }

  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

// SheetDescription con estructura del básico
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescription className={className} {...props} />;
  }

  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
