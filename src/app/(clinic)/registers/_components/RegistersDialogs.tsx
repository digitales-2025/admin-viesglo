"use client";

import { Trash } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteMedicalRecord } from "../../../(admin)/medical-records/_hooks/useMedicalRecords";
import RegistersMutateDrawer from "./RegistersMutateDrawer";

export default function RegistersDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteMedicalRecord, isPending: isDeleting } = useDeleteMedicalRecord();

  // Constantes para módulo
  const MODULE = "registers";

  const handleDelete = () => {
    if (data?.id) {
      deleteMedicalRecord(data.id, {
        onSuccess: () => {
          toast.success("Registro médico eliminado correctamente");
          close();
        },
        onError: (error) => {
          toast.error(error.message || "Error al eliminar el registro médico");
        },
      });
    }
  };

  return (
    <>
      <RegistersMutateDrawer
        key="register-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open: boolean) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      <ConfirmDialog
        key="register-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open: boolean) => {
          if (!open) close();
        }}
        isLoading={isDeleting}
        handleConfirm={handleDelete}
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar registro médico
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el registro médico de{" "}
            <strong className="uppercase text-wrap">
              {data?.firstName} {data?.firstLastName}
            </strong>
            . <br />
            Esta acción no se puede deshacer.
          </>
        }
      />
    </>
  );
}
