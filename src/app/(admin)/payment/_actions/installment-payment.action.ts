"use server";

import { http } from "@/lib/http/serverFetch";
import {
  InstallmentPaymentCreate,
  InstallmentPaymentResponse,
  InstallmentPaymentUpdate,
} from "../_types/installment-payment.types";

const API_ENDPOINT = "/installment-payments";

/**
 * Obtiene todos los pagos de cuotas
 */
export async function getInstallmentPayments(paymentId: string): Promise<{
  success: boolean;
  data: InstallmentPaymentResponse[];
  error?: string;
}> {
  try {
    const [data, err] = await http.get(`${API_ENDPOINT}?paymentId=${paymentId}`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener pagos de cuotas" };
    }
    console.log("🚀 ~ getInstallmentPayments ~ data:", data);
    return { success: true, data: data as InstallmentPaymentResponse[] };
  } catch (error) {
    console.error("Error al obtener pagos de cuotas", error);
    return { success: false, data: [], error: "Error al obtener pagos de cuotas" };
  }
}

/**
 * Crear un pago de cuota
 */
export async function createInstallmentPayment(
  paymentId: string,
  installmentPayment: InstallmentPaymentCreate
): Promise<{ success: boolean; data: InstallmentPaymentResponse | null; error?: string }> {
  try {
    const [data, err] = await http.post(`${API_ENDPOINT}?paymentId=${paymentId}`, installmentPayment);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear pago de cuota" };
    }
    return { success: true, data: data as InstallmentPaymentResponse };
  } catch (error) {
    console.error("Error al crear pago de cuota", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Error al crear pago de cuota",
    };
  }
}

/**
 * Actualizar un pago de cuota
 */
export async function updateInstallmentPayment(
  id: string,
  installmentPayment: InstallmentPaymentUpdate
): Promise<{ success: boolean; data: InstallmentPaymentResponse | null; error?: string }> {
  try {
    const [data, err] = await http.put(`${API_ENDPOINT}/${id}`, installmentPayment);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar pago de cuota" };
    }
    return { success: true, data: data as InstallmentPaymentResponse };
  } catch (error) {
    console.error("Error al actualizar pago de cuota", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Error al actualizar pago de cuota",
    };
  }
}

/**
 * Eliminar una cuota pago
 */
export async function deleteInstallmentPayment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar pago de cuota" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar pago de cuota", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al eliminar pago de cuota" };
  }
}

/**
 * Reactivar o desactivar una cuota pago
 */
export async function toggleInstallmentPayment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch(`${API_ENDPOINT}/${id}/toggle-active`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al reactivar o desactivar pago de cuota" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al reactivar o desactivar pago de cuota", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al reactivar o desactivar pago de cuota",
    };
  }
}
