import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useOpenMilestoneStore } from "../../_stores/useOpenMilestoneStore";
import { useRemovePhase } from "../../../_hooks/use-phase";
import PhasesEditorSheet from "../editor/PhasesEditorSheet";

export const MODULE_PHASES_PROJECT = "phases-project";

interface PhasesProjectOverlaysProps {
  projectId: string;
}

export default function PhasesProjectOverlays({ projectId }: PhasesProjectOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { openMilestoneId } = useOpenMilestoneStore();

  // Obtener milestoneId del store o de los datos del dialog store
  const currentMilestoneId = data?.milestoneId || openMilestoneId || "";

  const { mutate: removePhase, isPending: isRemovingPhase } = useRemovePhase();

  return (
    <>
      {/* Phase Editor Sheet */}
      <PhasesEditorSheet
        key="phase-mutate"
        open={isOpenForModule(MODULE_PHASES_PROJECT, "create") || isOpenForModule(MODULE_PHASES_PROJECT, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_PHASES_PROJECT, "edit") ? data : undefined}
        projectId={projectId}
        milestoneId={currentMilestoneId}
        phaseId={isOpenForModule(MODULE_PHASES_PROJECT, "edit") ? data?.id : undefined}
      />

      {/* Phase Delete Dialog */}
      <ConfirmDialog
        key="phase-delete"
        open={isOpenForModule(MODULE_PHASES_PROJECT, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isRemovingPhase) return;
          if (!data?.id) {
            return;
          }
          removePhase(
            {
              params: {
                path: {
                  projectId,
                  milestoneId: currentMilestoneId,
                  phaseId: data.id,
                },
              },
            },
            {
              onSuccess: () => close(),
            }
          );
        }}
        isLoading={isRemovingPhase}
        confirmText="Eliminar"
        destructive
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar fase
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar la fase <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
            Esta acción es irreversible.
          </>
        }
      />
    </>
  );
}
