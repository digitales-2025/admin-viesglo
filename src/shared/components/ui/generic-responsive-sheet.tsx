"use client";

import type React from "react";

import { Badge } from "./badge";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "./sheet";

interface GenericSheetProps extends Omit<React.ComponentPropsWithRef<typeof Sheet>, "open" | "onOpenChange"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  showDefaultFooter?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingIcon?: React.ReactNode;
  confirmDisabled?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  badgeClassName?: string;
}

const maxWidthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

const roundedClasses = {
  none: "rounded-tl-none rounded-bl-none",
  sm: "rounded-tl-sm rounded-bl-sm",
  md: "rounded-tl-md rounded-bl-md",
  lg: "rounded-tl-lg rounded-bl-lg",
  xl: "rounded-tl-xl rounded-bl-xl",
  "2xl": "rounded-tl-2xl rounded-bl-2xl",
  "3xl": "rounded-tl-3xl rounded-bl-3xl",
};

export function GenericSheet({
  open,
  onOpenChange,
  title,
  description,
  badge,
  children,
  footer,
  maxWidth = "md",
  rounded = "lg",
  showDefaultFooter = true,
  onCancel,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  loadingIcon,
  confirmDisabled = false,
  titleClassName,
  descriptionClassName,
  badgeClassName,
  ...props
}: GenericSheetProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} {...props}>
      <SheetContent
        className={`flex flex-col gap-6 ${maxWidthClasses[maxWidth]} ${roundedClasses[rounded]} h-full overflow-hidden`}
        tabIndex={undefined}
      >
        <SheetHeader className="text-left pb-0">
          <SheetTitle className={`flex flex-col items-start ${titleClassName || ""}`}>
            {title}
            {badge && (
              <Badge
                className={
                  badgeClassName ||
                  badge.className ||
                  "bg-emerald-100 capitalize text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                }
                variant={badge.variant || "secondary"}
              >
                {badge.text}
              </Badge>
            )}
          </SheetTitle>
          {description && <SheetDescription className={descriptionClassName}>{description}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="w-full h-[calc(100vh-250px)] p-0">{children}</ScrollArea>

        {(footer || showDefaultFooter) && (
          <SheetFooter className="gap-2 pt-2 sm:space-x-0">
            {footer || (
              <div className="flex flex-row-reverse gap-2">
                {onConfirm && (
                  <Button type="button" onClick={handleConfirm} disabled={isLoading || confirmDisabled}>
                    {isLoading && loadingIcon}
                    {confirmText}
                  </Button>
                )}
                <SheetClose asChild>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                </SheetClose>
              </div>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
