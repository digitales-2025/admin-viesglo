"use server";

import { http } from "@/lib/http/serverFetch";
import { ObjectiveCreate, ObjectiveResponse, ObjectiveUpdate } from "../_types/services.types";

export async function getObjectivesByServiceId(serviceId: string) {
  const [data, err] = await http.get<ObjectiveResponse[]>(`/objectives/${serviceId}`);
  if (err !== null) {
    return {
      success: false,
      data: [],
      error: err.message || "No se pudieron obtener los objetivos del servicio",
    };
  }
  return { success: true, data };
}

export async function createObjective(
  objective: ObjectiveCreate
): Promise<{ data: ObjectiveResponse | null; success: boolean; error?: string }> {
  const [data, err] = await http.post("/objectives", objective);
  if (err !== null) {
    return {
      success: false,
      data: null,
      error: err.message || "No se pudo crear el objetivo. Por favor, intente nuevamente",
    };
  }
  return { success: true, data: data as ObjectiveResponse };
}

export async function updateObjective(
  id: string,
  objective: ObjectiveUpdate
): Promise<{ data: ObjectiveResponse | null; success: boolean; error?: string }> {
  const [data, err] = await http.put(`/objectives/${id}`, objective);
  if (err !== null) {
    return {
      success: false,
      data: null,
      error: err.message || "No se pudo actualizar el objetivo. Por favor, intente nuevamente",
    };
  }
  return { success: true, data: data as ObjectiveResponse };
}

export async function deleteObjective(id: string): Promise<{ success: boolean; error?: string }> {
  const [_, err] = await http.delete(`/objectives/${id}`);
  if (err !== null) {
    return {
      success: false,
      error: err.message || "No se pudo eliminar el objetivo. Por favor, intente nuevamente",
    };
  }
  return { success: true };
}
