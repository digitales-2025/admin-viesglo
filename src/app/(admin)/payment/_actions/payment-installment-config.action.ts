"use server";

import { http } from "@/lib/http/serverFetch";
import {
  CreatePaymentInstallmentConfig,
  PaymentInstallmentConfigResponse,
  UpdatePaymentInstallmentConfig,
} from "../_types/installment-payment.types";

const API_ENDPOINT = "/payment-installment-config";

/**
 * Obtiene la configuración de pagos de cuotas
 */
export async function getPaymentInstallmentConfig(id: string): Promise<{
  success: boolean;
  data: PaymentInstallmentConfigResponse | null;
  error?: string;
}> {
  try {
    const [data, error] = await http.get(`${API_ENDPOINT}?paymentId=${id}`);

    if (error !== null) {
      throw new Error(error.message || "Error al obtener la configuración de pagos de cuotas");
    }

    return { success: true, data: data as PaymentInstallmentConfigResponse };
  } catch (error) {
    console.error("Error al obtener la configuración de pagos de cuotas", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Error al obtener la configuración de pagos de cuotas",
    };
  }
}

/**
 * Crea una nueva configuración de pagos de cuotas
 */
export async function createPaymentInstallmentConfig(
  paymentId: string,
  dataPaymentInstallmentConfig: CreatePaymentInstallmentConfig
): Promise<{
  success: boolean;
  data: PaymentInstallmentConfigResponse | null;
  error?: string;
}> {
  try {
    const [data, error] = await http.post(`${API_ENDPOINT}?paymentId=${paymentId}`, dataPaymentInstallmentConfig);
    if (error !== null) {
      throw new Error(error.message || "Error al crear la configuración de pagos de cuotas");
    }
    return { success: true, data: data as PaymentInstallmentConfigResponse };
  } catch (error) {
    console.error("Error al crear la configuración de pagos de cuotas", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Error al crear la configuración de pagos de cuotas",
    };
  }
}

/**
 * Actualizar configuración de pagos de cuotas
 */
export async function updateInstallmentPaymentConfig(
  id: string,
  dataPaymentInstallmentConfig: UpdatePaymentInstallmentConfig
) {
  try {
    const [data, error] = await http.put(`${API_ENDPOINT}/${id}`, dataPaymentInstallmentConfig);
    if (error !== null) {
      throw new Error(error.message || "Error al actualizar la configuración de pagos de cuotas");
    }
    return { success: true, data: data as PaymentInstallmentConfigResponse };
  } catch (error) {
    console.error("Error al actualizar la configuración de pagos de cuotas", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Error al actualizar la configuración de pagos de cuotas",
    };
  }
}

/**
 * Eliminar configuración de pagos de cuotas
 */
export async function deleteInstallmentPaymentConfig(id: string): Promise<{
  success: boolean;
  data: PaymentInstallmentConfigResponse | null;
  error?: string;
}> {
  try {
    const [data, error] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (error !== null) {
      throw new Error(error.message || "Error al eliminar la configuración de pagos de cuotas");
    }
    return { success: true, data: data as PaymentInstallmentConfigResponse };
  } catch (error) {
    console.error("Error al eliminar la configuración de pagos de cuotas", error);
    return {
      success: false,
      data: null,
    };
  }
}
