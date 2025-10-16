import { components } from "@/lib/api/types/api";
import { http } from "@/lib/http/clientFetch";

/**
 * Parámetros de filtrado para endpoints de costos
 */
export type CostsFilterParams = {
  projectType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  year?: string;
};

export type CostsDashboardSummary = components["schemas"]["CostsDashboardSummaryResponseDto"];

export type CostsDashboardByProjectResponseDto = components["schemas"]["CostsDashboardByProjectResponseDto"];

export type CostsDashboardPieDistributionResponseDto =
  components["schemas"]["CostsDashboardPieDistributionResponseDto"];

export type CostsDashboardCostEfficiencyResponseDto = components["schemas"]["CostsDashboardCostEfficiencyResponseDto"];

export type CostsDashboardMonthlyBreakdownResponseDto =
  components["schemas"]["CostsDashboardMonthlyBreakdownResponseDto"];

/* 
  Resumen general del dashboard de costos
*/
export async function fetchCostsDashboardSummary(filters?: CostsFilterParams): Promise<CostsDashboardSummary> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/costs/summary${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardSummary;
}

/* Costos por proyecto */
export async function fetchCostsDashboardByProject(
  filters?: CostsFilterParams
): Promise<CostsDashboardByProjectResponseDto> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/costs/by-project${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardByProjectResponseDto;
}

/* Distribución de costos en forma de gráfico de torta */
export async function fetchCostsDashboardPieDistribution(
  filters?: CostsFilterParams
): Promise<CostsDashboardPieDistributionResponseDto> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/costs/pie-distribution${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardPieDistributionResponseDto;
}

/* Tendencias de costos */
/* export async function fetchCostsDashboardTrends(): Promise<CostsDashboardTrendsResponseDto> {
  const res = await http.get("/v1/dashboards/costs/trends");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardTrendsResponseDto;
} */

/* Recursos más costosos */
/* export async function fetchCostsDashboardTopResources(): Promise<CostsDashboardTopResourcesResponseDto> {
  const res = await http.get("/v1/dashboards/costs/top-resources");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardTopResourcesResponseDto;
} */

/* Eficiencia de costos */
export async function fetchCostsDashboardCostEfficiency(
  filters?: CostsFilterParams
): Promise<CostsDashboardCostEfficiencyResponseDto> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/costs/cost-efficiency${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardCostEfficiencyResponseDto;
}

/* Desglose mensual de costos */
export async function fetchCostsDashboardMonthlyBreakdown(
  filters?: CostsFilterParams
): Promise<CostsDashboardMonthlyBreakdownResponseDto> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/costs/monthly-breakdown${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as CostsDashboardMonthlyBreakdownResponseDto;
}
