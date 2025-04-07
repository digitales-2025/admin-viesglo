import { useDialogStore } from "@/shared/stores/useDialogStore";
import ProjectActivityMutateDrawer from "./ProjectActivityMutateDrawer";

export const MODULE_PROJECT_ACTIVITIES = "project-activities";
export default function ProjectActivitiesDialogs({ objectiveId }: { objectiveId: string }) {
  const { isOpenForModule, data, close } = useDialogStore();

  return (
    <>
      <ProjectActivityMutateDrawer
        key="project-activity-mutate"
        open={
          isOpenForModule(MODULE_PROJECT_ACTIVITIES, "create") || isOpenForModule(MODULE_PROJECT_ACTIVITIES, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_PROJECT_ACTIVITIES, "edit") ? data : undefined}
        objectiveId={objectiveId}
      />
    </>
  );
}
