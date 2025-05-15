"use client";

import { useEffect, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Banknote, Calendar, ChevronDown, ChevronRight, Info, Loader2, Minus, Save, XCircle } from "lucide-react";
import { DateRange } from "react-day-picker";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { CalendarDatePicker } from "@/shared/components/calendar-date-picker";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useMarkPaymentStatus, usePayments, useUpdatePaymentStatus } from "../_hooks/usePayments";
import { PaymentResponse } from "../_types/payment.types";
import { LabelPaymentPlan, PaymentPlan } from "../../quotation/_types/quotation.types";
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

  const { mutate: markPaymentStatus, isPending } = useMarkPaymentStatus();

  const handlePaidChange = () => {
    if (!isPaid) {
      if (payment.paymentPlan !== PaymentPlan.INSTALLMENTS) {
        open(MODULE, "update", payment);
      } else {
        open(MODULE, "update", {
          ...payment,
          isPaid: true,
          paymentDate: payment.paymentDate || new Date().toISOString(),
          billingCode: payment.billingCode || "Pago mensual completado",
        });
      }
    } else {
      markPaymentStatus({
        id: payment.id,
        data: {
          isPaid: false,
          paymentDate: payment.paymentDate || "",
          billingCode:
            payment.paymentPlan === PaymentPlan.INSTALLMENTS ? "Pago mensual incompleto" : payment.billingCode || "",
        },
      });
    }
  };

  // Durante la carga inicial, mostrar el botón desactivado para evitar parpadeos
  if (!isReady) {
    return (
      <ProtectedComponent
        requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
        fallback={
          <Badge variant="outline" className="flex h-9 items-center gap-2 text-sm">
            <XCircle className="size-4 text-gray-500" />
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={false}
            onCheckedChange={handlePaidChange}
            disabled={isPending}
            className="cursor-pointer data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500 dark:data-[state=unchecked]:bg-rose-500"
          />
          <Badge variant="error">Pendiente</Badge>
        </div>
      </ProtectedComponent>
    );
  }
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
      fallback={
        <Badge variant="outline" className="flex h-9 items-center gap-2 text-xs text-rose-400 italic">
          <Info className="size-4" />
          Sin permiso
        </Badge>
      }
    >
      <div className="flex items-center gap-2">
        <Switch
          checked={isPaid}
          onCheckedChange={handlePaidChange}
          disabled={isPending}
          className="cursor-pointer data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500 dark:data-[state=unchecked]:bg-rose-500"
        />
        <span className="text-sm text-muted-foreground w-36">
          {isPaid ? (
            <Badge variant="success">
              {payment.paymentPlan === PaymentPlan.INSTALLMENTS ? "Pago completo con todas las cuotas" : "Pagado"}
            </Badge>
          ) : (
            <Badge variant="error">Pendiente</Badge>
          )}
        </span>
      </div>
    </ProtectedComponent>
  );
}

// Exportamos el hook para que pueda ser usado en el componente de tabla
export { usePaymentsWithCleanup };

