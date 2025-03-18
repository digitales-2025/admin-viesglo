"use server";

import { http } from "@/lib/http/serverFetch";
import { ClinicCreate, ClinicResponse, ClinicUpdate } from "../_types/clinics.types";

const API_ENDPOINT = "/clinics";

/**
 * Obtiene todas las clínicas
 */
export async function getClinics(): Promise<{ data: ClinicResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ClinicResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener clínicas" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener clínicas", error);
    return { success: false, data: [], error: "Error al obtener clínicas" };
  }
}

/**
 * Obtiene una clínica por su ID
 */
export async function getClinic(
  id: string
): Promise<{ data: ClinicResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ClinicResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener clínica" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener clínica", error);
    return { success: false, data: null, error: "Error al obtener clínica" };
  }
}

/**
 * Crea una nueva clínica
 */
export async function createClinic(
  clinic: ClinicCreate
): Promise<{ data: ClinicResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ClinicResponse>(API_ENDPOINT, clinic);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear clínica" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear clínica", error);
    return { success: false, data: null, error: "Error al crear clínica" };
  }
}

/**
 * Actualiza una clínica existentes
 */
export async function updateClinic(
  id: string,
  clinic: ClinicUpdate
): Promise<{ data: ClinicResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ClinicResponse>(`${API_ENDPOINT}/${id}`, clinic);
    console.log("🚀 ~ err:", err);
    console.log("🚀 ~ data:", data);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar clínica" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar clínica", error);
    return { success: false, data: null, error: "Error al actualizar clínica" };
  }
}

/**
 * Elimina una clínica existente
 */
export async function deleteClinic(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete<ClinicResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar clínica" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar clínica", error);
    return { success: false, error: "Error al eliminar clínica" };
  }
}
