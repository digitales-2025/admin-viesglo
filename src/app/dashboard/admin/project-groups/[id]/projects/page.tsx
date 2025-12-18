"use client";

import React from "react";
import { useParams } from "next/navigation";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ProjectsOverlays from "./_components/projects-overlays/ProjectsOverlays";
import { ProjectsBreadcrumbOverride } from "./_components/ProjectsBreadcrumbOverride";
import ProjectsContainer from "./_components/view/ProjectsContainer";
import ProjectsPrimaryButtons from "./_components/view/ProjectsPrimaryButtons";

export default function ProjectsPage() {
  const params = useParams();
  const projectGroupId = params.id as string;

  return (
    <>
      <ProjectsBreadcrumbOverride />
      <ShellHeader>
        <ShellTitle
          title={"Proyectos"}
          description={"Gestiona y monitorea el progreso de todos los proyectos del grupo"}
        />
        <ProjectsPrimaryButtons />
      </ShellHeader>
      <ProjectsContainer projectGroupId={projectGroupId} />
      <ProjectsOverlays projectGroupId={projectGroupId} />
    </>
  );
}
