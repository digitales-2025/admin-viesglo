"use server";

import { http } from "@/lib/http/methods";
import { Permission } from "../_types/roles";

const API_ENDPOINT = "/permissions";

/**
 * Obtiene todos los permisos
 */
export async function getPermissions(): Promise<{ data: Permission[]; success: boolean; error?: string }> {
  try {
    const data = await http.get<Permission[]>(API_ENDPOINT);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error al obtener permisos:", error);
    return { success: false, data: [], error: error.message || "Error al obtener permisos" };
  }
}
