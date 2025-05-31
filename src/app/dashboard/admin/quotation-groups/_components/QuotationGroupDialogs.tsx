"use client";

import { Edit, Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteQuotationGroup, useTogleActiveQuotationGroup } from "../_hooks/useQuotationGroup";
import QuotationGroupMutateDrawer from "./QuotationGroupMutateDrawer";

export const MODULE_QUOTATION_GROUP = "quotation-groups";
export default function QuotationGroupDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteQuotationGroup } = useDeleteQuotationGroup();
  const { mutate: togleActive } = useTogleActiveQuotationGroup();

  return (
    <>
      <QuotationGroupMutateDrawer
        key="quotation-group-mutate"
        open={isOpenForModule(MODULE_QUOTATION_GROUP, "create") || isOpenForModule(MODULE_QUOTATION_GROUP, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_QUOTATION_GROUP, "edit") ? data : undefined}
      />

      <ConfirmDialog
        key="quotation-group-delete"
        open={isOpenForModule(MODULE_QUOTATION_GROUP, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteQuotationGroup(data?.id || "", {
            onSuccess: () => close(),
          });
        }}
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar grupo de cotizaciones
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el grupo de cotizaciones{" "}
            <strong className="uppercase text-wrap">{data?.name}</strong>.
            <br />
            Esta acción es irreversible.
          </>
        }
      />

      <ConfirmDialog
        key="quotation-group-togle-active"
        open={isOpenForModule(MODULE_QUOTATION_GROUP, "togleActive")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          togleActive(data.id, {
            onSuccess: () => close(),
          });
        }}
        title={
          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-emerald-500" />
            Activar grupo de cotizaciones
          </div>
        }
        desc={
          <>
            Estás a punto de activar el grupo de cotizaciones{" "}
            <strong className="uppercase text-wrap">{data?.name}</strong>.
          </>
        }
      />
    </>
  );
}
