"use client";

import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";

/**
 * Componente que configura el override del breadcrumb para la página de clientes
 * Cambia "Admin > Clientes" por "Gestión de Clientes"
 * Muestra solo: Dashboard > Gestión de Clientes
 */
export function ClientsBreadcrumbOverride() {
  useBreadcrumbOverride({
    pattern: "/dashboard/admin/clients",
    label: "Gestión de Clientes",
    type: "replace-from-segment",
    fromSegmentIndex: 1, // Reemplaza desde "admin" (índice 1) en adelante
  });

  return null;
}
