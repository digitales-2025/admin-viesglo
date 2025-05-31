"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteClinic } from "../_hooks/useClinics";
import { ClinicsMutateDrawer } from "./ClinicsMutateDrawer";

export default function ClinicsDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteClinic } = useDeleteClinic();
  // Constantes para módulo
  const MODULE = "clinics";

  return (
    <>
      <ClinicsMutateDrawer
        key="clinic-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      <ConfirmDialog
        key="clinic-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteClinic(data.id, {
            onSuccess: () => close(),
          });
        }}
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar clínica
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar la clínica <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
          </>
        }
      />
    </>
  );
}
