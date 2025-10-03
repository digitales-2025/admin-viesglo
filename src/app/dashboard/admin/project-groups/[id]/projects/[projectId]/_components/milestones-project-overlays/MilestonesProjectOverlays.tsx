import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteMilestone } from "../../_hooks/use-project-milestones";
import ProjectMilestoneEditorSheet from "../editor/ProjectMilestoneEditorSheet";

export const MODULE_MILESTONES_PROJECT = "milestones-project";

interface MilestonesProjectOverlaysProps {
  projectId: string;
}

export default function MilestonesProjectOverlays({ projectId }: MilestonesProjectOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteMilestone, isPending: isDeleting } = useDeleteMilestone();

  return (
    <>
      {/* Milestone Editor Sheet */}
      <ProjectMilestoneEditorSheet
        key="milestone-mutate"
        open={
          isOpenForModule(MODULE_MILESTONES_PROJECT, "create") || isOpenForModule(MODULE_MILESTONES_PROJECT, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_MILESTONES_PROJECT, "edit") ? data : undefined}
        projectId={projectId}
      />

      {/* Milestone Delete Dialog */}
      <ConfirmDialog
        key="milestone-delete"
        open={isOpenForModule(MODULE_MILESTONES_PROJECT, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteMilestone(
            {
              params: {
                path: {
                  projectId,
                  milestoneId: data.id,
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
            Eliminar hito
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el hito <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
            Esta acción es irreversible.
          </>
        }
      />
    </>
  );
}
