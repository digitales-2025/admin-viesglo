"use server";

import { http } from "@/lib/http/serverFetch";
import { ActivityResponse } from "../_types/services.types";

export async function getActivitiesByObjectiveId(
  objectiveId: string
): Promise<{ data: ActivityResponse[]; success: boolean; error?: string }> {
  const [data, err] = await http.get(`/activities?objectiveId=${objectiveId}`);
  if (err !== null) {
    return { success: false, data: [], error: err.message || "Error al obtener actividades" };
  }
  return { success: true, data: data as ActivityResponse[] };
}
