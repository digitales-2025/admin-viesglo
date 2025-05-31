"use client";

import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, CalendarSync, CreditCard, Mail } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { Loading } from "@/shared/components/loading";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useInstallmentPayments } from "../_hooks/useInstallmentPayment";
import { usePaymentInstallmentConfig } from "../_hooks/usePaymentInstallmentConfig";
import { PaymentResponse } from "../_types/payment.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";
import InstallmentsDialogs, { MODULE_INSTALLMENT_PAYMENTS } from "./InstallmentsDialogs";
import InstallmentsPaymentTable from "./InstallmentsPaymentTable";

interface InstallmentsPaymentDetailProps {
  payment: PaymentResponse;
}

export default function InstallmentsPaymentDetail({ payment }: InstallmentsPaymentDetailProps) {
  const { data: paymentInstallmentConfig, isLoading: isLoadingPaymentInstallmentConfig } = usePaymentInstallmentConfig(
    payment.id
  );
  const { data: paymentItems, isLoading, error } = useInstallmentPayments(payment.id);
  const { open } = useDialogStore();

  if (isLoadingPaymentInstallmentConfig || isLoading) {
    return <Loading variant="dots" />;
  }

  // Calcular el total de los pagos
  const totalAmountPaid =
    paymentItems?.reduce((sum, item) => sum + (item.isPaid && item.isActive ? item.amount : 0), 0) || 0;
  const percentagePaid = payment.amount > 0 ? (totalAmountPaid / payment.amount) * 100 : 0;

  if (error) {
    return (
      <AlertMessage
        variant="destructive"
        title="Error"
        description={error.message || "Error al cargar los pagos de la cotización"}
      />
    );
  }

  return (
    <div
      className={cn(
        "pb-4 bg-muted/30 rounded-md overflow-x-auto sm:max-w-[calc(100vw-19.6rem)] max-w-[calc(100vw-3.7rem)]"
      )}
    >
      <Card className="w-full">
        <CardHeader className=" flex items-center justify-between flex-row">
          <div className="flex flex-col">
            <CardTitle className="text-lg font-bold">Pagos</CardTitle>
            <CardDescription>Detalles del cronograma de pagos</CardDescription>
          </div>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.execute }]}>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  open(
                    MODULE_INSTALLMENT_PAYMENTS,
                    "update",
                    paymentInstallmentConfig ? paymentInstallmentConfig : { paymentId: payment.id }
                  );
                }}
              >
                <CalendarSync className="w-4 h-4 mr-2" />
                Configurar cronograma de pagos
              </Button>
            </div>
          </ProtectedComponent>
        </CardHeader>
        <CardContent>
          {paymentInstallmentConfig ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso de pago</span>
                  <span className="font-medium">{percentagePaid.toFixed(0)}% pagado del total</span>
                </div>
                <Progress value={Math.min(percentagePaid, 100)} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-8 text-emerald-500 bg-emerald-500/10 p-2 rounded-md" />
                    <span className="text-sm font-medium">Detalles de Cuotas</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Número de cuotas:</span>
                    <span className="font-medium">{paymentInstallmentConfig.installmentsQuantity}</span>

                    <span className="text-muted-foreground">Monto por cuota:</span>
                    <span className="font-medium">{paymentInstallmentConfig.installmentsAmount}</span>

                    <span className="text-muted-foreground">Día de facturación:</span>
                    <span className="font-medium">{paymentInstallmentConfig.installmentsDates}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-8 text-emerald-500 bg-emerald-500/10 p-2 rounded-md" />
                    <span className="text-sm font-medium">Periodo de Servicio</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Fecha de inicio:</span>
                    <span className="font-medium">
                      {formatDate(paymentInstallmentConfig.startDateService, "PP", { locale: es })}
                    </span>

                    <span className="text-muted-foreground">Fecha de fin:</span>
                    <span className="font-medium">
                      {formatDate(paymentInstallmentConfig.endDateService, "PP", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="size-8 text-emerald-500 bg-emerald-500/10 p-2 rounded-md" />
                  <span className="text-sm font-medium">Correos de notificación de pago</span>
                </div>
                <div className="flex flex-wrap gap-2">{paymentInstallmentConfig.installmentsEmails}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-row gap-2">
              <AlertMessage
                variant="info"
                title="No hay cronograma de pagos configurado"
                description="Configure primero el cronograma de pagos para esta cotización"
              />
            </div>
          )}
        </CardContent>
        <Separator />
        <CardFooter>
          {paymentInstallmentConfig ? (
            <InstallmentsPaymentTable payment={payment} />
          ) : (
            <AlertMessage
              variant="warning"
              title="No hay cronograma de pagos configurado"
              description="Para ingresar los pagos, primero configure el cronograma de pagos"
            />
          )}
        </CardFooter>
      </Card>
      <InstallmentsDialogs />
    </div>
  );
}
