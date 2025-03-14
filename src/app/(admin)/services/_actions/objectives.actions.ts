"use server";

import { http } from "@/lib/http/serverFetch";
import { ObjectiveResponse } from "../_types/services.types";

export async function getObjectivesByServiceId(serviceId: string) {
  const [data, err] = await http.get<ObjectiveResponse[]>(`/objectives/${serviceId}`);
  if (err !== null) {
    return { success: false, data: [], error: err.message || "Error al obtener objetivos" };
  }
  return { success: true, data };
}
