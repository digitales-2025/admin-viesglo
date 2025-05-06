import * as React from "react";

// Definimos nuestra versión personalizada del tipo de opciones
export interface CustomFilterOption {
  label: string | React.ReactNode;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Tipo para una opción de filtro
export interface CustomFilterGroup {
  label: string;
  value: string;
  multiSelect?: boolean;
  options: CustomFilterOption[];
}
