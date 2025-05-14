"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Banknote, Calendar, CheckCircle2, Mail, XCircle } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { LabelPaymentPlan, PaymentPlan, QuotationResponse } from "../_types/quotation.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";
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
      <ProtectedComponent requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.update }]}>
        <Switch
          checked={quotation.isConcrete}
          onCheckedChange={handleConcreteChange}
          className="cursor-pointer data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500 dark:data-[state=unchecked]:bg-rose-500"
        />
      </ProtectedComponent>
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
    id: "código",
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="font-semibold capitalize min-w-[150px] text-sky-700">{row.getValue("código")}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Grupo de cotización:{" "}
              <span className="font-semibold text-sky-600">{row.original.quotationGroup.name}</span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("ruc")}</div>,
  },
  {
    id: "razón social",
    accessorKey: "businessName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
    cell: ({ row }) => (
      <div
        className="font-semibold truncate capitalize min-w-[200px] max-w-[250px] "
        title={row.getValue("razón social")}
      >
        {row.getValue("razón social")}
      </div>
    ),
  },
  {
    id: "servicio",
    accessorKey: "service",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Servicio" />,
    cell: ({ row }) => (
      <div className="capitalize min-w-[150px] max-w-[250px] truncate" title={row.getValue("servicio")}>
        {row.getValue("servicio")}
      </div>
    ),
  },
  {
    id: "monto total",
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto total" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Badge variant="outline" className="flex items-center gap-2">
          <Banknote className="size-3" />
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(row.getValue("monto total"))}
        </Badge>
      </div>
    ),
  },
  {
    id: "forma de pago",
    accessorKey: "paymentPlan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Forma de Pago" />,
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("forma de pago") === PaymentPlan.INSTALLMENTS ? "info" : "success"}
        className="capitalize min-w-[150px]"
      >
        {LabelPaymentPlan[row.getValue("forma de pago") as PaymentPlan]}
      </Badge>
    ),
  },
  {
    id: "fecha de cotización",
    accessorKey: "dateQuotation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Cotización" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize min-w-[150px]">
        <Calendar className="size-3 text-muted-foreground" />
        {row.getValue("fecha de cotización") ? (
          <span>
            {typeof row.original.dateQuotation === "string"
              ? row.original.dateQuotation.substring(0, 10).split("-").reverse().join("/")
              : "Fecha inválida"}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">No iniciada</span>
        )}
      </Badge>
    ),
  },
  {
    id: "contacto principal",
    accessorKey: "mainContact",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacto Principal" />,
    cell: ({ row }) => <div className="capitalize min-w-[150px]">{row.getValue("contacto principal")}</div>,
  },
  {
    id: "cargo",
    accessorKey: "position",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cargo" />,
    cell: ({ row }) => <div className="capitalize min-w-[150px]">{row.getValue("cargo")}</div>,
  },
  {
    id: "correo electrónico",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Correo Electrónico" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Link href={`mailto:${row.getValue("correo electrónico")}`} className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Mail className="size-3" /> {row.getValue("correo electrónico")}
          </Badge>
        </Link>
      </div>
    ),
  },
  {
    id: "departamento",
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departamento" />,
    cell: ({ row }) => <div className="capitalize min-w-[150px]">{row.getValue("departamento")}</div>,
  },
  {
    id: "isConcrete",
    accessorKey: "isConcrete",
    header: ({ column }) => <DataTableColumnHeader column={column} title="¿Se Concreto?" />,
    cell: ({ row }) => <ConcreteCell quotation={row.original} />,
    enableSorting: false,
  },
  {
    id: "actions",
    size: 20,
    cell: ({ row }) => <QuotationTableActions quotation={row.original} />,
  },
];
