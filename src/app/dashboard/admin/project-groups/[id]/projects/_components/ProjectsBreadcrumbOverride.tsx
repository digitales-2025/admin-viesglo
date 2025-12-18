"use client";

import { usePathname } from "next/navigation";

import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";
import { useProjectGroupById } from "../../../_hooks/use-project-groups";

/**
 * Componente que configura el override del breadcrumb para la página de proyectos
 * Cambia "project-groups" por "Seguimiento", el ID por el nombre del grupo y "projects" por "Proyectos"
 */
export function ProjectsBreadcrumbOverride() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const projectGroupId = pathSegments[3]; // dashboard/admin/project-groups/[id]/projects

  // Obtener datos del grupo de proyectos
  const { data: projectGroup } = useProjectGroupById(projectGroupId || "", !!projectGroupId);

  // Override para "project-groups" -> "Seguimiento" (segmento 1, después de filtrar "admin")
  useBreadcrumbOverride({
    pattern: pathname,
    label: "Seguimiento",
    type: "replace-segment",
    segmentIndex: 1,
  });

  // Override para el ID -> nombre del grupo de proyectos (segmento 2) - bloqueado (no clickeable)
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

  return null;
}
