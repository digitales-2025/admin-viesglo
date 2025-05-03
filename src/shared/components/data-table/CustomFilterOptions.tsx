import * as React from "react";

import { DataTableFacetedFilter as OriginalFilter } from "@/shared/components/data-table/DataTableFacetedFilter";

// Definimos nuestra versión personalizada del tipo de opciones
export interface CustomDataTableFacetedFilterOption {
  label: string | React.ReactNode;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Definimos nuestra versión personalizada de los props para el filtro
export interface CustomFilterProps<TData, TValue> {
  column?: { data: TData[] } | null;
  title?: string;
  options: CustomDataTableFacetedFilterOption[];
  onFilterChange?: (values: TValue[]) => void;
  multiSelect?: boolean;
}

// Componente wrapper que hace el casting de tipos
export function CustomDataTableFilter<TData, TValue>(props: CustomFilterProps<TData, TValue>) {
  return <OriginalFilter {...(props as any)} />;
}
