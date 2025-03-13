"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Button } from "@/shared/components/ui/button";
import { Role } from "../_types/roles";
import { RolesTableActions } from "./RolesTableActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const columnsRoles = (): ColumnDef<Role>[] => [
  // Columna de expansión explícita
  {
    id: "expander",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      console.log("🚀 ~ row:", row);
      console.log("🚀 ~ cell ~ row:", row.getCanExpand());
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
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      return <RolesTableActions row={item} />;
    },
  },
];
