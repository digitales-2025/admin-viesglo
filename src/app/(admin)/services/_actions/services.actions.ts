"use server";

import { http } from "@/lib/http/serverFetch";
import { ServiceResponse } from "../_types/services.types";

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
