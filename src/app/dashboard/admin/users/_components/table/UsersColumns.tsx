"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { IdCard, Mail, Shield } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { UserResponse } from "../../_types/user.types";
import { UsersTableActions } from "./UsersTablesActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const columnsUsers = (actualUserId: string): ColumnDef<UserResponse>[] => [
  // Columna de expansión explícita
  {
    id: "nombre",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => {
      const name = row.original.name || "";
      return <div className="font-semibold capitalize">{name}</div>;
    },
  },
  {
    id: "apellido",
    accessorKey: "lastName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido" />,
    cell: ({ row }) => {
      const lastName = row.original.lastName || "";
      return <div className="font-semibold capitalize">{lastName}</div>;
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Correo electrónico" />,
    cell: ({ row }) => (
      <Link href={`mailto:${row.getValue("email")}`}>
        <Badge variant="outline">
          <Mail className="w-4 h-4" />
          {row.getValue("email")}
        </Badge>
      </Link>
    ),
  },
  {
    id: "rol",
    accessorKey: "roleName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      const roleName = row.original.role?.name;
      return (
        <Link href="/roles">
          <div className="flex items-center gap-2 capitalize font-semibold">
            {isActive ? (
              <Shield className="w-4 h-4 text-emerald-500" />
            ) : (
              <IdCard className="w-4 h-4 text-muted-foreground" />
            )}
            {roleName}
          </div>
        </Link>
      );
    },
    filterFn: (row, _, filterValue) => {
      // Ahora roleName es string, no array
      return filterValue.some((role: string) => row.original.role?.name === role);
    },
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[300px]">
          {row.getValue("estado") ? <Badge variant="success">Activo</Badge> : <Badge variant="error">Inactivo</Badge>}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      return filterValue.includes(String(row.getValue(id)));
    },
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;
      return <UsersTableActions row={item} actualUserId={actualUserId} />;
    },
  },
];
