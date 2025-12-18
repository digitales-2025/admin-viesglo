"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Separator } from "@/shared/components/ui/separator";
import { useProjectContext } from "../../_context/ProjectContext";
import { useSetAdditionalDeliverableActualEndDate } from "../../../_hooks/use-additional-deliverable-actual-dates";
import { useSetDeliverableActualEndDate } from "../../../_hooks/use-deliverable-actual-dates";
import AdditionalDeliverablesPhaseOverlays from "./_components/additional-deliverables-phase-overlays/AdditionalDeliverablesPhaseOverlays";
import DeliverablesPhaseOverlays from "./_components/deliverables-phase-overlays/DeliverablesPhaseOverlays";
import DeliverablesPhasePrimaryButtons from "./_components/DeliverablesPhasePrimaryButtons";
import DeliverableDocumentsOverlays from "./_components/documents/DeliverableDocumentsOverlays";
import { ListAdditionalDeliverablesPhase } from "./_components/ListAdditionalDeliverablesPhase";
import { ListDeliverablesPhase } from "./_components/ListDeliverablesPhase";
import { PhaseBreadcrumbOverride } from "./_components/PhaseBreadcrumbOverride";

export default function ViewPhaseDeliverablesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const phaseId = params.phaseId as string;

  // Obtener el proyecto del contexto para encontrar el milestoneId
  const { projectData } = useProjectContext();

  // Encontrar el milestoneId basado en el phaseId
  const milestoneId = useMemo(() => {
    if (!projectData?.milestones) return undefined;
    for (const milestone of projectData.milestones) {
      const phase = milestone.phases?.find((p) => p.id === phaseId);
      if (phase) return milestone.id;
    }
    return undefined;
  }, [projectData?.milestones, phaseId]);

  // Estado para manejar el milestoneStatus
  const [milestoneStatus, setMilestoneStatus] = useState<string | undefined>(undefined);

  // Hook para actualizar fecha de fin real de entregables normales
  const { mutate: setActualEndDate } = useSetDeliverableActualEndDate();

  // Hook para actualizar fecha de fin real de entregables adicionales
  const { mutate: setAdditionalActualEndDate } = useSetAdditionalDeliverableActualEndDate();

  // Callback para confirmar fecha de fin del entregable normal
  const handleDeliverableEndDateConfirm = (deliverableId: string, endDate: Date) => {
    setActualEndDate(deliverableId, endDate.toISOString());
  };

  // Callback para confirmar fecha de fin del entregable adicional
  const handleAdditionalDeliverableEndDateConfirm = (additionalDeliverableId: string, endDate: Date) => {
    setAdditionalActualEndDate(additionalDeliverableId, endDate.toISOString());
  };

  return (
    <>
      <PhaseBreadcrumbOverride />
      <div className="px-6 pt-6">
        <ShellHeader>
          <ShellTitle
            title="Entregables de la fase"
            description="Gestiona los entregables normales de esta fase y controla su progreso."
          />
          <DeliverablesPhasePrimaryButtons milestoneStatus={milestoneStatus as string} />
        </ShellHeader>
      </div>
      {/* Entregables normales */}
      <ListDeliverablesPhase milestoneStatus={milestoneStatus} setMilestoneStatus={setMilestoneStatus} />

      {/* Separador entre secciones - Solo mostrar si el milestone está en PLANNING */}
      {milestoneStatus !== "PLANNING" && <Separator className="my-4" />}

      {/* Entregables adicionales - Solo mostrar si el milestone está en PLANNING */}
      {milestoneStatus !== "PLANNING" && <ListAdditionalDeliverablesPhase />}

      {/* Overlays para entregables normales */}
      <DeliverablesPhaseOverlays
        projectId={projectId}
        phaseId={phaseId}
        milestoneId={milestoneId}
        onDeliverableEndDateConfirm={handleDeliverableEndDateConfirm}
      />

      {/* Overlays para entregables adicionales */}
      <AdditionalDeliverablesPhaseOverlays
        projectId={projectId}
        phaseId={phaseId}
        onAdditionalDeliverableEndDateConfirm={handleAdditionalDeliverableEndDateConfirm}
      />

      {/* Overlays para documentos de entregables normales */}
      <DeliverableDocumentsOverlays projectId={projectId} phaseId={phaseId} />
    </>
  );
}
