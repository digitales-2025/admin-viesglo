import type React from "react";

import { cn } from "@/lib/utils";
import { Loading, type LoadingProps } from "./loading";

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  loadingProps?: LoadingProps;
  blur?: boolean;
  fullScreen?: boolean;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  loadingProps,
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
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/80",
            blur && "backdrop-blur-sm",
            fullScreen && "z-50"
          )}
        >
          <Loading variant="spinner" size="lg" text="Cargando..." {...loadingProps} />
        </div>
      )}
    </div>
  );
}
