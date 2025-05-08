"use server";

import { Permission } from "@/auth/domain/entities/Role";
import { http } from "@/lib/http/serverFetch";
import { User, UserCreate } from "../_types/user.types";

const API_ENDPOINT = "/users";

/**
 * Obtiene todos los usuarios
 */
export async function getUsers(): Promise<{ data: User[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<User[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener usuarios" };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Error al obtener usuarios" };
  }
}

/**
 * Obtiene un usuario por su ID
 */
export async function getUser(id: string): Promise<{ data: User | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<User>(`${API_ENDPOINT}/${id}`);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener usuario" };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: null, error: error.message || "Error al obtener usuario" };
  }
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(
  roleData: UserCreate
): Promise<{ data: User | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<User>(API_ENDPOINT, roleData);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear usuario" };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: null, error: error.message || "Error al crear usuario" };
  }
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(
  id: string,
  roleData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<{ data: User | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<User>(`${API_ENDPOINT}/${id}`, roleData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar usuario" };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error(`Error al actualizar usuario ${id}:`, error);
    return { success: false, data: null, error: error.message || "Error al actualizar usuario" };
  }
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar usuario" };
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    return { success: false, error: error.message || "Error al eliminar usuario" };
  }
}

/**
 * Obtiene los permisos de un usuario
 */
export async function getUserPermissions(
  id: string
): Promise<{ data: Permission[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<Permission[]>(`${API_ENDPOINT}/${id}/permissions`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener permisos del usuario" };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Error al obtener permisos del usuario" };
  }
}

/** usuarios con acceso al proyecto */
export async function getUsersProjects(): Promise<{ data: User[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<User[]>(`${API_ENDPOINT}/users-project`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener usuarios" };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Error al obtener usuarios" };
  }
}
