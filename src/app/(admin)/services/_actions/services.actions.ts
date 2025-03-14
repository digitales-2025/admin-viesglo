"use server";

import { http } from "@/lib/http/serverFetch";
import { ServiceCreate, ServiceResponse, ServiceUpdate } from "../_types/services.types";

export async function getServices(): Promise<{ data: ServiceResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ServiceResponse[]>("/services");
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener servicios" };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("Error al obtener servicios:", error);
    return { success: false, data: [], error: error.message || "Error al obtener servicios" };
  }
}

export async function createService(data: ServiceCreate) {
  try {
    const [res, err] = await http.post<ServiceResponse>("/services", data);
    if (err !== null) {
      return { success: false, error: err.message || "Error al crear servicio" };
    }
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error al crear servicio:", error);
    return { success: false, error: error.message || "Error al crear servicio" };
  }
}

export async function updateService(id: string, data: ServiceUpdate) {
  try {
    const [res, err] = await http.put<ServiceResponse>(`/services/${id}`, data);
    if (err !== null) {
      return { success: false, error: err.message || "Error al actualizar servicio" };
    }
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error al actualizar servicio:", error);
    return { success: false, error: error.message || "Error al actualizar servicio" };
  }
}

export async function deleteService(id: string) {
  try {
    const [res, err] = await http.delete<ServiceResponse>(`/services/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar servicio" };
    }
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error al eliminar servicio:", error);
  }
}
