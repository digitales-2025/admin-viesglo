"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, IdCard, Mail, Shield, XCircle } from "lucide-react";

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
        <Link href="/dashboard/admin/roles">
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
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;
      return <UsersTableActions row={item} actualUserId={actualUserId} />;
    },
  },
];
