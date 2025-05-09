"use client";

import { CheckCircle2 } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useMarkPaymentStatus } from "../_hooks/usePayments";
import { TypePayment } from "../../quotation/_types/quotation.types";

export default function PaymentDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: markPaymentStatus } = useMarkPaymentStatus();
  const MODULE = "payments";

  return (
    <ConfirmDialog
      key="payment-update"
      open={isOpenForModule(MODULE, "update")}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      handleConfirm={() => {
        if (!data?.id) {
          close();
          return;
        }

        markPaymentStatus(
          {
            id: data.id,
            data: {
              isPaid: true,
              paymentDate: data.paymentDate || new Date().toISOString(),
              billingCode: data.billingCode || "",
            },
          },
          {
            onSuccess: () => {
              close();
            },
          }
        );
      }}
      title={
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Marcar como Pagado
        </div>
      }
      desc={
        <>
          Estás a punto de marcar el pago <strong className="uppercase text-wrap">{data?.code}</strong> como realizado.{" "}
          <br />
          Esta acción es irreversible.
          <br />
          {data?.typePayment === TypePayment.MONTHLY ? (
            <AlertMessage
              variant="info"
              title="Pago Mensual"
              description="Este pago es de tipo mensual y al actualizarlo como completado, está confirmando que todas las cuotas mensuales han sido pagadas en su totalidad. Esta acción indicará que el cliente ha cumplido con el pago completo del servicio."
            />
          ) : null}
        </>
      }
      confirmText="Confirmar"
      cancelBtnText="Cancelar"
    />
  );
}