export const columnsPayment = (): ColumnDef<PaymentResponse>[] => [
  {
    id: "select",
    size: 40,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          {...{
            onClick: row.getToggleExpandedHandler(),
          }}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      ) : null;
    },
    enableSorting: false,
  },
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
    id: "monto total",
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto Total" />,
    cell: ({ row }) => (
      <div className="w-24">
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
        className="capitalize w-24 truncate"
      >
        {LabelPaymentPlan[row.getValue("forma de pago") as PaymentPlan]}
      </Badge>
    ),
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

      return row.original.paymentPlan === PaymentPlan.INSTALLMENTS ? (
        <Minus className="text-muted/80" />
      ) : (
        <ProtectedComponent
          requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
          fallback={<Input value={code} readOnly />}
        >
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
              <Button type="button" variant="outline" size="icon" onClick={handleSave} className="border-emerald-500">
                <Save className="size-4 text-emerald-500" />
              </Button>
            )}
          </div>
        </ProtectedComponent>
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

      const handleChange = (date: DateRange | undefined) => {
        const { from, to: _ } = date || {};

        updatePayment({
          id: row.original.id,
          data: {
            billingDate: from
              ? new TZDate(from.getFullYear(), from.getMonth(), from.getDate(), "America/Lima").toISOString()
              : undefined,
          },
        });
      };

      return row.original.paymentPlan === PaymentPlan.INSTALLMENTS ? (
        <Minus className="text-muted/80" />
      ) : (
        <ProtectedComponent
          requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
          fallback={
            <Badge variant="outline" className="flex h-9 items-center gap-2 text-sm">
              {billingDateFormatted ? (
                billingDateFormatted?.toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                <span className="text-muted-foreground text-xs italic">Sin fecha de facturación</span>
              )}
              <Calendar className="text-muted-foreground" />
            </Badge>
          }
        >
          <div className="relative">
            {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
            <CalendarDatePicker
              variant="outline"
              date={{ from: billingDateFormatted, to: billingDateFormatted }}
              onDateSelect={({ from, to }) => {
                handleChange({ from, to });
              }}
              disabled={row.original.isPaid}
              numberOfMonths={1}
              closeOnSelect={true}
            />
          </div>
        </ProtectedComponent>
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

      return row.original.paymentPlan === PaymentPlan.INSTALLMENTS ? (
        <Minus className="text-muted/80" />
      ) : (
        <div className="relative inline-flex gap-1">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}

          <ProtectedComponent
            requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
            fallback={<Input value={email || ""} readOnly />}
          >
            <Input
              value={email || ""}
              onChange={handleChange}
              disabled={row.original.isPaid}
              placeholder="Ingrese el email del destinatario"
              className="min-w-[200px] max-w-[200px] truncate"
            />
            {email !== initialEmail && (
              <Button type="button" variant="outline" size="icon" onClick={handleSave} className="border-emerald-500">
                <Save className="size-4 text-emerald-500" />
              </Button>
            )}
          </ProtectedComponent>
        </div>
      );
    },
  },
  {
    id: "fecha de pago",
    accessorKey: "paymentDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Pago" />,
    cell: function Cell({ row }) {
      const paymentDate = row.original.paymentDate;
      const paymentDateFormatted = paymentDate ? new TZDate(paymentDate as string) : undefined;

      const { mutate: updatePayment, isPending } = useUpdatePaymentStatus();

      const handleChange = (date: DateRange | undefined) => {
        const { from, to: _ } = date || {};

        updatePayment({
          id: row.original.id,
          data: {
            paymentDate: from
              ? new TZDate(from.getFullYear(), from.getMonth(), from.getDate(), "America/Lima").toISOString()
              : undefined,
          },
        });
      };

      return row.original.paymentPlan === PaymentPlan.INSTALLMENTS ? (
        <Minus className="text-muted/80" />
      ) : (
        <ProtectedComponent
          requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
          fallback={
            <Badge variant="outline" className="flex h-9 items-center gap-2 text-sm">
              {paymentDateFormatted ? (
                paymentDateFormatted?.toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                <span className="text-muted-foreground text-xs italic">Sin fecha de pago</span>
              )}
              <Calendar className="text-muted-foreground" />
            </Badge>
          }
        >
          <div className="relative">
            {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
            <CalendarDatePicker
              variant="outline"
              date={{ from: paymentDateFormatted, to: paymentDateFormatted }}
              onDateSelect={({ from, to }) => {
                handleChange({ from, to });
              }}
              numberOfMonths={1}
              disabled={row.original.isPaid}
              closeOnSelect={true}
            />
          </div>
        </ProtectedComponent>
      );
    },
  },
  {
    id: "estado de pago",
    accessorKey: "isPaid",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado de pago" />,
    cell: function Cell({ row }) {
      const payment = row.original;
      return <PaidCell payment={payment} />;
    },
  },
];
