"use server";

import { http } from "@/lib/http/serverFetch";
import { CreateProjectService, ProjectServiceResponse, UpdateProjectService } from "../_types/tracking.types";

const API_ENDPOINT = "/project-services";

export async function getServicesProject(
  projectId: string
): Promise<{ data: ProjectServiceResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectServiceResponse[]>(`${API_ENDPOINT}?projectId=${projectId}`);
    if (err !== null) {
      throw new Error(err.message || "Error al obtener servicios del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener servicios del proyecto", error);
    return { success: false, data: [], error: "Error al obtener servicios del proyecto" };
  }
}
export async function getServicesProjectById(
  projectId: string
): Promise<{ data: ProjectServiceResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectServiceResponse[]>(`${API_ENDPOINT}/${projectId}`);
    if (err !== null) {
      throw new Error(err.message || "Error al obtener servicios del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener servicios del proyecto", error);
    return { success: false, data: [], error: "Error al obtener servicios del proyecto" };
  }
}

export async function createServiceProject(
  projectId: string,
  service: CreateProjectService
): Promise<{ data: ProjectServiceResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ProjectServiceResponse>(`${API_ENDPOINT}/${projectId}`, service);
    if (err !== null) {
      console.error("❌ Error al crear servicio del proyecto", err);
      throw new Error(err.message || "Error al crear servicio del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al crear servicio del proyecto", error);
    return { success: false, data: null, error: "Error al crear servicio del proyecto" };
  }
}

export async function updateServiceProject(
  serviceId: string,
  service: UpdateProjectService
): Promise<{ data: ProjectServiceResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ProjectServiceResponse>(`${API_ENDPOINT}/${serviceId}`, service);
    if (err !== null) {
      throw new Error(err.message || "Error al actualizar servicio del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar servicio del proyecto", error);
    return { success: false, data: null, error: "Error al actualizar servicio del proyecto" };
  }
}

export async function deleteServiceProject(serviceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch<ProjectServiceResponse>(`${API_ENDPOINT}/${serviceId}/toggle-active`, {});
    if (err !== null) {
      throw new Error(err.message || "Error al eliminar servicio del proyecto");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar servicio del proyecto", error);
    return { success: false, error: "Error al eliminar servicio del proyecto" };
  }
}

export async function createServiceFromTemplate(
  projectId: string,
  services: {
    serviceId: string;
    objectives?: {
      objectiveId?: string;
      activities?: {
        activityId?: string;
      }[];
    }[];
  }[]
): Promise<{ data: ProjectServiceResponse[] | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ProjectServiceResponse[]>(`${API_ENDPOINT}/template/${projectId}`, {
      services,
    });
    if (err !== null) {
      console.error("❌ Error al crear servicios desde plantilla", err);
      throw new Error(err.message || "Error al crear servicios desde plantilla");
    }
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al crear servicios desde plantilla", error);
    return { success: false, data: null, error: "Error al crear servicios desde plantilla" };
  }
}
