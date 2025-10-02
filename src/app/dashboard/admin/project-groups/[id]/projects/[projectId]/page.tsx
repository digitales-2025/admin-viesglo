"use client";

import React from "react";
import { useParams } from "next/navigation";

import MilestonesProjectOverlays from "@/app/dashboard/admin/project-groups/[id]/projects/[projectId]/_components/milestones-project-overlays/MilestonesProjectOverlays";
import MilestonesProjectPrimaryButtons from "@/app/dashboard/admin/project-groups/[id]/projects/[projectId]/_components/MilestonesProjectPrimaryButtons";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { ListMilestonesProject } from "./_components/ListMilestonesProject";
import PhasesProjectOverlays from "./_components/phases-project-overlays/PhasesProjectOverlays";

export default function ViewProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <>
      <div className="px-6 pt-6">
        <ShellHeader>
          <ShellTitle
            title="Hitos del proyecto"
            description="Divide el proyecto en hitos y controla su avance con las actividades."
          />
          <MilestonesProjectPrimaryButtons />
        </ShellHeader>
      </div>
      <ListMilestonesProject />
      <MilestonesProjectOverlays projectId={projectId as string} />
      <PhasesProjectOverlays projectId={projectId as string} />
    </>
  );
}
