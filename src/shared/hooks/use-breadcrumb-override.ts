"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useBreadcrumbStore } from "../context/stores/breadcrumb-store";

type BreadcrumbOverrideConfig = {
  pattern: string;
  label: string;
  type?: "replace-segment" | "replace-all" | "replace-from-segment";
  segmentIndex?: number;
  fromSegmentIndex?: number;
  removeUrl?: boolean;
  customUrl?: string;
};

/**
 * Hook para configurar overrides de breadcrumb de manera sencilla
 * Se limpia automáticamente cuando el componente se desmonta
 */
export function useBreadcrumbOverride(config: BreadcrumbOverrideConfig | null) {
  const setOverride = useBreadcrumbStore((state) => state.setOverride);
  const clearOverride = useBreadcrumbStore((state) => state.clearOverride);
  const pathname = usePathname();

  useEffect(() => {
    if (config) {
      setOverride({
        pattern: config.pattern,
        label: config.label,
        type: config.type || "replace-all",
        segmentIndex: config.segmentIndex,
        fromSegmentIndex: config.fromSegmentIndex,
        removeUrl: config.removeUrl,
        customUrl: config.customUrl,
      });

      // Limpiar cuando el componente se desmonte o cambie la configuración
      return () => {
        clearOverride(config.pattern);
      };
    }
  }, [config, setOverride, clearOverride]);

  // También limpiar cuando cambie la ruta (opcional)
  useEffect(() => {
    return () => {
      if (config) {
        clearOverride(config.pattern);
      }
    };
  }, [pathname, config, clearOverride]);
}

/**
 * Hook específico para reemplazar todo el breadcrumb por un título simple
 */
export function useBreadcrumbTitle(title: string, pattern?: string) {
  const pathname = usePathname();
  const defaultPattern = pattern || pathname;

  useBreadcrumbOverride({
    pattern: defaultPattern,
    label: title,
    type: "replace-all",
  });
}

/**
 * Hook específico para reemplazar desde cierto segmento en adelante
 * Útil para rutas como /projects/[id]/requirements -> /projects/Requerimientos
 */
export function useBreadcrumbFromSegment(label: string, pattern: string, fromSegmentIndex: number) {
  useBreadcrumbOverride({
    pattern,
    label,
    type: "replace-from-segment",
    fromSegmentIndex,
  });
}
