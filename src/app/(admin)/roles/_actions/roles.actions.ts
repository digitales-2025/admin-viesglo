"use server";

import { http } from "@/lib/http/methods";
import { Role } from "../_types/roles";

const API_ENDPOINT = "/roles";

/**
 * Obtiene todos los roles
 */
export async function getRoles(): Promise<{ data: Role[]; success: boolean; error?: string }> {
  try {
    const data = await http.get<Role[]>(API_ENDPOINT);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error al obtener roles:", error);
    return { success: false, data: [], error: error.message || "Error al obtener roles" };
  }
}

/**
 * Obtiene un rol por su ID
 */
export async function getRole(id: string): Promise<{ data: Role | null; success: boolean; error?: string }> {
  try {
    const data = await http.get<Role>(`${API_ENDPOINT}/${id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error(`Error al obtener rol ${id}:`, error);
    return { success: false, data: null, error: error.message || "Error al obtener rol" };
  }
}

/**
 * Crea un nuevo rol
 */
export async function createRole(
  roleData: Omit<Role, "id" | "createdAt" | "updatedAt">
): Promise<{ data: Role | null; success: boolean; error?: string }> {
  try {
    const data = await http.post<Role>(API_ENDPOINT, roleData);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error al crear rol:", error);
    return { success: false, data: null, error: error.message || "Error al crear rol" };
  }
}

/**
 * Actualiza un rol existente
 */
export async function updateRole(
  id: string,
  roleData: Partial<Omit<Role, "id" | "createdAt" | "updatedAt">>
): Promise<{ data: Role | null; success: boolean; error?: string }> {
  try {
    const data = await http.put<Role>(`${API_ENDPOINT}/${id}`, roleData);
    return { success: true, data };
  } catch (error: any) {
    console.error(`Error al actualizar rol ${id}:`, error);
    return { success: false, data: null, error: error.message || "Error al actualizar rol" };
  }
}

/**
 * Elimina un rol
 */
export async function deleteRole(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await http.delete(`${API_ENDPOINT}/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error al eliminar rol ${id}:`, error);
    return { success: false, error: error.message || "Error al eliminar rol" };
  }
}
