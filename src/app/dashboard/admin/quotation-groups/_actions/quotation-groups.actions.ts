"use server";

import { http } from "@/lib/http/serverFetch";
import { QuotationGroupCreate, QuotationGroupResponse, QuotationGroupUpdate } from "../_types/quotation-groups.types";

const API_ENDPOINT = "/quotation-groups";

export async function getQuotationGroups(): Promise<{
  data: QuotationGroupResponse[];
  success: boolean;
  error?: string;
}> {
  try {
    const [data, err] = await http.get<QuotationGroupResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener grupos de cotizaciones" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener grupos de cotizaciones", error);
    return { success: false, data: [], error: "Error al obtener grupos de cotizaciones" };
  }
}

export async function getQuotationGroup(
  id: string
): Promise<{ data: QuotationGroupResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<QuotationGroupResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener grupo de cotizaciones" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener grupo de cotizaciones", error);
    return { success: false, data: null, error: "Error al obtener grupo de cotizaciones" };
  }
}

export async function createQuotationGroup(
  quotationGroup: QuotationGroupCreate
): Promise<{ data: QuotationGroupResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<QuotationGroupResponse>(API_ENDPOINT, quotationGroup);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear grupo de cotizaciones" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear grupo de cotizaciones", error);
    return { success: false, data: null, error: "Error al crear grupo de cotizaciones" };
  }
}

export async function updateQuotationGroup(
  id: string,
  quotationGroup: QuotationGroupUpdate
): Promise<{ data: QuotationGroupResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<QuotationGroupResponse>(`${API_ENDPOINT}/${id}`, quotationGroup);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar grupo de cotizaciones" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar grupo de cotizaciones", error);
    return { success: false, data: null, error: "Error al actualizar grupo de cotizaciones" };
  }
}

export async function deleteQuotationGroup(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar grupo de cotizaciones" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar grupo de cotizaciones", error);
    return { success: false, error: "Error al eliminar grupo de cotizaciones" };
  }
}

export async function togleActiveQuotationGroup(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch(`${API_ENDPOINT}/${id}/togle-active`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al activar/desactivar grupo de cotizaciones" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al activar/desactivar grupo de cotizaciones", error);
    return { success: false, error: "Error al activar/desactivar grupo de cotizaciones" };
  }
}
