"use server";

import { http } from "@/lib/http/serverFetch";
import {
  CreateProjectActivity,
  ProjectActivityResponse,
  TrackingActivityDto,
  UpdateProjectActivity,
} from "../_types/tracking.types";

const API_ENDPOINT = "/project-activities";

export async function getActivitiesProject(
  objectiveId: string
): Promise<{ data: ProjectActivityResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectActivityResponse[]>(`${API_ENDPOINT}?objectiveId=${objectiveId}`);
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
    const [data, err] = await http.post<ProjectActivityResponse>(`${API_ENDPOINT}?objectiveId=${projectId}`, activity);
    if (err !== null) {
      throw new Error(err.message || "Error al crear actividad del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear actividad del proyecto", error);
    return { success: false, data: null, error: (error as Error).message || "Error al crear actividad del proyecto" };
  }
}

export async function updateActivityProject(
  activityId: string,
  activity: UpdateProjectActivity
): Promise<{ data: ProjectActivityResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ProjectActivityResponse>(`${API_ENDPOINT}/${activityId}`, activity);
    if (err !== null) {
      throw new Error(err.message || "Error al actualizar actividad del proyecto");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar actividad del proyecto", error);
    return { success: false, data: null, error: "Error al actualizar actividad del proyecto" };
  }
}

export async function deleteActivityProject(activityId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete<ProjectActivityResponse>(`${API_ENDPOINT}/${activityId}`);
    if (err !== null) {
      throw new Error(err.message || "Error al eliminar actividad del proyecto");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar actividad del proyecto", error);
    return { success: false, error: "Error al eliminar actividad del proyecto" };
  }
}

export async function updateTrackingActivity(activityId: string, trackingActivity: TrackingActivityDto) {
  try {
    const [_, err] = await http.patch<ProjectActivityResponse>(
      `${API_ENDPOINT}/${activityId}/tracking`,
      trackingActivity
    );
    if (err !== null) {
      throw new Error(err.message || "Error al actualizar la actividad");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la actividad", error);
    return { success: false, error: "Error al actualizar la actividad" };
  }
}

export async function uploadEvidence(activityId: string, evidence: File) {
  try {
    const formData = new FormData();
    formData.append("file", evidence);
    const [_, err] = await http.multipartPost<ProjectActivityResponse>(
      `${API_ENDPOINT}/${activityId}/upload-evidence`,
      formData
    );
    if (err !== null) {
      throw new Error(err.message || "Error al subir evidencia");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al subir evidencia", error);
    return { success: false, error: "Error al subir evidencia" };
  }
}

export async function deleteEvidence(activityId: string) {
  try {
    const [_, err] = await http.delete<ProjectActivityResponse>(`${API_ENDPOINT}/${activityId}/evidence`);
    if (err !== null) {
      throw new Error(err.message || "Error al eliminar evidencia");
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar evidencia", error);
    return { success: false, error: "Error al eliminar evidencia" };
  }
}

export async function getEvidence(activityId: string) {
  try {
    const [data, err] = await http.get<ProjectActivityResponse>(`${API_ENDPOINT}/${activityId}/evidence`);
    if (err !== null) {
      throw new Error(err.message || "Error al obtener evidencia");
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener evidencia", error);
    return { success: false, error: "Error al obtener evidencia" };
  }
}

export async function downloadEvidence(activityId: string) {
  // Esta función usa las nuevas utilidades para obtener la respuesta completa de descarga
  try {
    // Hacer la solicitud para verificar que el archivo existe y obtener metadatos
    const [_, err, response] = await http.downloadFile(`${API_ENDPOINT}/${activityId}/download-evidence`);
    if (err !== null) {
      throw new Error(err.message || "Error al descargar evidencia");
    }

    // Si tenemos una respuesta, extraemos la información necesaria para la descarga
    if (response) {
      // Obtener el nombre del archivo del Content-Disposition
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "evidence";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const contentType = response.headers.get("Content-Type") || "application/octet-stream";

      // En lugar de intentar procesar el blob aquí, devolvemos la información necesaria
      // para que el cliente pueda hacer la solicitud correctamente
      return {
        success: true,
        // URL absoluta al backend para descarga directa (no la ruta relativa de la API)
        // Esto es importante porque la URL relativa de la API puede estar redirigiendo a un HTML
        downloadUrl: process.env.BACKEND_URL + `${API_ENDPOINT}/${activityId}/download-evidence`,
        filename,
        contentType,
      };
    }

    // Si no hay respuesta pero tampoco error, informamos de éxito pero sin datos
    return { success: true };
  } catch (error) {
    console.error("Error al descargar evidencia", error);
    return { success: false, error: "Error al descargar evidencia" };
  }
}
