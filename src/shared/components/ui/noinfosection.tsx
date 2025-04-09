import type React from "react";
import { FileQuestion } from "lucide-react";

interface NoInfoSectionProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function NoInfoSection({
  message = "No se encontró información disponible",
  icon = <FileQuestion className="h-12 w-12 text-muted-foreground/50" strokeWidth={1} />,
  className = "",
}: NoInfoSectionProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center ${className}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-medium">{message}</h3>
      <p className="text-sm text-muted-foreground">Ingrese la información necesaria para continuar</p>
    </div>
  );
}
