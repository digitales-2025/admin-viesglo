import { CheckCircle, Trash } from "lucide-react";

import { MilestoneResourcesDialog } from "@/app/dashboard/admin/milestones-resources/_components/MilestoneResourcesDialog";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteMilestone, useUpdateMilestoneStatus } from "../../_hooks/use-project-milestones";
import ProjectMilestoneEditorSheet from "../editor/ProjectMilestoneEditorSheet";

export const MODULE_MILESTONES_PROJECT = "milestones-project";

interface MilestonesProjectOverlaysProps {
  projectId: string;
}

export default function MilestonesProjectOverlays({ projectId }: MilestonesProjectOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteMilestone, isPending: isDeleting } = useDeleteMilestone();
  const { mutate: updateMilestoneStatus, isPending: isApproving } = useUpdateMilestoneStatus();

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

      {/* Milestone Approve Dialog */}
      <ConfirmDialog
        key="milestone-approve"
        open={isOpenForModule(MODULE_MILESTONES_PROJECT, "approve")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isApproving) return;
          if (!data?.id) {
            return;
          }
          updateMilestoneStatus(
            {
              params: {
                path: {
                  projectId,
                  milestoneId: data.id,
                },
              },
              body: {
                status: "OFFICIALLY_APPROVED",
              },
            },
            {
              onSuccess: () => {
                close();
              },
            }
          );
        }}
        isLoading={isApproving}
        confirmText="Aprobar oficialmente"
        title={
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Aprobar hito oficialmente
          </div>
        }
        desc={
          <>
            Estás a punto de aprobar oficialmente el hito <strong className="uppercase text-wrap">{data?.name}</strong>.{" "}
            <br />
            Esta acción cambiará el estado del hito a "Aprobado oficialmente".
          </>
        }
      />

      <MilestoneResourcesDialog
        key="milestone-resources"
        open={isOpenForModule(MODULE_MILESTONES_PROJECT, "create-resource")}
        currentRow={{ projectId, milestoneId: data?.id }}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    </>
  );
}
