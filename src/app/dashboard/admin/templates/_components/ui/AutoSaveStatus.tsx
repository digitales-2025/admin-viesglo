"use client";

import { CheckCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface AutoSaveStatusProps {
  isAutoSaving?: boolean;
  lastSaved?: Date;
  className?: string;
}

export function AutoSaveStatus({ isAutoSaving, lastSaved, className }: AutoSaveStatusProps) {
  if (!isAutoSaving && !lastSaved) return null;

  return (
    <div
      className={cn(
        "px-3 py-2 rounded-md border flex items-center gap-2 text-sm transition-all duration-300",
        isAutoSaving
          ? "bg-primary text-primary-foreground border-primary/20"
          : "bg-background text-muted-foreground border-border",
        className
      )}
    >
      {isAutoSaving ? (
        <>
          <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          <span className="font-medium">Guardando borrador...</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Guardado {lastSaved?.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
        </>
      )}
    </div>
  );
}
