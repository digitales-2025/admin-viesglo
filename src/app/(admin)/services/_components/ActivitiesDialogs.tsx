import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteActivity } from "../_hooks/useActivities";
import { useServiceStore } from "../_hooks/useServiceStore";
import { ActivitiesMutateDrawer } from "./ActivitiesMutateDrawer";

export default function ActivitiesDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const MODULE = "activities";
  const { clearOnActivityDelete } = useServiceStore();
  const { mutate: deleteActivity } = useDeleteActivity();

  return (
    <>
      {/* Diálogo para crear/editar actividad */}
      <ActivitiesMutateDrawer
        key="activity-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Diálogo para eliminar actividad */}
      <ConfirmDialog
        key="activity-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          // Primero limpiar el estado local
          clearOnActivityDelete(data.id);

          // Luego eliminar la actividad
          deleteActivity(data.id, {
            onSuccess: () => {
              close();
            },
          });
        }}
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar actividad
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar la actividad <strong>{data?.name}</strong>. <br />
            Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
      />
    </>
  );
}
