"use client";

import { ProjectGroupResponseDto } from "../../_types/project-groups.types";
import ProjectGroupsEditorSheet from "../editor/ProjectGroupsEditorSheet";

interface ProjectGroupsOverlaysProps {
  editorOpen: boolean;
  onEditorOpenChange: (open: boolean) => void;
  currentProjectGroup: ProjectGroupResponseDto | null;
}

export function ProjectGroupsOverlays({
  editorOpen,
  onEditorOpenChange,
  currentProjectGroup,
}: ProjectGroupsOverlaysProps) {
  return (
    <ProjectGroupsEditorSheet
      open={editorOpen}
      onOpenChange={onEditorOpenChange}
      currentRow={currentProjectGroup || undefined}
    />
  );
}
