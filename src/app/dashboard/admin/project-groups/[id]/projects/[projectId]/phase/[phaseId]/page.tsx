"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import DeliverablesPhaseOverlays from "./_components/deliverables-phase-overlays/DeliverablesPhaseOverlays";
import DeliverablesPhasePrimaryButtons from "./_components/DeliverablesPhasePrimaryButtons";
import { ListDeliverablesPhase } from "./_components/ListDeliverablesPhase";

export default function ViewPhaseDeliverablesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const phaseId = params.phaseId as string;
  const milestoneId = searchParams.get("milestoneId") || "";

  return (
    <>
      <div className="px-6 pt-6">
        <ShellHeader>
          <ShellTitle
            title="Entregables de la fase"
            description="Gestiona los entregables de esta fase y controla su progreso."
          />
          <DeliverablesPhasePrimaryButtons />
        </ShellHeader>
      </div>
      <ListDeliverablesPhase />
      {milestoneId && <DeliverablesPhaseOverlays projectId={projectId} phaseId={phaseId} milestoneId={milestoneId} />}
    </>
  );
}
