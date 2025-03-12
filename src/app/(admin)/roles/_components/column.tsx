"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Role } from "../_types/roles";
import { RolesTableActions } from "./RolesTableActions";

export const columnsRoles: ColumnDef<Role>[] = [
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
