"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, FolderOpen, XCircle } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { ResourceResponseDto } from "../../_types/resources.types";
import ResourcesTableActions from "./ResourcesTableActions";

// Mapeo de categorías del backend al español
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    DIRECT_COSTS: "Directo",
    INDIRECT_COSTS: "Indirecto",
    EXPENSES: "Gastos",
    direct_costs: "Directo",
    indirect_costs: "Indirecto",
    expenses: "Gastos",
  };

  return categoryMap[category] || category;
};

export const columnsResources = (): ColumnDef<ResourceResponseDto>[] => [
  {
    id: "Tipo de recurso",
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="justify-center" title="Tipo de recurso" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-[120px] justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
          <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="font-medium text-sm">{getCategoryLabel(row.original.category)}</span>
      </div>
    ),
  },
  {
    id: "Nombre de recurso",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="justify-center" title="Nombre de recurso" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[200px] max-w-[500px] flex justify-center">
        <div className="font-semibold text-sm truncate" title={row.original.name}>
          {row.original.name}
        </div>
      </div>
    ),
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Estado" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <div className="min-w-[120px] space-y-1 flex justify-center">
          <Badge variant={isActive ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
            {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      // Si filterValue es un array, revisa si el valor está incluido
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId));
      }
      // Si es un valor único, compara directamente
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    id: "actions",
    size: 20,
    cell: ({ row }) => <ResourcesTableActions resource={row.original} />,
  },
];
