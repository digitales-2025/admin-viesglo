"use client";

import { usePathname } from "next/navigation";

import { useBreadcrumbOverride } from "@/shared/hooks/use-breadcrumb-override";

/**
 * Componente que configura el override del breadcrumb para las páginas de settings
 * Cambia "settings" por "Configuración" y lo hace no clickeable
 * Funciona para todas las rutas bajo /dashboard/admin/settings/*
 *
 * Nota: Como "admin" se filtra automáticamente, "settings" queda en el índice 1
 * (dashboard=0, settings=1 después de filtrar admin)
 */
export function SettingsBreadcrumbOverride() {
  const pathname = usePathname();

  useBreadcrumbOverride({
    pattern: pathname, // Usar la ruta actual dinámicamente
    label: "Configuración",
    type: "replace-segment",
    segmentIndex: 1, // Después de filtrar "admin", "settings" está en el índice 1
    removeUrl: true, // Hacer que no sea clickeable
  });

  return null;
}
