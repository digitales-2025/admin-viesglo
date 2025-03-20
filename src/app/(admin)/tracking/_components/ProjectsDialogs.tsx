"use client";

import { useDialogStore } from "@/shared/stores/useDialogStore";
import ProjectsMutateDrawer from "./ProjectsMutateDrawer";

export default function ProjectsDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const MODULE = "projects";

  return (
    <>
      <ProjectsMutateDrawer
        key="project-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />
    </>
  );
}
