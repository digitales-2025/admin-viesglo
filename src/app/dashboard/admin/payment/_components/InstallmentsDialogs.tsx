import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteInstallmentPayment } from "../_hooks/useInstallmentPayment";
import { useMarkPaymentStatus } from "../_hooks/usePayments";
import InstallmentsConfigForm from "./InstallmentsConfigForm";

export const MODULE_INSTALLMENT_PAYMENTS = "installments-payments";

export default function InstallmentsDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: markPaymentStatus } = useMarkPaymentStatus();
  const { mutate: deleteInstallmentPayment } = useDeleteInstallmentPayment();

  return (
    <>
      <ConfirmDialog
        key="installments-payment-confirm"
        open={isOpenForModule(MODULE_INSTALLMENT_PAYMENTS, "create")}
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
        title="Confirmar pago"
        desc="¿Estás seguro de querer marcar este pago como pagado?"
      />

      <ConfirmDialog
        key="installments-payment-delete"
        open={isOpenForModule(MODULE_INSTALLMENT_PAYMENTS, "delete")}
        onOpenChange={(open) => {
          if (!open) {
            close();
          }
        }}
        handleConfirm={() => {
          if (!data?.paymentId || !data?.installmentId) {
            close();
            return;
          }

          deleteInstallmentPayment(data.installmentId, {
            onSuccess: () => {
              close();
            },
          });
        }}
        title="Eliminar pago"
        desc="¿Estás seguro de querer eliminar este pago?"
        destructive
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
      />

      <InstallmentsConfigForm
        open={isOpenForModule(MODULE_INSTALLMENT_PAYMENTS, "update")}
        onOpenChange={close}
        currentRow={data}
        paymentId={data?.paymentId}
      />
    </>
  );
}
