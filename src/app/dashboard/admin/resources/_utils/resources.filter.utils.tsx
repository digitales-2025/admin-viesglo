import { Column } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";

import { DataTableFacetedFilter } from "@/shared/components/data-table/data-table-faceted-filter";
import { ResourceResponseDto } from "../_types/resources.types";

interface FilterProps {
  column?: Column<ResourceResponseDto, unknown>;
  title?: string;
}

export const facetedFilters = [
  {
    column: "isActive",
    title: "Estado",
    options: [
      {
        label: "Activo",
        value: "true",
        icon: CheckCircle,
      },
      {
        label: "Inactivo",
        value: "false",
        icon: XCircle,
      },
    ],
  },
  {
    column: "category",
    title: "Tipo de recurso",
    options: [
      {
        label: "Directo",
        value: "DIRECT_COSTS",
      },
      {
        label: "Indirecto",
        value: "INDIRECT_COSTS",
      },
      {
        label: "Gastos",
        value: "EXPENSES",
      },
    ],
  },
];

export function StatusFilter({ column, title }: FilterProps) {
  return (
    <DataTableFacetedFilter
      column={column}
      title={title}
      options={[
        {
          label: "Activo",
          value: "true",
          icon: CheckCircle,
        },
        {
          label: "Inactivo",
          value: "false",
          icon: XCircle,
        },
      ]}
    />
  );
}

export function CategoryFilter({ column, title }: FilterProps) {
  return (
    <DataTableFacetedFilter
      column={column}
      title={title}
      options={[
        {
          label: "Directo",
          value: "DIRECT_COSTS",
        },
        {
          label: "Indirecto",
          value: "INDIRECT_COSTS",
        },
        {
          label: "Gastos",
          value: "EXPENSES",
        },
      ]}
    />
  );
}
