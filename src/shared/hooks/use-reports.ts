/**
 * 📊 HOOKS DE REPORTES
 *
 * Hooks personalizados para generar y descargar reportes desde el backend
 * Usa el sistema centralizado de descarga de archivos de backend.ts
 */

import { useState } from "react";
import { toast } from "sonner";

import { downloadFile } from "@/lib/api/types/backend";

// Tipo para errores de descarga
type DownloadError = {
  error?: {
    userMessage?: string;
  };
};

// ============================================================================
// 🎯 TIPOS E INTERFACES
// ============================================================================

export interface ReportDateRange {
  from?: Date;
  to?: Date;
}

interface BaseReportFilters {
  startDate?: string;
  endDate?: string;
  format?: "excel" | "pdf";
}

export interface ProjectReportFilters extends BaseReportFilters {
  projectType?: string;
  clientId?: string;
  status?: string;
  commercialExecutiveId?: string;
  implementingCompanyId?: string;
  [key: string]: unknown;
}

export interface MilestoneReportFilters extends BaseReportFilters {
  status?: string;
  projectId?: string;
  assignedToId?: string;
  [key: string]: unknown;
}

export interface DeliverableReportFilters extends BaseReportFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
  milestoneId?: string;
  [key: string]: unknown;
}

export interface ClientSatisfactionFilters extends BaseReportFilters {
  clientId?: string;
  projectId?: string;
  satisfactionLevel?: "HIGH" | "MEDIUM" | "LOW";
  [key: string]: unknown;
}

export interface ResourceCostFilters extends BaseReportFilters {
  resourceType?: string;
  projectId?: string;
  resourceId?: string;
  [key: string]: unknown;
}

export interface AuditReportFilters extends BaseReportFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  severity?: string;
  [key: string]: unknown;
}

// ============================================================================
// 🚨 TIPOS DE ERROR (Simplificado - usa inferencia de tipos del backend)
// ============================================================================

// ============================================================================
// 🛠️ UTILIDADES
// ============================================================================

/**
 * Formatea una fecha para la API (YYYY-MM-DD)
 */
export function formatDateForAPI(date?: Date): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
}

/**
 * Prepara los filtros base con fechas para enviar al backend
 */
export function prepareReportFilters(
  dateRange: ReportDateRange,
  additionalFilters: Record<string, any> = {}
): Record<string, any> {
  return {
    startDate: formatDateForAPI(dateRange.from),
    endDate: formatDateForAPI(dateRange.to),
    format: "excel" as const,
    ...additionalFilters,
  };
}

// ============================================================================
// 🎣 HOOK GENÉRICO
// ============================================================================

// ============================================================================
// 📊 HOOKS ESPECÍFICOS POR TIPO DE REPORTE
// ============================================================================

/**
 * 📈 Hook para reporte de eficiencia de proyectos
 *
 * Genera análisis completo de rendimiento, progreso y cumplimiento
 */
export function useProjectEfficiencyReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReport = async (filters: ProjectReportFilters) => {
    setIsDownloading(true);
    try {
      await downloadFile(
        "/v1/reports/project-efficiency",
        filters as Record<string, string>,
        "eficiencia-proyectos.xlsx"
      );

      toast.success("Reporte descargado: eficiencia-proyectos.xlsx");
    } catch (error: unknown) {
      const downloadError = error as DownloadError;
      toast.error(downloadError?.error?.userMessage || "Ocurrió un error inesperado");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateReport,
    isDownloading,
    error: null,
    isError: false,
  };
}

/**
 * 🎯 Hook para reporte de análisis de milestones
 *
 * Estado, progreso y métricas detalladas de hitos
 */
export function useMilestoneAnalysisReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReport = async (filters: MilestoneReportFilters) => {
    setIsDownloading(true);
    try {
      await downloadFile(
        "/v1/reports/milestone-analysis",
        filters as Record<string, string>,
        "analisis-milestones.xlsx"
      );

      toast.success("Reporte descargado: analisis-milestones.xlsx");
    } catch (error: unknown) {
      const downloadError = error as DownloadError;
      toast.error(downloadError?.error?.userMessage || "Ocurrió un error inesperado");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateReport,
    isDownloading,
    error: null,
    isError: false,
  };
}

/**
 * ✅ Hook para reporte de entregables y aprobaciones
 *
 * Seguimiento de entregables y procesos de validación
 */
export function useDeliverableApprovalReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReport = async (filters: DeliverableReportFilters) => {
    setIsDownloading(true);
    try {
      await downloadFile(
        "/v1/reports/deliverable-approval",
        filters as Record<string, string>,
        "entregables-aprobaciones.xlsx"
      );

      toast.success("Reporte descargado: entregables-aprobaciones.xlsx");
    } catch (error: unknown) {
      const downloadError = error as DownloadError;
      toast.error(downloadError?.error?.userMessage || "Ocurrió un error inesperado");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateReport,
    isDownloading,
    error: null,
    isError: false,
  };
}

/**
 * 💗 Hook para reporte de satisfacción del cliente
 *
 * Métricas de calidad y nivel de satisfacción
 */
export function useClientSatisfactionReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReport = async (filters: ClientSatisfactionFilters) => {
    setIsDownloading(true);
    try {
      await downloadFile(
        "/v1/reports/client-satisfaction",
        filters as Record<string, string>,
        "satisfaccion-cliente.xlsx"
      );

      toast.success("Reporte descargado: satisfaccion-cliente.xlsx");
    } catch (error: unknown) {
      const downloadError = error as DownloadError;
      toast.error(downloadError?.error?.userMessage || "Ocurrió un error inesperado");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateReport,
    isDownloading,
    error: null,
    isError: false,
  };
}

/**
 * 💰 Hook para reporte de recursos y costos
 *
 * Análisis financiero, ROI y utilización de recursos
 */
export function useResourceCostReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReport = async (filters: ResourceCostFilters) => {
    setIsDownloading(true);
    try {
      await downloadFile("/v1/reports/resource-cost", filters as Record<string, string>, "recursos-costos.xlsx");

      toast.success("Reporte descargado: recursos-costos.xlsx");
    } catch (error: unknown) {
      const downloadError = error as DownloadError;
      toast.error(downloadError?.error?.userMessage || "Ocurrió un error inesperado");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateReport,
    isDownloading,
    error: null,
    isError: false,
  };
}

/**
 * 🛡️ Hook para reporte de auditoría y trazabilidad
 *
 * Registro de acciones y cumplimiento
 */
export function useAuditTraceabilityReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReport = async (filters: AuditReportFilters) => {
    setIsDownloading(true);
    try {
      await downloadFile(
        "/v1/reports/audit-traceability",
        filters as Record<string, string>,
        "auditoria-trazabilidad.xlsx"
      );

      toast.success("Reporte descargado: auditoria-trazabilidad.xlsx");
    } catch (error: unknown) {
      const downloadError = error as DownloadError;
      toast.error(downloadError?.error?.userMessage || "Ocurrió un error inesperado");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateReport,
    isDownloading,
    error: null,
    isError: false,
  };
}
