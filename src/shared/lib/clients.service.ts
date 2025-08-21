import { http } from "@/lib/http/clientFetch";

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

export async function fetchClientsDashboardSummary(): Promise<{
  summary: { totalClients: number; departaments: Array<{ name: string; count: number }> };
  list: ClientSummary[];
}> {
  const res = await http.get("/v1/dashboards/clients/summary");
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
