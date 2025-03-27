"use server";

import { http } from "@/lib/http/serverFetch";
import { CertificateResponse } from "../_types/certificates.types";

const API_ENDPOINT = "/certificate";

/**
 * Obtiene todos los certificados
 */
export async function getCertificates(): Promise<{ data: CertificateResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<CertificateResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener certificados" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificados", error);
    return { success: false, data: [], error: "Error al obtener certificados" };
  }
}

/**
 * Obtiene un certificado por su ID
 */
export async function getCertificate(
  id: string
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<CertificateResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener certificado" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificado", error);
    return { success: false, data: null, error: "Error al obtener certificado" };
  }
}

/**
 * Crea un nuevo certificado
 */
export async function createCertificate(
  formData: FormData
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.multipartPost<CertificateResponse>(API_ENDPOINT, formData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear certificado" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear certificado", error);
    return { success: false, data: null, error: "Error al crear certificado" };
  }
}

/**
 * Actualiza un certificado existente
 */
export async function updateCertificate(
  id: string,
  formData: FormData
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.multipartPut<CertificateResponse>(`${API_ENDPOINT}/${id}`, formData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar certificado" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar certificado", error);
    return { success: false, data: null, error: "Error al actualizar certificado" };
  }
}

/**
 * Elimina un certificado existente
 */
export async function deleteCertificate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar certificado" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar certificado", error);
    return { success: false, error: "Error al eliminar certificado" };
  }
}

/**
 * Obtiene un certificado por su código
 */
export async function getCertificateByCode(
  code: string
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<CertificateResponse>(`${API_ENDPOINT}/code/${code}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener certificado por código" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificado por código", error);
    return { success: false, data: null, error: "Error al obtener certificado por código" };
  }
}

/**
 * Obtiene los certificados por rango de fechas
 */
export async function getCertificatesByDateRange(
  startDate: string,
  endDate: string
): Promise<{ data: CertificateResponse[]; success: boolean; error?: string }> {
  try {
    const url = `${API_ENDPOINT}/filter/date?startDate=${startDate}&endDate=${endDate}`;
    const [data, err] = await http.get<CertificateResponse[]>(url);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener certificados por rango de fechas" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificados por rango de fechas", error);
    return { success: false, data: [], error: "Error al obtener certificados por rango de fechas" };
  }
}
