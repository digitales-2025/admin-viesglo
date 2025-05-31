"use server";

import { http } from "@/lib/http/serverFetch";
import { QuotationGroupCreate, QuotationGroupResponse, QuotationGroupUpdate } from "../_types/quotation.types";

const API_ENDPOINT = "/quotation-groups";

/*
 * Obtiene todas las cotizaciones agrupadas
 */
export async function getQuotationGroups(): Promise<{
  data: QuotationGroupResponse[];
  error?: string;
  success: boolean;
}> {
  try {
    const [data, error] = await http.get<QuotationGroupResponse[]>(API_ENDPOINT);
    if (error !== null) {
      return {
        data: [],
        error: error.message || "Error al obtener las cotizaciones agrupadas",
        success: false,
      };
    }
    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Error desconocido",
      success: false,
    };
  }
}

/**
 * Crea una nueva cotización agrupada
 */
export async function createQuotationGroup(quotationGroup: QuotationGroupCreate): Promise<{
  data: QuotationGroupResponse | null;
  error?: string;
  success: boolean;
}> {
  try {
    const [data, error] = await http.post<QuotationGroupResponse>(API_ENDPOINT, quotationGroup);
    if (error !== null) {
      return {
        data: null,
        error: error.message || "Error al crear la cotización agrupada",
        success: false,
      };
    }
    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Error desconocido",
      success: false,
    };
  }
}

/**
 * Actualiza una cotización agrupada existente
 */
export async function updateQuotationGroup(quotationGroup: QuotationGroupUpdate): Promise<{
  data: QuotationGroupResponse | null;
  error?: string;
  success: boolean;
}> {
  try {
    const [data, error] = await http.put<QuotationGroupResponse>(API_ENDPOINT, quotationGroup);
    if (error !== null) {
      return {
        data: null,
        error: error.message || "Error al actualizar la cotización agrupada",
        success: false,
      };
    }
    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Error desconocido",
      success: false,
    };
  }
}

/**
 * Elimina una cotización agrupada existente
 */
export async function deleteQuotationGroup(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const [_, error] = await http.delete<QuotationGroupResponse>(`${API_ENDPOINT}/${id}`);
    if (error !== null) {
      return {
        success: false,
        error: error.message || "Error al eliminar la cotización agrupada",
      };
    }
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtiene una cotización agrupada por su ID
 */
export async function getQuotationGroupById(id: string): Promise<{
  data: QuotationGroupResponse | null;
  error?: string;
  success: boolean;
}> {
  try {
    const [data, error] = await http.get<QuotationGroupResponse>(`${API_ENDPOINT}/${id}`);
    if (error !== null) {
      return {
        data: null,
        error: error.message || "Error al obtener la cotización agrupada",
        success: false,
      };
    }
    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Error desconocido",
      success: false,
    };
  }
}
