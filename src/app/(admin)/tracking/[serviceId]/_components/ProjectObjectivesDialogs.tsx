import { useDialogStore } from "@/shared/stores/useDialogStore";
import ObjectiveMutateDrawer from "./ProjectObjectiveMutateDrawer";

export const MODULE_PROJECT_OBJECTIVES = "project-objectives";
export default function ProjectObjectivesDialogs({ serviceId }: { serviceId: string }) {
  const { isOpenForModule, data, close } = useDialogStore();

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
    </>
  );
}
