"use client";

import { useEffect, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Banknote, Check, CheckCircle2, Loader2, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { usePayments, useUpdatePaymentStatus } from "../_hooks/usePayments";
import { PaymentResponse } from "../_types/payment.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

// Almacenamiento global para los estados
const paymentStates = new Map<string, { date?: Date; code: string; isPaid?: boolean }>();

// Hook personalizado para limpiar el paymentStates cuando cambian los datos
function usePaymentsWithCleanup() {
  const paymentsQuery = usePayments();
  const queryClient = useQueryClient();

  // Limpiar el mapa cuando se invalidan las queries de pagos
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Limpiar el mapa cuando los pagos son creados o actualizados
      paymentStates.clear();
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return paymentsQuery;
}

// Componente para la celda de isPaid
function PaidCell({ payment }: { payment: PaymentResponse }) {
  const { open } = useDialogStore();
  const MODULE = "payments";
  // Usar un estado interno para controlar la renderización
  const [isReady, setIsReady] = useState(false);
  const [isPaid, setIsPaid] = useState(false); // Iniciar siempre como falso para evitar parpadeos

  // Al montar el componente, guardar el estado en el mapa global
  useEffect(() => {
    // Para pagos nuevos o existentes, verificar si ya está en el mapa
    if (!paymentStates.has(payment.id)) {
      paymentStates.set(payment.id, {
        code: "", // Asegurar que code siempre tiene un valor
        ...paymentStates.get(payment.id),
        isPaid: payment.isPaid,
      });
    }

    // Esperar un poco para permitir que todos los componentes se estabilicen
    const timer = setTimeout(() => {
      const storedState = paymentStates.get(payment.id);
      setIsPaid(storedState?.isPaid || payment.isPaid);
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [payment.id, payment.isPaid]);

  // Actualizar el estado cuando payment.isPaid cambia explícitamente
  useEffect(() => {
    // Solo actualizar cuando el componente está listo para evitar parpadeos
    if (isReady) {
      setIsPaid(payment.isPaid);

      // Actualizar también en el mapa global
      const storedState = paymentStates.get(payment.id) || { code: "", date: undefined };
      paymentStates.set(payment.id, { ...storedState, isPaid: payment.isPaid });
    }
  }, [payment.isPaid, payment.id, isReady]);

  const handlePaidChange = () => {
    if (!isPaid) {
      open(MODULE, "update", payment);
    }
  };

  // Durante la carga inicial, mostrar el botón desactivado para evitar parpadeos
  if (!isReady) {
    return (
      <div className="flex items-center gap-2">
        <Switch checked={false} onCheckedChange={handlePaidChange} />
        <span className="text-sm text-muted-foreground">
          <XCircle className="size-4 text-gray-500" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Switch checked={isPaid} onCheckedChange={handlePaidChange} />
      <span className="text-sm text-muted-foreground">
        {isPaid ? (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Pagado
          </span>
        ) : (
          <XCircle className="size-4 text-gray-500" />
        )}
      </span>
    </div>
  );
}

// Componente para la celda de acciones
function ActionsCell({ payment }: { payment: PaymentResponse }) {
  const { mutate: updatePaymentStatus } = useUpdatePaymentStatus();
  const [date, setDate] = useState<Date | undefined>(payment.paymentDate ? new Date(payment.paymentDate) : undefined);
  const [code, setCode] = useState(payment.billingCode || "");

  // Obtener los valores actualizados del almacenamiento global
  useEffect(() => {
    // Inicializar el estado en el mapa al montar el componente
    if (!paymentStates.has(payment.id)) {
      paymentStates.set(payment.id, {
        date: payment.paymentDate ? new Date(payment.paymentDate) : undefined,
        code: payment.billingCode || "",
        isPaid: payment.isPaid,
      });
    }

    const intervalId = setInterval(() => {
      const state = paymentStates.get(payment.id);
      if (state) {
        if (state.date !== undefined) {
          setDate(state.date);
        }
        if (state.code) {
          setCode(state.code);
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [payment.id, payment.paymentDate, payment.billingCode, payment.isPaid]);

  const handleUpdate = () => {
    if (date && code) {
      const paymentDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();

      updatePaymentStatus({
        id: payment.id,
        data: {
          paymentDate,
          billingCode: code,
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <ProtectedComponent requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdate}
          disabled={!date || !code || payment.isPaid}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4" />
        </Button>
      </ProtectedComponent>
    </div>
  );
}

// Exportamos el hook para que pueda ser usado en el componente de tabla
export { usePaymentsWithCleanup };

export const columnsPayment = (): ColumnDef<PaymentResponse>[] => [
  {
    id: "codigo",
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código de Cotización" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("codigo")}</div>,
  },
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("ruc")}</div>,
  },
  {
    id: "razon social",
    accessorKey: "businessName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
    cell: ({ row }) => (
      <div
        className="font-semibold capitalize min-w-[200px] max-w-[200px] truncate"
        title={row.getValue("razon social")}
      >
        {row.getValue("razon social")}
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
    id: "monto",
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto" />,
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <Badge variant="outline" className="flex items-center gap-2">
          <Banknote className="size-3" />
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(row.getValue("monto"))}
        </Badge>
      </div>
    ),
  },
  {
    id: "fecha de pago",
    accessorKey: "paymentDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Pago" />,
    cell: function Cell({ row }) {
      const paymentDate = row.original.paymentDate;
      const paymentDateFormatted = paymentDate ? new TZDate(paymentDate as string) : undefined;

      const { mutate: updatePayment, isPending } = useUpdatePaymentStatus();

      const handleChange = (date: Date | undefined) => {
        updatePayment({
          id: row.original.id,
          data: {
            paymentDate: date
              ? new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), "America/Lima").toISOString()
              : undefined,
          },
        });
      };

      return (
        <div className="relative">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
          <DatePicker selected={paymentDateFormatted} onSelect={handleChange} disabled={row.original.isPaid} />
        </div>
      );
    },
  },
  {
    id: "codigo de facturacion",
    accessorKey: "billingCode",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código de Facturación" />,
    cell: function Cell({ row }) {
      const payment = row.original;
      const initialCode = payment.billingCode || "";
      const isPaid = payment.isPaid;
      const { mutate: updatePayment, isPending } = useUpdatePaymentStatus();

      const [code, setCode] = useState(initialCode);

      const handleSave = () => {
        updatePayment(
          {
            id: row.original.id,
            data: { billingCode: code },
          },
          {
            onError: (_) => {
              setCode(initialCode);
            },
          }
        );
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
      };

      return (
        <div className="relative inline-flex gap-1">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
          <Input
            value={code}
            onChange={handleChange}
            disabled={isPaid}
            className="min-w-[200px] max-w-[200px] truncate"
            placeholder="Ingrese el código de facturación"
          />
          {code !== initialCode && (
            <Button type="button" variant="outline" size="icon" onClick={handleSave} className="">
              <Save className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
  {
    id: "fecha de facturacion",
    accessorKey: "billingDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Facturación" />,
    cell: function Cell({ row }) {
      const billingDate = row.original.billingDate;
      const billingDateFormatted = billingDate ? new TZDate(billingDate as string) : undefined;

      const { mutate: updatePayment, isPending } = useUpdatePaymentStatus();

      const handleChange = (date: Date | undefined) => {
        updatePayment({
          id: row.original.id,
          data: {
            billingDate: date
              ? new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), "America/Lima").toISOString()
              : undefined,
          },
        });
      };

      return (
        <div className="relative">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
          <DatePicker selected={billingDateFormatted} onSelect={handleChange} disabled={row.original.isPaid} />
        </div>
      );
    },
  },
  {
    id: "email destinatario",
    accessorKey: "emailBilling",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email Destinatario" />,
    cell: function Cell({ row }) {
      const initialEmail = row.original.emailBilling || "";

      const { mutate: updatePayment, isPending } = useUpdatePaymentStatus();

      const [email, setEmail] = useState(initialEmail);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
      };

      const handleSave = () => {
        if (!z.string().email().safeParse(email).success && email !== "") {
          toast.error("El email no es válido");
          return;
        }

        updatePayment(
          {
            id: row.original.id,
            data: { emailBilling: email },
          },
          {
            onError: (_) => {
              setEmail(initialEmail);
            },
          }
        );
      };

      return (
        <div className="relative inline-flex gap-1">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
          <Input
            value={email || ""}
            onChange={handleChange}
            disabled={row.original.isPaid}
            placeholder="Ingrese el email del destinatario"
            className="min-w-[200px] max-w-[200px] truncate"
          />
          {email !== initialEmail && (
            <Button type="button" variant="outline" size="icon" onClick={handleSave} className="">
              <Save className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
  {
    id: "realizo pago",
    accessorKey: "isPaid",
    header: ({ column }) => <DataTableColumnHeader column={column} title="¿Realizó Pago?" />,
    cell: ({ row }) => <PaidCell payment={row.original} />,
  },
  {
    id: "acciones",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Actualizar" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <ActionsCell payment={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
