"use client";

import { useDialogStore } from "@/shared/stores/useDialogStore";
import ProjectFieldsEditorDialog from "../dialog/ProjectFieldsEditorDialog";
import ProjectProgressDialog from "../dialog/ProjectProgressDialog";
import ProjectsEditorSheet from "../editor/ProjectsEditorSheet";

interface ProjectsOverlaysProps {
  projectGroupId: string;
}

export default function ProjectsOverlays({ projectGroupId }: ProjectsOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const MODULE = "projects";

  return (
    <>
      <ProjectsEditorSheet
        key="project-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
        projectGroupId={projectGroupId}
      />

      <ProjectFieldsEditorDialog
        key="project-fields-edit"
        open={isOpenForModule(MODULE, "edit-fields")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        project={data}
      />

      <ProjectProgressDialog
        key="project-progress"
        open={isOpenForModule(MODULE, "progress")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        project={data}
      />
    </>
  );
}
