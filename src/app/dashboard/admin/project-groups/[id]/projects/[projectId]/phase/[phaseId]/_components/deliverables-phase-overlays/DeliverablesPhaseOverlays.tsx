import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteDeliverable } from "../../../../../_hooks/use-project-deliverables";
import { DeliverableEditorSheet } from "../editor/DeliverableEditorSheet";

export const MODULE_DELIVERABLES_PHASE = "deliverables-phase";

export default function DeliverablesPhaseOverlays({ projectId, phaseId }: { projectId: string; phaseId: string }) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteDeliverable, isPending: isDeleting } = useDeleteDeliverable();

  return (
    <>
      <DeliverableEditorSheet
        key="deliverable-mutate"
        open={
          isOpenForModule(MODULE_DELIVERABLES_PHASE, "create") || isOpenForModule(MODULE_DELIVERABLES_PHASE, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_DELIVERABLES_PHASE, "edit") ? data : undefined}
        projectId={projectId}
        phaseId={phaseId}
      />

      <ConfirmDialog
        key="deliverable-delete"
        open={isOpenForModule(MODULE_DELIVERABLES_PHASE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteDeliverable(
            {
              params: {
                path: {
                  projectId,
                  phaseId,
                  deliverableId: data.id,
                },
              },
            },
            {
              onSuccess: () => {
                close();
              },
            }
          );
        }}
        isLoading={isDeleting}
        confirmText="Eliminar"
        destructive
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar entregable
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el entregable <strong className="uppercase text-wrap">{data?.name}</strong>.{" "}
            <br />
            Esta acción es irreversible.
          </>
        }
      />
    </>
  );
}
