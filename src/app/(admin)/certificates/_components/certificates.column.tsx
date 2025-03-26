"use client";

import { TZDate } from "@date-fns/tz";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import CopyButton from "@/shared/components/ui/button-copy";
import { CertificateResponse } from "../_types/certificates.types";

export const columnsCertificates = (): ColumnDef<CertificateResponse>[] => [
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[50px] max-w-[150px]">{row.original.ruc}</div>,
  },
  {
    id: "businessName",
    accessorKey: "businessName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[200px] max-w-[200px] truncate">{row.original.businessName}</div>
    ),
  },
  {
    id: "code",
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[150px] max-w-[150px]">
        {row.original.code ? (
          <CopyButton variant="outline" size="sm" content={row.original.code} label={row.original.code} />
        ) : (
          <Badge variant="outline" className="text-slate-600 font-normal capitalize">
            No tiene código
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "nameUser",
    accessorKey: "nameUser",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del usuario" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[150px] max-w-[150px]">{row.original.nameUser}</div>
    ),
  },
  {
    id: "lastNameUser",
    accessorKey: "lastNameUser",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido del usuario" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[150px] max-w-[150px]">{row.original.lastNameUser}</div>
    ),
  },
  {
    id: "nameCapacitation",
    accessorKey: "nameCapacitation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tema de la capacitación" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[150px] max-w-[150px]">{row.original.nameCapacitation}</div>
    ),
  },
  {
    id: "dateEmision",
    accessorKey: "dateEmision",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de emisión" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-slate-600">
        <Calendar className="w-4 h-4" />
        {format(new TZDate(row.original.dateEmision ?? "", "America/Lima"), "dd-MM-yyyy")}
      </Badge>
    ),
  },
  {
    id: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    accessorKey: "status",
    cell: ({ row }) => (
      <div className="min-w-[150px] max-w-[150px]">
        {row.original.isActive ? (
          <Badge variant="successOutline">Activo</Badge>
        ) : (
          <Badge variant="errorOutline">Inactivo</Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
  },
];
