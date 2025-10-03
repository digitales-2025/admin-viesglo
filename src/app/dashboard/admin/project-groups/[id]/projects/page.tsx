"use client";

import React from "react";
import { useParams } from "next/navigation";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ProjectsOverlays from "./_components/projects-overlays/ProjectsOverlays";
import ProjectsContainer from "./_components/view/ProjectsContainer";
import ProjectsPrimaryButtons from "./_components/view/ProjectsPrimaryButtons";

export default function ProjectsPage() {
  const params = useParams();
  const projectGroupId = params.id as string;

  return (
    <>
      <ShellHeader>
        <ShellTitle title={"Proyectos"} />
        <ProjectsPrimaryButtons />
      </ShellHeader>
      <ProjectsContainer projectGroupId={projectGroupId} />
      <ProjectsOverlays projectGroupId={projectGroupId} />
    </>
  );
}
