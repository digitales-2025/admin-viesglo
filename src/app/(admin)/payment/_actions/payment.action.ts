"use server";

import { http } from "@/lib/http/serverFetch";
import { MarkPaymentStatus, PaymentResponse, UpdatePaymentStatus } from "../_types/payment.types";

const API_ENDPOINT = "/payments";

/**
 * Obtiene todos los pagos
 */
export async function getPayments(): Promise<{ data: PaymentResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<PaymentResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener pagos" };
    }
    return { success: true, data };
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
