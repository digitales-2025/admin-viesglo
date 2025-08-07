"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, ChevronDown, ChevronRight, IdCard, Shield, XCircle } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { RoleListItem } from "../../../settings/_types/roles.types";
import { RolesTableActions } from "./RolesTableActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const columnsRoles = (): ColumnDef<RoleListItem>[] => [
  {
    id: "nombre",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize flex items-center gap-2">
        {row.original.name === "superadmin" ? (
          <Shield className="size-4 text-emerald-500" />
        ) : (
          <IdCard className="size-4 text-muted-foreground" />
        )}
        {row.getValue("nombre")}
      </div>
    ),
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
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Estado" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <div className="min-w-[120px] space-y-1 items-center flex justify-center">
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
    id: "actions",
    size: 20,
    cell: ({ row }) => {
      const item = row.original;

      return <RolesTableActions row={item} />;
    },
  },
];
