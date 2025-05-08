"use server";

import { http } from "@/lib/http/serverFetch";
import {
  PaginatedQuotationResponse,
  QuotationConcrete,
  QuotationCreate,
  QuotationFilters,
  QuotationResponse,
  QuotationUpdate,
} from "../_types/quotation.types";

const API_ENDPOINT = "/quotations";

/**
 * Obtiene todas las cotizaciones para las estadísticas
 */
export async function getQuotationsForStats(
  filters?: QuotationFilters
): Promise<{ data: QuotationResponse[]; success: boolean; error?: string }> {
  try {
    // Construir los parámetros de consulta a partir de los filtros
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar arrays - agregar múltiples parámetros con el mismo nombre
          if (Array.isArray(value)) {
            // Si es un array vacío, no agregar el parámetro
            if (value.length > 0) {
              value.forEach((item) => {
                queryParams.append(key, String(item));
              });
            }
          } else {
            // Para booleanos, asegurarse de que se convierten correctamente a string
            const paramValue = typeof value === "boolean" ? String(value) : String(value);
            queryParams.append(key, paramValue);
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINT}/${queryString ? `?${queryString}` : ""}`;

    const [data, err] = await http.get<QuotationResponse[]>(url);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener cotizaciones" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener cotizaciones", error);
    return { success: false, data: [], error: "Error al obtener cotizaciones" };
  }
}

/**
 * Obtiene todas las cotizaciones con paginación y filtros opcionales
 */
export async function getQuotations(
  filters?: QuotationFilters
): Promise<{ data: QuotationResponse[]; meta?: PaginatedQuotationResponse["meta"]; success: boolean; error?: string }> {
  try {
    // Construir los parámetros de consulta a partir de los filtros
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar arrays - agregar múltiples parámetros con el mismo nombre
          if (Array.isArray(value)) {
            // Si es un array vacío, no agregar el parámetro
            if (value.length > 0) {
              value.forEach((item) => {
                queryParams.append(key, String(item));
              });
            }
          } else {
            // Para booleanos, asegurarse de que se convierten correctamente a string
            const paramValue = typeof value === "boolean" ? String(value) : String(value);
            queryParams.append(key, paramValue);
          }
        }
      });
    }

    // Si no hay filtros específicos, usar los valores predeterminados
    if (!queryParams.has("page")) queryParams.append("page", "1");
    if (!queryParams.has("limit")) queryParams.append("limit", "10");

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINT}/paginated${queryString ? `?${queryString}` : ""}`;

    const [response, err] = await http.get<PaginatedQuotationResponse>(url);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener cotizaciones" };
    }

    return {
      success: true,
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error al obtener cotizaciones", error);
    return { success: false, data: [], error: "Error al obtener cotizaciones" };
  }
}

/**
 * Obtiene una cotización por su ID
 */
export async function getQuotation(
  id: string
): Promise<{ data: QuotationResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<QuotationResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener cotización" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener cotización", error);
    return { success: false, data: null, error: "Error al obtener cotización" };
  }
}

/**
 * Crea una nueva cotización
 */
export async function createQuotation(
  quotation: QuotationCreate
): Promise<{ data: QuotationResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<QuotationResponse>(API_ENDPOINT, quotation);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear cotización" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear cotización", error);
    return { success: false, data: null, error: "Error al crear cotización" };
  }
}

/**
 * Actualiza una cotización existente
 */
export async function updateQuotation(
  id: string,
  quotation: QuotationUpdate
): Promise<{ data: QuotationResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<QuotationResponse>(`${API_ENDPOINT}/${id}`, quotation);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar cotización" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar cotización", error);
    return { success: false, data: null, error: "Error al actualizar cotización" };
  }
}

/**
 * Elimina una cotización existente
 */
export async function deleteQuotation(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // No necesitamos validar el ID aquí ya que la API Backend ya maneja esta validación
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      console.error("Error al eliminar cotización:", err);
      return { success: false, error: err.message || "Error al eliminar cotización" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar cotización", error);
    return { success: false, error: "Error al eliminar cotización" };
  }
}

/**
 * Concreta una cotización existente
 */
export async function concreteQuotation(
  id: string,
  data: QuotationConcrete
): Promise<{ data: QuotationResponse | null; success: boolean; error?: string }> {
  try {
    if (!id) {
      return { success: false, data: null, error: "ID de cotización no proporcionado" };
    }

    const [response, err] = await http.patch<QuotationResponse>(`${API_ENDPOINT}/${id}/concrete`, data);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al concretar cotización" };
    }
    return { success: true, data: response };
  } catch (error) {
    console.error("Error al concretar cotización", error);
    return { success: false, data: null, error: "Error al concretar cotización" };
  }
}
