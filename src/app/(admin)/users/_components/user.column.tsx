"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { User } from "../_types/user.types";
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
    cell: ({ row }) => (
      <Badge variant="outline">
        <Mail className="w-4 h-4" />
        {row.getValue("email")}
      </Badge>
    ),
  },
  {
    id: "Teléfono",
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => (
      <Badge variant="outline">
        <Phone className="w-4 h-4" />
        {row.getValue("Teléfono")}
      </Badge>
    ),
  },
  {
    id: "Cargo",
    accessorKey: "post",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cargo" />,
    cell: ({ row }) => <div className=" capitalize">{row.getValue("Cargo")}</div>,
  },
  {
    id: "Rol",
    accessorKey: "roles",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2 capitalize font-semibold">
          {row.original.roles.map((role) => (
            <Badge
              key={role.id}
              className={
                row.original.isSuperAdmin
                  ? "bg-indigo-50 text-indigo-500 border-none"
                  : "bg-cyan-50 text-cyan-500 border-none"
              }
            >
              {role.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[300px]">
          {row.getValue("estado") ? (
            <Badge variant="successOutline">Activo</Badge>
          ) : (
            <Badge variant="errorOutline">Inactivo</Badge>
          )}
        </div>
      );
    },
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
