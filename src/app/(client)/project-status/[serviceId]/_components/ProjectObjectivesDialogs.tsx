import { Trash } from "lucide-react";

import { useDeleteObjectiveProject } from "@/app/(admin)/tracking/_hooks/useObjectivesProject";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import ObjectiveMutateDrawer from "./ProjectObjectiveMutateDrawer";

export const MODULE_PROJECT_OBJECTIVES = "project-objectives";
export default function ProjectObjectivesDialogs({ serviceId }: { serviceId: string }) {
  const { isOpenForModule, data, close } = useDialogStore();

  const { mutate: deleteObjectiveProject } = useDeleteObjectiveProject();

  return (
    <>
      <ObjectiveMutateDrawer
        key="objective-mutate"
        open={
          isOpenForModule(MODULE_PROJECT_OBJECTIVES, "create") || isOpenForModule(MODULE_PROJECT_OBJECTIVES, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_PROJECT_OBJECTIVES, "edit") ? data : undefined}
        serviceId={serviceId}
      />
      <ConfirmDialog
        key="objective-delete"
        open={isOpenForModule(MODULE_PROJECT_OBJECTIVES, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteObjectiveProject(
            { serviceId, objectiveId: data.id },
            {
              onSuccess: () => close(),
            }
          );
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
          </>
        }
      />
    </>
  );
}
