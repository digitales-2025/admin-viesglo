"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { User } from "../_types/user";
import { UsersTableActions } from "./UsersTablesActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const columnsUsers = (): ColumnDef<User>[] => [
  // Columna de expansión explícita
  {
    id: "Nombre Completo",
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre Completo" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("Nombre Completo")}</div>,
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("email")}</div>,
  },
  {
    id: "Teléfono",
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("Teléfono")}</div>,
  },
  {
    id: "Cargo",
    accessorKey: "post",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cargo" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("Cargo")}</div>,
  },
  {
    id: "Rol",
    accessorKey: "roles",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("Rol")}</div>,
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;

      return <UsersTableActions row={item} />;
    },
  },
];
