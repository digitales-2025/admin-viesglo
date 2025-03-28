"use client";

import { CheckCircle2 } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useMarkPaymentStatus } from "../_hooks/usePayments";

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
        </>
      }
      confirmText="Confirmar"
      cancelBtnText="Cancelar"
    />
  );
}
