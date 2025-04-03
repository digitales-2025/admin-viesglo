"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteProject } from "../_hooks/useProject";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectServiceMutateDrawer from "./ProjectServiceMutateDrawer";
import ProjectsMutateDrawer from "./ProjectsMutateDrawer";

export default function ProjectsDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { selectedProject } = useProjectStore();
  const { mutate: deleteProject } = useDeleteProject();
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

      <ConfirmDialog
        key="project-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteProject(data.id, {
            onSuccess: () => close(),
          });
        }}
        title={
          <div className="flex items-center flex-wrap text-wrap gap-2 ">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar proyecto
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el proyecto <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
          </>
        }
      />
    </>
  );
}
