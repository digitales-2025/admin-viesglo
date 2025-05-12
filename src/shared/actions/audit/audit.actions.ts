"use server";

import { http } from "@/lib/http/serverFetch";
import { AuditResponse } from "./audit.types";

const API_ENDPOINT = "/audit";

export async function getAuditByEntityId(
  entityId: string
): Promise<{ data: AuditResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<AuditResponse[]>(`${API_ENDPOINT}?entityId=${entityId}`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener el historial de auditoría" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener el historial de auditoría", error);
    return { success: false, data: [], error: "Error al obtener el historial de auditoría" };
  }
}
