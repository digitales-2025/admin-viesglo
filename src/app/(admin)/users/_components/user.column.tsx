"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { IdCard, Mail, Phone, Shield } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Role, User } from "../_types/user.types";
import { UsersTableActions } from "./UsersTablesActions";

// Esta función crea las columnas y recibe una función para manejar la expansión
export const columnsUsers = (): ColumnDef<User>[] => [
  // Columna de expansión explícita
  {
    id: "nombre completo",
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="nombre completo" />,
    cell: ({ row }) => <div className="font-semibold capitalize">{row.getValue("nombre completo")}</div>,
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="email" />,
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
    id: "teléfono",
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="teléfono" />,
    cell: ({ row }) =>
      row.original.phone && row.original.phone !== "" ? (
        <Link href={`tel:${row.getValue("teléfono")}`}>
          <Badge variant="outline">
            <Phone className="w-4 h-4" />
            {formatPhoneNumberIntl(row.getValue("teléfono")) || row.original.phone}
          </Badge>
        </Link>
      ) : (
        <Badge variant="outline">No tiene teléfono</Badge>
      ),
  },
  {
    id: "cargo",
    accessorKey: "post",
    header: ({ column }) => <DataTableColumnHeader column={column} title="cargo" />,
    cell: ({ row }) => <div className=" capitalize">{row.getValue("cargo")}</div>,
  },
  {
    id: "rol",
    accessorKey: "roles",
    header: ({ column }) => <DataTableColumnHeader column={column} title="rol" />,
    cell: ({ row }) => {
      return (
        <Link href="/roles">
          <div className="flex flex-wrap gap-2 capitalize font-semibold">
            {row.original.roles.map((role) => (
              <span key={role.id} className="inline-flex items-center gap-2">
                {row.original.isSuperAdmin ? (
                  <Shield className="w-4 h-4 text-emerald-500" />
                ) : (
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                )}
                {role.name}
              </span>
            ))}
          </div>
        </Link>
      );
    },
    filterFn: (row, _, filterValue) => {
      return filterValue.some((role: string) => row.original.roles.some((r: Role) => r.name === role));
    },
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="estado" />,
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
      return <UsersTableActions row={item} />;
    },
  },
];
