"use server";

import { PaginationMeta } from "@/app/dashboard/admin/medical-records/_types/medical-record.types";
import { http } from "@/lib/http/serverFetch";
import { AuditResponse } from "./audit.types";

const API_ENDPOINT = "/audit";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export async function getAuditByEntityId(
  entityId: string,
  params?: PaginationParams
): Promise<{
  response: { data: AuditResponse[] | []; meta: PaginationMeta | null };
  success: boolean;
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("entityId", entityId);

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const [data, err] = await http.get<{ data: AuditResponse[]; meta: PaginationMeta }>(
      `${API_ENDPOINT}?${queryParams.toString()}`
    );
    if (err !== null) {
      return {
        success: false,
        response: { data: [], meta: null },
        error: err.message || "Error al obtener el historial de auditoría",
      };
    }
    return { success: true, response: { data: data.data, meta: data.meta } };
  } catch (error) {
    console.error("Error al obtener el historial de auditoría", error);
    return {
      success: false,
      response: { data: [], meta: null },
      error: "Error al obtener el historial de auditoría",
    };
  }
}
