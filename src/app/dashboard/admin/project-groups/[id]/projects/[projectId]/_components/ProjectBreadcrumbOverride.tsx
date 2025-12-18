"use client";

import { useParams, usePathname } from "next/navigation";

import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";
import { useProjectContext } from "../_context/ProjectContext";
import { useProjectGroupById } from "../../../../_hooks/use-project-groups";

/**
 * Componente que configura el override del breadcrumb para la página de un proyecto
 * Cambia "project-groups" por "Seguimiento", el ID del grupo por su nombre,
 * "projects" por "Proyectos" y el ID del proyecto por su nombre
 */
export function ProjectBreadcrumbOverride() {
  const pathname = usePathname();
  const params = useParams();
  const projectGroupId = params.id as string;
  const { projectData } = useProjectContext();

  // Obtener datos del grupo de proyectos
  const { data: projectGroup } = useProjectGroupById(projectGroupId || "", !!projectGroupId);

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
          customUrl: `/dashboard/admin/project-groups/${projectGroupId}/projects/${params.projectId}`,
        }
      : null
  );

  return null;
}
