"use server";

import { http } from "@/lib/http/serverFetch";
import { CreateProjectActivity, ProjectActivityResponse, UpdateProjectActivity } from "../_types/tracking.types";

const API_ENDPOINT = "/project-activities";

export async function getActivitiesProject(
  projectId: string
): Promise<{ data: ProjectActivityResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectActivityResponse[]>(`${API_ENDPOINT}/${projectId}`);
    if (err !== null) {
      throw new Error(err.message || "Error al obtener actividades del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener actividades del proyecto", error);
    return { success: false, data: [], error: "Error al obtener actividades del proyecto" };
  }
}

export async function createActivityProject(
  projectId: string,
  activity: CreateProjectActivity
): Promise<{ data: ProjectActivityResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ProjectActivityResponse>(`${API_ENDPOINT}/${projectId}`, activity);
    if (err !== null) {
      throw new Error(err.message || "Error al crear actividad del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear actividad del proyecto", error);
    return { success: false, data: null, error: "Error al crear actividad del proyecto" };
  }
}

export async function updateActivityProject(
  projectId: string,
  activityId: string,
  activity: UpdateProjectActivity
): Promise<{ data: ProjectActivityResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ProjectActivityResponse>(`${API_ENDPOINT}/${projectId}/${activityId}`, activity);
    if (err !== null) {
      throw new Error(err.message || "Error al actualizar actividad del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar actividad del proyecto", error);
    return { success: false, data: null, error: "Error al actualizar actividad del proyecto" };
  }
}

export async function deleteActivityProject(
  projectId: string,
  activityId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete<ProjectActivityResponse>(`${API_ENDPOINT}/${projectId}/${activityId}`);
    if (err !== null) {
      throw new Error(err.message || "Error al eliminar actividad del proyecto");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar actividad del proyecto", error);
    return { success: false, error: "Error al eliminar actividad del proyecto" };
  }
}
