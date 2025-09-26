"use client";

import { useDialogStore } from "@/shared/stores/useDialogStore";
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
    </>
  );
}
