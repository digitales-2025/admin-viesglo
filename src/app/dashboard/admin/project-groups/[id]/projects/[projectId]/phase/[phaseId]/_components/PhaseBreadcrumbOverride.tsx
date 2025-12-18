"use client";

import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";

import { useProjectGroupById } from "@/app/dashboard/admin/project-groups/_hooks/use-project-groups";
import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";
import { useProjectContext } from "../../../_context/ProjectContext";

/**
 * Componente que configura el override del breadcrumb para la página de una fase
 * Cambia "project-groups" por "Seguimiento", los IDs por nombres y "phase" por "Fase"
 */
export function PhaseBreadcrumbOverride() {
  const pathname = usePathname();
  const params = useParams();
  const projectGroupId = params.id as string;
  const projectId = params.projectId as string;
  const phaseId = params.phaseId as string;
  const { projectData } = useProjectContext();

  // Obtener datos del grupo de proyectos
  const { data: projectGroup } = useProjectGroupById(projectGroupId || "", !!projectGroupId);

  // Encontrar la fase específica dentro de los milestones del proyecto
  const phase = useMemo(() => {
    if (!projectData?.milestones) return null;
    for (const milestone of projectData.milestones) {
      const foundPhase = milestone.phases?.find((p) => p.id === phaseId);
      if (foundPhase) return foundPhase;
    }
    return null;
  }, [projectData?.milestones, phaseId]);

  // Override para "project-groups" -> "Seguimiento" (segmento 1, después de filtrar "admin")
  useBreadcrumbOverride({
    pattern: pathname,
    label: "Seguimiento",
    type: "replace-segment",
    segmentIndex: 1,
  });

  // Override para el ID del grupo -> nombre del grupo (segmento 2) - bloqueado (no clickeable)
  useBreadcrumbOverride(
    projectGroup
      ? {
          pattern: pathname,
          label: projectGroup.name || "Grupo de Proyectos",
          type: "replace-segment",
          segmentIndex: 2,
          removeUrl: true, // Quita el link, lo hace no clickeable
        }
      : null
  );

  // Override para "projects" -> "Proyectos" (segmento 3)
  useBreadcrumbOverride({
    pattern: pathname,
    label: "Proyectos",
    type: "replace-segment",
    segmentIndex: 3,
  });

  // Override para el ID del proyecto -> nombre del proyecto (segmento 4) - clickeable, redirige a la página del proyecto
  useBreadcrumbOverride(
    projectData
      ? {
          pattern: pathname,
          label: projectData.name || "Proyecto",
          type: "replace-segment",
          segmentIndex: 4,
          customUrl: `/dashboard/admin/project-groups/${projectGroupId}/projects/${projectId}`,
        }
      : null
  );

  // Override para "phase" -> "Fase" (segmento 5) - bloqueado (no clickeable)
  useBreadcrumbOverride({
    pattern: pathname,
    label: "Fase",
    type: "replace-segment",
    segmentIndex: 5,
    removeUrl: true, // Quita el link, lo hace no clickeable
  });

  // Override para el ID de la fase -> nombre de la fase (segmento 6) - bloqueado (no clickeable, es la página actual)
  useBreadcrumbOverride(
    phase
      ? {
          pattern: pathname,
          label: phase.name || "Fase",
          type: "replace-segment",
          segmentIndex: 6,
          removeUrl: true, // Quita el link, lo hace no clickeable (es la página actual)
        }
      : null
  );

  return null;
}
