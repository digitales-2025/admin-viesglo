"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { ClientWithResponse } from "../_types/client.types";
import ClientsTableActions from "./ClientsTableActions";

export const columnsClients = (): ColumnDef<ClientWithResponse>[] => [
  {
    id: "clinica",
    accessorKey: "clinic",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clínica" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("clinica")}</div>,
  },
  {
    id: "fecha registro",
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de registro" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("date")}</div>,
  },
  {
    id: "nombres",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombres" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("name")}</div>,
  },
  {
    id: "apellidos",
    accessorKey: "surnames",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Apellidos" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("surnames")}</div>,
  },
  {
    id: "tipo de examen",
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de examen" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("type")}</div>,
  },
  {
    id: "estado",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const status = row.getValue("status");
      const color = status === "Apto" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800";
      return <Badge className={`min-w-[80px] text-center ${color}`}>{status as string}</Badge>;
    },
  },
  {
    id: "provincia",
    accessorKey: "province",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Provincia" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("province")}</div>,
  },
  {
    id: "aptitud médica",
    accessorKey: "medical",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aptitud médica" />,
    cell: ({ row }) => (
      <a href={row.getValue("medical")} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        Certificado <Download className="inline-block w-4 h-4 ml-1" />
      </a>
    ),
  },
  {
    id: "informe medico",
    accessorKey: "report",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Informe médico" />,
    cell: ({ row }) => (
      <a href={row.getValue("report")} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        Informe médico <FileText className="inline-block w-4 h-4 ml-1" />
      </a>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ClientsTableActions client={row.original} />,
  },
];
