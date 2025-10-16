"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { useSetDeliverableActualEndDate } from "../../../_hooks/use-deliverable-actual-dates";
import DeliverablesPhaseOverlays from "./_components/deliverables-phase-overlays/DeliverablesPhaseOverlays";
import DeliverablesPhasePrimaryButtons from "./_components/DeliverablesPhasePrimaryButtons";
import DeliverableDocumentsOverlays from "./_components/documents/DeliverableDocumentsOverlays";
import { ListDeliverablesPhase } from "./_components/ListDeliverablesPhase";

export default function ViewPhaseDeliverablesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const phaseId = params.phaseId as string;

  // Estado para manejar el milestoneStatus
  const [milestoneStatus, setMilestoneStatus] = useState<string | undefined>(undefined);

  // Hook para actualizar fecha de fin real
  const { mutate: setActualEndDate } = useSetDeliverableActualEndDate();

  // Callback para confirmar fecha de fin del entregable
  const handleDeliverableEndDateConfirm = (deliverableId: string, endDate: Date) => {
    setActualEndDate(deliverableId, endDate.toISOString());
  };

  return (
    <>
      <div className="px-6 pt-6">
        <ShellHeader>
          <ShellTitle
            title="Entregables de la fase"
            description="Gestiona los entregables de esta fase y controla su progreso."
          />
          <DeliverablesPhasePrimaryButtons milestoneStatus={milestoneStatus as string} />
        </ShellHeader>
      </div>
      <ListDeliverablesPhase milestoneStatus={milestoneStatus} setMilestoneStatus={setMilestoneStatus} />
      <DeliverablesPhaseOverlays
        projectId={projectId}
        phaseId={phaseId}
        onDeliverableEndDateConfirm={handleDeliverableEndDateConfirm}
      />
      <DeliverableDocumentsOverlays projectId={projectId} phaseId={phaseId} />
    </>
  );
}
