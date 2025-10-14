import { http } from "@/lib/http/clientFetch";

/**
 * Parámetros de filtrado para endpoints de clientes
 */
export type ClientsFilterParams = {
  projectType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export interface ClientSummary {
  id: string;
  name: string;
  ruc?: string;
  email?: string;
  sunatInfo?: {
    department?: string;
    province?: string;
    district?: string;
  };
}

export async function fetchActiveClients(): Promise<ClientSummary[]> {
  const res = await http.get<ClientSummary[]>("/v1/clients/active");
  return res.data ?? [];
}

export async function fetchClientsDashboardSummary(filters?: ClientsFilterParams): Promise<{
  summary: { totalClients: number; departaments: Array<{ name: string; count: number }> };
  list: ClientSummary[];
}> {
  const params = new URLSearchParams();

  if (filters?.projectType) params.append("projectType", filters.projectType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = `/v1/dashboards/clients/summary${queryString ? `?${queryString}` : ""}`;

  const res = await http.get(url);
  const data = res.data as any;
  // Normalizar forma de respuesta por si llega aplanada ({ totalClients, departaments, list })
  if (data && !data.summary && ("totalClients" in data || "departaments" in data)) {
    return {
      summary: {
        totalClients: Number(data.totalClients || 0),
        departaments: Array.isArray(data.departaments) ? data.departaments : [],
      },
      list: Array.isArray(data.list) ? data.list : [],
    };
  }
  return data;
}

export async function fetchClientsPaginated(params?: { page?: number; pageSize?: number; search?: string }) {
  const res = await http.get("/v1/clients/paginated", { params });
  return res.data;
}
