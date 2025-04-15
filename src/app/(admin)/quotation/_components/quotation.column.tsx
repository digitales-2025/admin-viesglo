"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Banknote, CheckCircle2, Mail, XCircle } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { QuotationResponse } from "../_types/quotation.types";
import QuotationTableActions from "./QuotationTableActions";

// Nuevo componente para la celda de isConcrete
function ConcreteCell({ quotation }: { quotation: QuotationResponse }) {
  const { open } = useDialogStore();
  const MODULE = "quotations";

  const handleConcreteChange = () => {
    if (!quotation.isConcrete) {
      open(MODULE, "concrete", quotation);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch checked={quotation.isConcrete} onCheckedChange={handleConcreteChange} />
      <span className="text-sm text-muted-foreground">
        {quotation.isConcrete ? (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Concretada
          </span>
        ) : (
          <XCircle className="size-4 text-gray-500" />
        )}
      </span>
    </div>
  );
}

export const columnsQuotation = (): ColumnDef<QuotationResponse>[] => [
  {
    id: "code",
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("code")}</div>,
  },
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("ruc")}</div>,
  },
  {
    id: "businessName",
    accessorKey: "businessName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
    cell: ({ row }) => (
      <div
        className="font-semibold truncate capitalize min-w-[200px] max-w-[250px]"
        title={row.getValue("businessName")}
      >
        {row.getValue("businessName")}
      </div>
    ),
  },
  {
    id: "service",
    accessorKey: "service",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Servicio" />,
    cell: ({ row }) => <div className="capitalize min-w-[150px]">{row.getValue("service")}</div>,
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Badge variant="outline" className="flex items-center gap-2">
          <Banknote className="size-3" />
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(row.getValue("amount"))}
        </Badge>
      </div>
    ),
  },
  {
    id: "mainContact",
    accessorKey: "mainContact",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacto Principal" />,
    cell: ({ row }) => <div className="capitalize min-w-[150px]">{row.getValue("mainContact")}</div>,
  },
  {
    id: "position",
    accessorKey: "position",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cargo" />,
    cell: ({ row }) => <div className="capitalize min-w-[150px]">{row.getValue("position")}</div>,
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
    id: "isConcrete",
    accessorKey: "isConcrete",
    header: ({ column }) => <DataTableColumnHeader column={column} title="¿Se Concreto?" />,
    cell: ({ row }) => <ConcreteCell quotation={row.original} />,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <QuotationTableActions quotation={row.original} />,
  },
];
