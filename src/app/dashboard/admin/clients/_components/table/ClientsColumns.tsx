"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Building2, CheckCircle, ChevronDown, ChevronRight, Mail, User, XCircle } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import LogoGoogleMaps from "@/shared/components/icons/LogoGoogleMaps";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ClientProfileResponseDto } from "../../_types/clients.types";
import ClientsTableActions from "./ClientsTableActions";

export const columnsClients = (): ColumnDef<ClientProfileResponseDto>[] => [
  {
    id: "RUC",
    accessorKey: "_ruc.value",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="RUC" />,
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
    id: "empresa",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Empresa" />,
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
    id: "Ubicación",
    accessorKey: "sunatInfo.department",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Ubicación" />,
    cell: ({ row }) => {
      const { department, province, district, fullAddress } = row.original.sunatInfo || {};
      // Construir la dirección para Google Maps
      const addressParts = [fullAddress, department, province, district, "Perú"].filter(Boolean);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(", "))}`;
      return (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block min-w-[180px] hover:bg-muted/50 rounded-md transition-colors p-2"
          title={addressParts.join(", ")}
        >
          <div className="flex items-center gap-2 mb-1">
            <LogoGoogleMaps className="h-3 w-3" />
            <span className="text-sm font-medium break-words whitespace-normal">{department}</span>
          </div>
          <div className="text-xs text-muted-foreground break-words whitespace-normal">
            {[province, district].filter(Boolean).join(" • ")}
          </div>
        </a>
      );
    },
  },
  {
    id: "contacto",
    accessorKey: "_email.value",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Contacto" />,
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
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Estado" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <div className="min-w-[120px] space-y-1">
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
    id: "expander",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Descripción" />,
    size: 40,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <div className="flex items-center justify-center">
          <Button
            variant={"ghost"}
            type="button"
            size={"icon"}
            className="flex items-center justify-center w-4 h-4"
            onClick={row.getToggleExpandedHandler()}
          >
            {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
          </Button>
        </div>
      ) : null,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    size: 20,
    cell: ({ row }) => <ClientsTableActions client={row.original} />,
  },
];
