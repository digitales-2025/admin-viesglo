import { Trash } from "lucide-react";

import { useDeleteActivityProject } from "@/app/dashboard/admin/tracking/_hooks/useActivitiesProject";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import EvidencePreviewDialog from "./EvidencePreviewDialog";
import ProjectActivityMutateDrawer from "./ProjectActivityMutateDrawer";

export const MODULE_PROJECT_ACTIVITIES = "project-activities";
export default function ProjectActivitiesDialogs({ objectiveId }: { objectiveId: string }) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteActivityProject, isPending: isDeleting } = useDeleteActivityProject();

  const isCreateForThisObjective =
    isOpenForModule(MODULE_PROJECT_ACTIVITIES, "create") && data?.objectiveId === objectiveId;

  // Segunda condición: si está en modo de edición, verificar también que el objectiveId coincida
  const isEditForThisObjective =
    isOpenForModule(MODULE_PROJECT_ACTIVITIES, "edit") && data?.objectiveId === objectiveId;

  const isDeleteForThisObjective =
    isOpenForModule(MODULE_PROJECT_ACTIVITIES, "delete") && data?.objectiveId === objectiveId;

  // Solo abrir este diálogo específico si una de las condiciones es verdadera
  const shouldOpen = isCreateForThisObjective || isEditForThisObjective;
  const isPreviewForThisObjective =
    isOpenForModule(MODULE_PROJECT_ACTIVITIES, "view") && data?.objectiveId === objectiveId;

  return (
    <>
      <ProjectActivityMutateDrawer
        key={`project-activity-mutate-${objectiveId}`}
        open={shouldOpen}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isEditForThisObjective ? data : undefined}
        objectiveId={objectiveId}
      />

      <ConfirmDialog
        key={`project-activity-delete-${objectiveId}`}
        open={isDeleteForThisObjective}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteActivityProject(
            { objectiveId, activityId: data.id },
            {
              onSuccess: () => close(),
            }
          );
        }}
        disabled={isDeleting}
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar actividad
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar la actividad <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
          </>
        }
      />

      <EvidencePreviewDialog
        key={`project-activity-preview-${objectiveId}`}
        activity={isPreviewForThisObjective ? data : null}
        open={isPreviewForThisObjective}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    </>
  );
}
