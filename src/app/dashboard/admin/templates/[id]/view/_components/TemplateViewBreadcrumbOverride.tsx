"use client";

import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";
import { ProjectTemplateDetailedResponseDto } from "../../../_types/templates.types";

interface TemplateViewBreadcrumbOverrideProps {
  template: ProjectTemplateDetailedResponseDto;
}

export function TemplateViewBreadcrumbOverride({ template }: TemplateViewBreadcrumbOverrideProps) {
  const pattern = `/dashboard/admin/templates/${template.id}/view`;

  // Override para "templates" -> "Plantillas" (segmento 1, después de filtrar "admin")
  useBreadcrumbOverride(
    template
      ? {
          pattern,
          label: "Plantillas",
          type: "replace-segment",
          segmentIndex: 1,
        }
      : null
  );

  // Override para el ID -> nombre de la plantilla (segmento 2) - bloqueado (no clickeable)
  useBreadcrumbOverride(
    template
      ? {
          pattern,
          label: template.name || "Plantilla",
          type: "replace-segment",
          segmentIndex: 2,
          removeUrl: true, // Quita el link, lo hace no clickeable
        }
      : null
  );

  // Override para "view" -> "Ver" (segmento 3)
  useBreadcrumbOverride(
    template
      ? {
          pattern,
          label: "Ver",
          type: "replace-segment",
          segmentIndex: 3,
        }
      : null
  );

  return null;
}
