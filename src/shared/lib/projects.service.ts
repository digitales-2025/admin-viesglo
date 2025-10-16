import { components } from "@/lib/api/types/api";
import { http } from "@/lib/http/clientFetch";

/**
 * Resumen general del dashboard de proyectos con métricas completas
 */
export type ProjectsDashboardSummary = components["schemas"]["ProjectsDashboardSummaryResponseDto"];

export type ProjectsStatusDistribution = components["schemas"]["ProjectsStatusDistributionResponseDto"];

export type ProjectsTypeDistribution = components["schemas"]["ProjectsTypeDistributionResponseDto"];

export type ProjectsProgress = components["schemas"]["ProjectsProgressResponseDto"];

export type ProjectsPerformance = components["schemas"]["ProjectsPerformanceResponseDto"];

/**
 * Parámetros de filtrado para endpoints de proyectos
 */
export type ProjectsFilterParams = {
  projectType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

/**
 * Resumen general del dashboard de proyectos
 */
export async function fetchProjectsDashboardSummary(filters?: ProjectsFilterParams): Promise<ProjectsDashboardSummary> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/projects/summary${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsDashboardSummary;
}

/**
 * Distribución de proyectos por estado
 */
export async function fetchProjectsStatusDistribution(
  filters?: ProjectsFilterParams
): Promise<ProjectsStatusDistribution> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/projects/status${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsStatusDistribution;
}

/**
 * Distribución de proyectos por tipo
 */
export async function fetchProjectsTypeDistribution(filters?: ProjectsFilterParams): Promise<ProjectsTypeDistribution> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/projects/type${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsTypeDistribution;
}

/**
 * Progreso general y tendencias temporales
 */
export async function fetchProjectsProgress(filters?: ProjectsFilterParams): Promise<ProjectsProgress> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/projects/progress${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsProgress;
}

/**
 * Métricas de rendimiento y calidad
 */
export async function fetchProjectsPerformance(filters?: ProjectsFilterParams): Promise<ProjectsPerformance> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/projects/performance${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsPerformance;
}
