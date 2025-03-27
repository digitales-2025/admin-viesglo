"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, MapPin, Phone } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { ClientResponse } from "../_types/clients.types";
import ClientsTableActions from "./ClientsTableActions";

export const columnsClients = (): ColumnDef<ClientResponse>[] => [
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
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[200px]">{row.getValue("razon social")}</div>,
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
      <div className="capitalize min-w-[150px] max-w-[200px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full truncate">{row.getValue("direccion")}</TooltipTrigger>
            <TooltipContent>
              <p>{row.getValue("direccion")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ClientsTableActions client={row.original} />,
  },
];
