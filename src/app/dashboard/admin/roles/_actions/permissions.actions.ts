"use server";

import { http } from "@/lib/http/serverFetch";
import { Permission } from "../_types/roles";

const API_ENDPOINT = "/permissions";

/**
 * Obtiene todos los permisos
 */
export async function getPermissions(): Promise<{ data: Permission[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<Permission[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener permisos" };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("Error al obtener permisos:", error);
    return { success: false, data: [], error: error.message || "Error al obtener permisos" };
  }
}
