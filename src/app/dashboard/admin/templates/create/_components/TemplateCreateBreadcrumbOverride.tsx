"use client";

import { usePathname } from "next/navigation";

import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";

/**
 * Componente que configura el override del breadcrumb para la página de crear plantilla
 * Cambia "templates" por "Plantillas" y "create" por "Crear"
 */
export function TemplateCreateBreadcrumbOverride() {
  const pathname = usePathname();

  // Override para "templates" -> "Plantillas" (segmento 1, después de filtrar "admin")
  useBreadcrumbOverride({
    pattern: pathname,
    label: "Plantillas",
    type: "replace-segment",
    segmentIndex: 1,
  });

  // Override para "create" -> "Crear" (segmento 2)
  useBreadcrumbOverride({
    pattern: pathname,
    label: "Crear",
    type: "replace-segment",
    segmentIndex: 2,
  });

  return null;
}
