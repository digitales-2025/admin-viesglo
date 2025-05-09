"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, MapPin, Minus, Phone } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import AvatarStack from "@/shared/components/ui/avatar-stack";
import { Badge } from "@/shared/components/ui/badge";
import { ClientWithClinicResponse } from "../_types/clients.types";
import ClientsTableActions from "./ClientsTableActions";

export const columnsClients = (): ColumnDef<ClientWithClinicResponse>[] => [
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("ruc")}</div>,
  },
  {
    id: "razon social",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
    cell: ({ row }) => (
      <div
        className="font-semibold truncate capitalize min-w-[200px] max-w-[300px]"
        title={row.getValue("razon social")}
      >
        {row.getValue("razon social")}
      </div>
    ),
  },
  {
    id: "departamento",
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departamento" />,
    cell: ({ row }) => (
      <div className="capitalize min-w-[150px]">
        <Badge variant="outline" className="flex items-center gap-2 capitalize">
          <MapPin /> {row.getValue("departamento")}
        </Badge>
      </div>
    ),
  },
  {
    id: "provincia",
    accessorKey: "province",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Provincia" />,
    cell: ({ row }) => (
      <div className="capitalize min-w-[150px]">
        <Badge variant="outline" className="flex items-center gap-2 capitalize">
          <MapPin /> {row.getValue("provincia")}
        </Badge>
      </div>
    ),
  },
  {
    id: "distrito",
    accessorKey: "district",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Distrito" />,
    cell: ({ row }) => (
      <div className="capitalize min-w-[150px]">
        <Badge variant="outline" className="flex items-center gap-2 capitalize">
          <MapPin /> {row.getValue("distrito")}
        </Badge>
      </div>
    ),
  },
  {
    id: "direccion",
    accessorKey: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dirección" />,
    cell: ({ row }) => (
      <div className="capitalize truncate min-w-[150px] max-w-[200px]" title={row.getValue("direccion")}>
        {row.getValue("direccion")}
      </div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Link href={`mailto:${row.getValue("email")}`} className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Mail className="size-3" /> {row.getValue("email")}
          </Badge>
        </Link>
      </div>
    ),
  },
  {
    id: "telefono",
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Link href={`tel:${row.getValue("telefono")}`} className="flex items-center gap-2">
          <Badge variant="outline">
            <Phone className="size-3" /> {formatPhoneNumberIntl(row.getValue("telefono"))}
          </Badge>
        </Link>
      </div>
    ),
  },
  {
    id: "clinicas",
    accessorKey: "clinics",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clínicas" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        {row.original.clinics.length > 0 ? (
          <AvatarStack users={row.original.clinics} limit={3} size="sm" />
        ) : (
          <Minus className="text-muted-foreground" />
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <Badge variant={row.getValue("estado") ? "success" : "error"} className="flex items-center gap-2 capitalize">
        {row.getValue("estado") ? "activo" : "inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    size: 20,
    cell: ({ row }) => <ClientsTableActions client={row.original} />,
  },
];
