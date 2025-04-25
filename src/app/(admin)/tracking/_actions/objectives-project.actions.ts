"use server";

import { http } from "@/lib/http/serverFetch";
import { CreateProjectObjective, ProjectObjectiveResponse, UpdateProjectObjective } from "../_types/tracking.types";

const API_ENDPOINT = "/project-objectives";

export async function getObjectivesProject(
  serviceId: string
): Promise<{ data: ProjectObjectiveResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectObjectiveResponse[]>(`${API_ENDPOINT}?serviceId=${serviceId}`);
    if (err !== null) {
      throw new Error(err.message || "Error al obtener objetivos del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener objetivos del proyecto", error);
    return { success: false, data: [], error: "Error al obtener objetivos del proyecto" };
  }
}

export async function createObjectiveProject(
  serviceId: string,
  objective: CreateProjectObjective
): Promise<{ data: ProjectObjectiveResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ProjectObjectiveResponse>(`${API_ENDPOINT}?serviceId=${serviceId}`, objective);
    if (err !== null) {
      throw new Error(err.message || "Error al crear objetivo del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear objetivo del proyecto", error);
    return { success: false, data: null, error: "Error al crear objetivo del proyecto" };
  }
}
export async function updateObjectiveProject(
  objectiveId: string,
  objective: UpdateProjectObjective
): Promise<{ data: ProjectObjectiveResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ProjectObjectiveResponse>(`${API_ENDPOINT}/${objectiveId}`, objective);
    if (err !== null) {
      throw new Error(err.message || "Error al actualizar objetivo del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar objetivo del proyecto", error);
    return { success: false, data: null, error: "Error al actualizar objetivo del proyecto" };
  }
}

export async function deleteObjectiveProject(objectiveId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch<ProjectObjectiveResponse>(`${API_ENDPOINT}/${objectiveId}/toggle-active`, {
      isActive: false,
    });
    if (err !== null) {
      throw new Error(err.message || "Error al eliminar objetivo del proyecto");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar objetivo del proyecto", error);
    return { success: false, error: "Error al eliminar objetivo del proyecto" };
  }
}

export async function toggleObjectiveProjectActive(objectiveId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch<ProjectObjectiveResponse>(`${API_ENDPOINT}/${objectiveId}/toggle-active`, {
      isActive: true,
    });
    if (err !== null) {
      throw new Error(err.message || "Error al activar/desactivar objetivo del proyecto");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al activar/desactivar objetivo del proyecto", error);
    return { success: false, error: "Error al activar/desactivar objetivo del proyecto" };
  }
}
