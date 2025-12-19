import type React from "react";

import { cn } from "@/lib/utils";

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  blur?: boolean;
  fullScreen?: boolean;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  blur = true,
  fullScreen = false,
  children,
  className,
  ...props
}: LoadingOverlayProps) {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", fullScreen && "fixed inset-0 z-50", className)} {...props}>
      {children}

      {isLoading && (
        <div className={cn("absolute inset-0 flex items-center justify-center", fullScreen && "z-50")}>
          {/* Skeleton de fondo - muy sutil con blur */}
          <div className={cn("absolute inset-0 bg-muted/20 animate-pulse rounded-md", blur && "backdrop-blur-sm")} />

          {/* Spinner pequeño centrado - más discreto */}
          <div className="relative z-10">
            <div className="h-4 w-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
