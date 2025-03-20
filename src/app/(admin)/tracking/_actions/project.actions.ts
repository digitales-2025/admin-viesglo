"use server";

import { http } from "@/lib/http/serverFetch";
import { CreateProject, ProjectFilters, ProjectResponse, UpdateProject } from "../_types/tracking.types";

const API_ENDPOINT = "/projects";

/**
 * Obtiene todos los proyectos
 */
export async function getProjects(): Promise<{ data: ProjectResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener proyectos" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener proyectos", error);
    return { success: false, data: [], error: "Error al obtener proyectos" };
  }
}

/**
 * Obtiene un proyecto por su ID
 */
export async function getProject(
  id: string
): Promise<{ data: ProjectResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener proyecto" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener proyecto", error);
    return { success: false, data: null, error: "Error al obtener proyecto" };
  }
}

/**
 * Crea un nuevo proyecto
 */
export async function createProject(
  project: CreateProject
): Promise<{ data: ProjectResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ProjectResponse>(API_ENDPOINT, project);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear proyecto" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear proyecto", error);
    return { success: false, data: null, error: "Error al crear proyecto" };
  }
}

/**
 * Actualiza un proyecto existente
 */
export async function updateProject(
  id: string,
  project: UpdateProject
): Promise<{ data: ProjectResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ProjectResponse>(`${API_ENDPOINT}/${id}`, project);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar proyecto" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar proyecto", error);
    return { success: false, data: null, error: "Error al actualizar proyecto" };
  }
}

/**
 * Elimina un proyecto existente
 */
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete<ProjectResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar proyecto" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar proyecto", error);
    return { success: false, error: "Error al eliminar proyecto" };
  }
}

/**
 * Obtiene los proyectos segun filtros
 */
export async function getProjectsByFilters(
  filters: ProjectFilters
): Promise<{ data: ProjectResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectResponse[]>(
      `${API_ENDPOINT}/filters?${new URLSearchParams(filters).toString()}`
    );
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener proyectos" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener proyectos", error);
    return { success: false, data: [], error: "Error al obtener proyectos" };
  }
}
