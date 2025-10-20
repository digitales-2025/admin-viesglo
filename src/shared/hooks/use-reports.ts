/**
 * 📊 HOOKS DE REPORTES
 *
 * Hooks personalizados para generar y descargar reportes desde el backend
 * Usa el sistema centralizado de descarga de archivos de backend.ts
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { downloadFromBlob, fetchClient } from "@/lib/api/types/backend";
import { BaseErrorResponse } from "@/lib/api/types/common";

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
}

export interface MilestoneReportFilters extends BaseReportFilters {
  status?: string;
  projectId?: string;
  assignedToId?: string;
}

export interface DeliverableReportFilters extends BaseReportFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
  milestoneId?: string;
}

export interface ClientSatisfactionFilters extends BaseReportFilters {
  clientId?: string;
  projectId?: string;
  satisfactionLevel?: "HIGH" | "MEDIUM" | "LOW";
}

export interface ResourceCostFilters extends BaseReportFilters {
  resourceType?: string;
  projectId?: string;
  resourceId?: string;
}

export interface AuditReportFilters extends BaseReportFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  severity?: string;
}

// ============================================================================
// 🚨 TIPOS DE ERROR
// ============================================================================

interface ReportError extends BaseErrorResponse {
  error: {
    id: string;
    message: string;
    userMessage?: string;
    category: string;
    severity: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
    statusCode: number;
    timestamp: string;
    path: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  };
}

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

/**
 * Hook genérico para descargar reportes usando el sistema centralizado de backend.ts
 *
 * @param endpoint - Ruta del endpoint del reporte (ej: "/v1/reports/project-efficiency")
 * @param reportName - Nombre descriptivo del reporte para el archivo
 */
function useReportDownload<T extends Record<string, any>>(endpoint: string, reportName: string) {
  const [isDownloading, setIsDownloading] = useState(false);

  const mutation = useMutation<string, ReportError, T>({
    mutationFn: async (filters: T) => {
      setIsDownloading(true);

      try {
        // Hacer la petición usando el fetchClient con parseAs: "blob"
        // openapi-fetch parsea automáticamente y devuelve { data, response }
        const { data, response } = await fetchClient.GET(endpoint as any, {
          params: { query: filters },
          parseAs: "blob", // ⭐ Importante: openapi-fetch parsea y devuelve blob en 'data'
        });

        if (!response.ok) {
          // Si hay error, intentar parsear la respuesta como BaseErrorResponse
          try {
            const errorData = await response.json();
            throw errorData as ReportError;
          } catch {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }

        if (!data) {
          throw new Error("No data received from server");
        }

        // Usar downloadFromBlob ya que openapi-fetch ya parseó el blob
        const filename = await downloadFromBlob(data, response, {
          filename: `${reportName}.xlsx`,
          addTimestamp: true,
          onSuccess: (downloadedFilename) => {
            toast.success(`Reporte descargado: ${downloadedFilename}`);
          },
          onError: (error: any) => {
            toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
          },
        });

        return filename;
      } finally {
        setIsDownloading(false);
      }
    },
    onError: (error: ReportError) => {
      setIsDownloading(false);
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      console.error("Error descargando reporte:", error);
    },
  });

  return {
    generateReport: mutation.mutate,
    isDownloading: mutation.isPending || isDownloading,
    error: mutation.error,
    isError: mutation.isError,
  };
}

// ============================================================================
// 📊 HOOKS ESPECÍFICOS POR TIPO DE REPORTE
// ============================================================================

/**
 * 📈 Hook para reporte de eficiencia de proyectos
 *
 * Genera análisis completo de rendimiento, progreso y cumplimiento
 */
export function useProjectEfficiencyReport() {
  return useReportDownload<ProjectReportFilters>("/v1/reports/project-efficiency", "eficiencia-proyectos");
}

/**
 * 🎯 Hook para reporte de análisis de milestones
 *
 * Estado, progreso y métricas detalladas de hitos
 */
export function useMilestoneAnalysisReport() {
  return useReportDownload<MilestoneReportFilters>("/v1/reports/milestone-analysis", "analisis-milestones");
}

/**
 * ✅ Hook para reporte de entregables y aprobaciones
 *
 * Seguimiento de entregables y procesos de validación
 */
export function useDeliverableApprovalReport() {
  return useReportDownload<DeliverableReportFilters>("/v1/reports/deliverable-approval", "entregables-aprobaciones");
}

/**
 * 💗 Hook para reporte de satisfacción del cliente
 *
 * Métricas de calidad y nivel de satisfacción
 */
export function useClientSatisfactionReport() {
  return useReportDownload<ClientSatisfactionFilters>("/v1/reports/client-satisfaction", "satisfaccion-cliente");
}

/**
 * 💰 Hook para reporte de recursos y costos
 *
 * Análisis financiero, ROI y utilización de recursos
 */
export function useResourceCostReport() {
  return useReportDownload<ResourceCostFilters>("/v1/reports/resource-cost", "recursos-costos");
}

/**
 * 🛡️ Hook para reporte de auditoría y trazabilidad
 *
 * Registro de acciones y cumplimiento
 */
export function useAuditTraceabilityReport() {
  return useReportDownload<AuditReportFilters>("/v1/reports/audit-traceability", "auditoria-trazabilidad");
}
