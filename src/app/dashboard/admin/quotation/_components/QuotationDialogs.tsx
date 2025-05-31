"use client";

import { CheckCircle2, Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useConcreteQuotation, useDeleteQuotation } from "../_hooks/useQuotations";
import { QuotationMutateDrawer } from "./QuotationMutateDrawer";

export default function QuotationDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteQuotation } = useDeleteQuotation();
  const { mutate: concreteQuotation } = useConcreteQuotation();
  // Constantes para módulo
  const MODULE = "quotations";

  return (
    <>
      <QuotationMutateDrawer
        key="quotation-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      <ConfirmDialog
        key="quotation-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (!data?.id) {
            close();
            return;
          }

          try {
            deleteQuotation(data.id, {
              onSuccess: () => {
                close();
              },
            });
          } catch (error) {
            console.error(error);
            close();
          }
        }}
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar cotización
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar la cotización <strong className="uppercase text-wrap">{data?.code}</strong>.{" "}
            <br />
            Esta acción es irreversible.
          </>
        }
      />

      <ConfirmDialog
        key="quotation-concrete"
        open={isOpenForModule(MODULE, "concrete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (!data?.id) {
            close();
            return;
          }

          concreteQuotation(
            {
              id: data.id,
              data: {
                isConcrete: true,
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
            Concretar Cotización
          </div>
        }
        desc={
          <>
            Estás a punto de marcar la cotización <strong className="uppercase text-wrap">{data?.code}</strong> como
            concretada. <br />
            Esta acción es irreversible.
          </>
        }
        confirmText="Concretar"
        cancelBtnText="Cancelar"
      />
    </>
  );
}
