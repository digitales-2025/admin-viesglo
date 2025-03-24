"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Role } from "../_types/roles";
import { RolesTableActions } from "./RolesTableActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const columnsRoles = (): ColumnDef<Role>[] => [
  // Columna de expansión explícita
  {
    id: "select",
    size: 40,
    accessorKey: "permissions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Permisos" />,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          {...{
            onClick: row.getToggleExpandedHandler(),
          }}
        >
          {row.getIsExpanded() ? <ChevronRight /> : <ChevronDown />}
        </Button>
      ) : null;
    },
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
  },
  {
    id: "nombre",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("nombre")}</div>,
  },
  {
    id: "descripcion",
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => <div className="truncate max-w-[300px]">{row.getValue("descripcion")}</div>,
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("estado") ? (
          <Badge variant="successOutline"> Activo</Badge>
        ) : (
          <Badge variant="errorOutline">Inactivo</Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;

      return <RolesTableActions row={item} />;
    },
  },
];
