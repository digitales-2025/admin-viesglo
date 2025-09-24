"use client";

import { Column } from "@tanstack/react-table";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

import { DataTableFacetedFilter } from "@/shared/components/data-table/data-table-faceted-filter";
import { ProjectGroupResponseDto } from "../_types/project-groups.types";

interface FilterProps {
  column?: Column<ProjectGroupResponseDto, unknown>;
  title?: string;
}

export const facetedFilters = [
  {
    column: "isActive",
    title: "Estado del Sistema",
    options: [
      {
        label: "Activo",
        value: true,
        icon: CheckCircle,
      },
      {
        label: "Inactivo",
        value: false,
        icon: XCircle,
      },
    ],
  },
  {
    column: "status",
    title: "Estado del Grupo",
    options: [
      {
        label: "Activo",
        value: "activo",
        icon: CheckCircle,
      },
      {
        label: "Inactivo",
        value: "inactivo",
        icon: XCircle,
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
          value: true,
          icon: CheckCircle,
        },
        {
          label: "Inactivo",
          value: false,
          icon: XCircle,
        },
      ]}
    />
  );
}

export function ProjectGroupStatusFilter({ column, title }: FilterProps) {
  return (
    <DataTableFacetedFilter
      column={column}
      title={title}
      options={[
        {
          label: "Activo",
          value: "ACTIVE",
          icon: CheckCircle,
        },
        {
          label: "Inactivo",
          value: "INACTIVE",
          icon: XCircle,
        },
        {
          label: "Completado",
          value: "COMPLETED",
          icon: CheckCircle,
        },
        {
          label: "Cancelado",
          value: "CANCELLED",
          icon: XCircle,
        },
      ]}
    />
  );
}

export function PeriodFilter({ column, title }: FilterProps) {
  return (
    <DataTableFacetedFilter
      column={column}
      title={title}
      options={[
        {
          label: "2023",
          value: "2023",
          icon: Calendar,
        },
        {
          label: "2024",
          value: "2024",
          icon: Calendar,
        },
        {
          label: "2025",
          value: "2025",
          icon: Calendar,
        },
        {
          label: "2026",
          value: "2026",
          icon: Calendar,
        },
      ]}
    />
  );
}
