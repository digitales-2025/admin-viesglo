import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteObjective } from "../_hooks/useObjectives";
import { useServiceStore } from "../_hooks/useServiceStore";
import ObjectivesMutateDrawer from "./ObjectivesMutateDrawer";

export default function ObjectivesDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const MODULE = "objectives";
  const { clearOnObjectiveDelete } = useServiceStore();
  const { mutate: deleteObjective } = useDeleteObjective();

  return (
    <>
      {/* Diálogo para crear/editar objetivo */}
      <ObjectivesMutateDrawer
        key="objective-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Diálogo para eliminar objetivo */}
      <ConfirmDialog
        key="objective-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          // Primero limpiar el estado local
          clearOnObjectiveDelete(data.id);

          // Luego eliminar el objetivo
          deleteObjective(data.id, {
            onSuccess: () => {
              close();
            },
          });
        }}
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar objetivo
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el objetivo <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
            Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
      />
    </>
  );
}
