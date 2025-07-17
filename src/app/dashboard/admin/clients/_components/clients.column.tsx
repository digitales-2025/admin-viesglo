"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Building2, CheckCircle, Mail, MapPin, User, XCircle } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { ClientProfileResponseDto } from "../_types/clients.types";
import ClientsTableActions from "./ClientsTableActions";

export const columnsClients = (): ColumnDef<ClientProfileResponseDto>[] => [
  {
    id: "ruc",
    accessorKey: "_ruc.value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="font-mono text-sm font-medium">{row.original._ruc.value}</span>
      </div>
    ),
  },
  {
    id: "company",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Empresa" />,
    cell: ({ row }) => (
      <div className="min-w-[200px] max-w-[300px]">
        <div className="font-semibold text-sm truncate" title={row.original.name}>
          {row.original.name}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate">{row.original.legalRepresentative}</span>
        </div>
      </div>
    ),
  },
  {
    id: "location",
    accessorKey: "sunatInfo.department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ubicación" />,
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">{row.original.sunatInfo?.department}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.sunatInfo?.province} • {row.original.sunatInfo?.district}
        </div>
      </div>
    ),
  },
  {
    id: "contact",
    accessorKey: "_email.value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacto" />,
    cell: ({ row }) => (
      <div className="min-w-[200px]">
        <Link
          href={`mailto:${row.original._email.value}`}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-50 dark:bg-green-950">
            <Mail className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{row.original._email.localPart}</div>
            <div className="text-xs text-muted-foreground truncate">@{row.original._email.domain}</div>
          </div>
        </Link>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <div className="min-w-[120px] space-y-1">
          <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
            {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}

            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 20,
    cell: ({ row }) => <ClientsTableActions client={row.original} />,
  },
];
