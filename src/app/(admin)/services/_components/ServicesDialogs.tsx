import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useInvalidateObjectives } from "../_hooks/useObjectives";
import { useDeleteService } from "../_hooks/useServices";
import { useServiceStore } from "../_hooks/useServiceStore";
import ServicesMutateDrawer from "./ServicesMutateDrawer";

export default function ServicesDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteService } = useDeleteService();
  const MODULE = "services";

  const { clearOnServiceDelete } = useServiceStore();
  const invalidateObjectives = useInvalidateObjectives();

  return (
    <>
      {/* Diálogo para crear/editar servicio */}
      <ServicesMutateDrawer
        key="service-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Diálogo para eliminar servicio */}
      <ConfirmDialog
        key="service-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteService(data.id, {
            onSuccess: () => {
              clearOnServiceDelete(data.id);
              invalidateObjectives();
              close();
            },
          });
        }}
        className="max-w-md"
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar servicio
            <strong className="uppercase text-wrap">{data?.name}</strong>
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el servicio <strong>{data?.name}</strong>. <br />
            Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
      />
    </>
  );
}
