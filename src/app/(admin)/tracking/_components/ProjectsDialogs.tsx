"use client";

import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectServiceMutateDrawer from "./ProjectServiceMutateDrawer";
import ProjectsMutateDrawer from "./ProjectsMutateDrawer";

export default function ProjectsDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { selectedProject } = useProjectStore();
  const MODULE = "projects";
  const PROJECT_SERVICE_MODULE = "project-services";

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
      {selectedProject && (
        <ProjectServiceMutateDrawer
          key="project-services"
          open={isOpenForModule(PROJECT_SERVICE_MODULE, "create")}
          onOpenChange={(open) => {
            if (!open) close();
          }}
          currentRow={isOpenForModule(PROJECT_SERVICE_MODULE, "edit") ? data : undefined}
          projectId={selectedProject.id}
        />
      )}
    </>
  );
}
