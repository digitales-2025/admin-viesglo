"use server";

import { http } from "@/lib/http/serverFetch";
import {
  MarkPaymentStatus,
  PaginatedPaymentResponse,
  PaymentFilters,
  PaymentResponse,
  UpdatePaymentStatus,
} from "../_types/payment.types";

const API_ENDPOINT = "/payments";

/**
 * Obtiene todos los pagos
 */
export async function getPayments(
  filters?: PaymentFilters
): Promise<{ data: PaymentResponse[]; meta?: PaginatedPaymentResponse["meta"]; success: boolean; error?: string }> {
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

    const [response, err] = await http.get<PaginatedPaymentResponse>(url);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener pagos" };
    }
    return { success: true, data: response.data, meta: response.meta };
  } catch (error) {
    console.error("Error al obtener pagos", error);
    return { success: false, data: [], error: "Error al obtener pagos" };
  }
}

/**
 * Obtiene un pago por su ID
 */
export async function getPayment(
  id: string
): Promise<{ data: PaymentResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<PaymentResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener pago" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener pago", error);
    return { success: false, data: null, error: "Error al obtener pago" };
  }
}

/**
 * Actualiza el estado de un pago
 */
export async function updatePaymentStatus(
  id: string,
  data: UpdatePaymentStatus
): Promise<{ data: PaymentResponse | null; success: boolean; error?: string }> {
  try {
    if (!id) {
      return { success: false, data: null, error: "ID de pago no proporcionado" };
    }

    const [response, err] = await http.patch<PaymentResponse>(`${API_ENDPOINT}/${id}/status`, data);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar estado del pago" };
    }
    return { success: true, data: response };
  } catch (error) {
    console.error("Error al actualizar estado del pago", error);
    return { success: false, data: null, error: "Error al actualizar estado del pago" };
  }
}

/**
 * Marca el estado de un pago como pagado/no pagado
 */
export async function markPaymentStatus(
  id: string,
  data: MarkPaymentStatus
): Promise<{ data: PaymentResponse | null; success: boolean; error?: string }> {
  try {
    if (!id) {
      return { success: false, data: null, error: "ID de pago no proporcionado" };
    }

    const [response, err] = await http.patch<PaymentResponse>(`${API_ENDPOINT}/${id}/mark-status`, data);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al marcar estado del pago" };
    }
    return { success: true, data: response };
  } catch (error) {
    console.error("Error al marcar estado del pago", error);
    return { success: false, data: null, error: "Error al marcar estado del pago" };
  }
}

/**
 * Obtiene los pagos para las estadísticas
 */
export async function findPaymentsForStats(
  filters?: PaymentFilters
): Promise<{ data: PaymentResponse[]; success: boolean; error?: string }> {
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
    const [data, err] = await http.get<PaymentResponse[]>(url);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener pagos para estadísticas" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener pagos para estadísticas", error);
    return { success: false, data: [], error: "Error al obtener pagos para estadísticas" };
  }
}
