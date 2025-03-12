"use client";

import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

interface LoadingTransitionProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function LoadingTransition({ show, message = "Redirigiendo...", className }: LoadingTransitionProps) {
  const [mounted, setMounted] = useState(false);

  // Efecto para manejar la animación de entrada
  useEffect(() => {
    if (show) {
      setMounted(true);
    }
  }, [show]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}
