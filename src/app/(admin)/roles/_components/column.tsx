"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Button } from "@/shared/components/ui/button";
import { Role } from "../_types/roles";
import { RolesTableActions } from "./RolesTableActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const createColumnsRoles = (
  onRowExpand?: (rowId: string) => void,
  expandedRowId?: string | null
): ColumnDef<Role>[] => [
  // Columna de expansión explícita
  {
    id: "expander",
    size: 40,
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      const isExpanded = expandedRowId === row.original.id;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8"
          onClick={() => onRowExpand && onRowExpand(row.original.id)}
          title={isExpanded ? "Ocultar detalles" : "Ver detalles"}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => <div className="truncate max-w-[300px]">{row.getValue("description")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha creación" />,
    cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      return <RolesTableActions row={item} />;
    },
  },
];

// Exportamos las columnas por defecto (sin expansión) para mantener compatibilidad
export const columnsRoles = createColumnsRoles();
