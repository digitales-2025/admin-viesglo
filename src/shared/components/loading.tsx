"use client";

import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const loadingVariants = cva("relative flex items-center justify-center overflow-hidden", {
  variants: {
    variant: {
      spinner: "inline-flex",
      dots: "inline-flex gap-1",
      pulse: "inline-flex",
      skeleton: "bg-muted/60 animate-pulse rounded",
      progress: "w-full bg-muted rounded-full overflow-hidden",
    },
    size: {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
      full: "w-full",
    },
  },
  defaultVariants: {
    variant: "spinner",
    size: "md",
  },
});

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof loadingVariants> {
  progress?: number;
  text?: string;
  textPosition?: "top" | "bottom" | "right" | "left";
}

export function Loading({
  className,
  variant,
  size,
  progress = 0,
  text,
  textPosition = "bottom",
  ...props
}: LoadingProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {text && textPosition === "top" && <span className="text-sm text-muted-foreground">{text}</span>}

      <div className="flex items-center gap-2">
        {text && textPosition === "left" && <span className="text-sm text-muted-foreground">{text}</span>}

        <div className={cn(loadingVariants({ variant, size, className }))} {...props}>
          {variant === "spinner" && (
            <div className="h-full w-full rounded-full border-4 border-muted border-t-primary animate-spin" />
          )}

          {variant === "dots" && (
            <>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            </>
          )}

          {variant === "pulse" && (
            <div className="h-full w-full rounded-full bg-primary/20 animate-ping">
              <div className="h-1/2 w-1/2 rounded-full bg-primary absolute top-1/4 left-1/4" />
            </div>
          )}

          {variant === "progress" && (
            <div className="h-2 bg-primary transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }} />
          )}
        </div>

        {text && textPosition === "right" && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>

      {text && textPosition === "bottom" && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
