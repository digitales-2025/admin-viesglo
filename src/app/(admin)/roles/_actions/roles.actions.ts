"use server";

import { http } from "@/lib/http/serverFetch";
import { Permission, Role, RoleCreate } from "../_types/roles";

const API_ENDPOINT = "/roles";

/**
 * Obtiene todos los roles
 */
export async function getRoles(): Promise<{ data: Role[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<Role[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener roles" };
    }
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
    const [data, err] = await http.get<Role>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener rol" };
    }
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
  roleData: RoleCreate
): Promise<{ data: Role | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<Role>(API_ENDPOINT, roleData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear rol" };
    }
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
    const [data, err] = await http.put<Role>(`${API_ENDPOINT}/${id}`, roleData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar rol" };
    }
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
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar rol" };
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Error al eliminar rol ${id}:`, error);
    return { success: false, error: error.message || "Error al eliminar rol" };
  }
}

/**
 * Toggle el rol de un usuario
 */
export async function toggleActiveRole(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch(`${API_ENDPOINT}/${id}/toggle-active`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al toggle el rol de un usuario" };
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Error al toggle el rol de un usuario`, error);
    return { success: false, error: error.message || "Error al toggle el rol de un usuario" };
  }
}

/**
 * Obtiene los permisos de un rol
 */
export async function getRolePermissions(
  id: string
): Promise<{ data: Permission[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<Permission[]>(`${API_ENDPOINT}/${id}/permissions`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener permisos del rol" };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Error al obtener permisos del rol" };
  }
}
