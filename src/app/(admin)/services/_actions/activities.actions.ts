"use server";

import { http } from "@/lib/http/serverFetch";
import { ActivityCreate, ActivityResponse, ActivityUpdate } from "../_types/services.types";

export async function getActivitiesByObjectiveId(
  objectiveId: string
): Promise<{ data: ActivityResponse[]; success: boolean; error?: string }> {
  const [data, err] = await http.get(`/activities?objectiveId=${objectiveId}`);
  if (err !== null) {
    return { success: false, data: [], error: err.message || "Error al obtener actividades" };
  }
  return { success: true, data: data as ActivityResponse[] };
}

export async function createActivity(
  activity: ActivityCreate
): Promise<{ data: ActivityResponse | null; success: boolean; error?: string }> {
  const [data, err] = await http.post("/activities", activity);
  if (err !== null) {
    return {
      success: false,
      data: null,
      error: err.message || "No se pudo crear la actividad. Por favor, intente nuevamente",
    };
  }
  return { success: true, data: data as ActivityResponse };
}

export async function updateActivity(
  id: string,
  activity: ActivityUpdate
): Promise<{ data: ActivityResponse | null; success: boolean; error?: string }> {
  const [data, err] = await http.put(`/activities/${id}`, activity);
  if (err !== null) {
    return {
      success: false,
      data: null,
      error: err.message || "No se pudo actualizar la actividad. Por favor, intente nuevamente",
    };
  }
  return { success: true, data: data as ActivityResponse };
}

export async function deleteActivity(id: string): Promise<{ success: boolean; error?: string }> {
  const [_, err] = await http.delete(`/activities/${id}`);
  if (err !== null) {
    return { success: false, error: err.message || "No se pudo eliminar la actividad. Por favor, intente nuevamente" };
  }
  return { success: true };
}
