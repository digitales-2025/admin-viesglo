"use server";

import { http } from "@/lib/http/serverFetch";
import {
  CreateDiagnostic,
  DiagnosticEntity,
  MedicalRecordFileInfo,
  MedicalRecordResponse,
  MedicalRecordsFilter,
  MedicalRecordUpdate,
  SystemCreateDiagnosticRequest,
  SystemUpdateDiagnosticRequest,
  UpdateMedicalRecordDetails,
} from "../_types/medical-record.types";

const API_ENDPOINT = "/medical-records";
const DIAGNOSTICS_API_ENDPOINT = "/diagnostics";

/**
 * Obtiene todos los registros médicos
 */
export async function getMedicalRecords(
  filters?: MedicalRecordsFilter
): Promise<{ data: MedicalRecordResponse[]; meta?: any; success: boolean; error?: string }> {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString().split("T")[0]);
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    if (!queryParams.has("page")) {
      queryParams.append("page", "1");
    }
    if (!queryParams.has("limit")) {
      queryParams.append("limit", "10");
    }

    const queryString = queryParams.toString();
    const endpoint = `${API_ENDPOINT}${queryString ? `?${queryString}` : ""}`;

    const [response, err] = await http.get<any>(endpoint);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener registros médicos" };
    }

    if (response.data && response.meta) {
      return {
        success: true,
        data: response.data,
        meta: response.meta,
      };
    }

    return { success: true, data: Array.isArray(response) ? response : [] };
  } catch (_error) {
    return { success: false, data: [], error: "Error al obtener registros médicos" };
  }
}

/**
 * Obtiene un registro médico por su ID
 */
export async function getMedicalRecord(
  id: string
): Promise<{ data: MedicalRecordResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<MedicalRecordResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener registro médico" };
    }
    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al obtener registro médico" };
  }
}

/**
 * Crea un nuevo registro médico
 */
export async function createMedicalRecord(
  formData: FormData
): Promise<{ data: MedicalRecordResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.multipartPost<MedicalRecordResponse>(API_ENDPOINT, formData);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear registro médico" };
    }
    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al crear registro médico" };
  }
}

/**
 * Obtiene información del certificado de aptitud médica
 */
export async function getAptitudeCertificateInfo(
  id: string
): Promise<{ data: MedicalRecordFileInfo | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<MedicalRecordFileInfo>(`${API_ENDPOINT}/${id}/aptitude-certificate/info`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener información del certificado" };
    }
    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al obtener información del certificado" };
  }
}

/**
 * Obtiene información del informe médico
 */
export async function getMedicalReportInfo(
  id: string
): Promise<{ data: MedicalRecordFileInfo | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<MedicalRecordFileInfo>(`${API_ENDPOINT}/${id}/medical-report/info`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener información del informe médico" };
    }
    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al obtener información del informe médico" };
  }
}

/**
 * Sube o reemplaza el certificado de aptitud médica
 */
export async function uploadAptitudeCertificate(id: string, file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const [_, err] = await http.multipartPost(`${API_ENDPOINT}/${id}/aptitude-certificate`, formData);

    if (err !== null) {
      return { success: false, error: err.message || "Error al subir el certificado de aptitud médica" };
    }
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al subir el certificado de aptitud médica" };
  }
}

/**
 * Sube o reemplaza el informe médico
 */
export async function uploadMedicalReport(id: string, file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const [_, err] = await http.multipartPost(`${API_ENDPOINT}/${id}/medical-report`, formData);

    if (err !== null) {
      return { success: false, error: err.message || "Error al subir el informe médico" };
    }
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al subir el informe médico" };
  }
}

/**
 * Descarga el certificado de aptitud médica
 */
export async function downloadAptitudeCertificate(id: string) {
  try {
    const [_, err, response] = await http.downloadFile(`${API_ENDPOINT}/${id}/aptitude-certificate`);
    if (err !== null) {
      throw new Error(err.message || "Error al descargar certificado");
    }

    if (response) {
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "evidence";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const contentType = response.headers.get("Content-Type") || "application/octet-stream";

      return {
        success: true,
        downloadUrl: process.env.BACKEND_URL + `${API_ENDPOINT}/${id}/aptitude-certificate`,
        filename,
        contentType,
      };
    }

    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al descargar certificado" };
  }
}

/**
 * Descarga el informe médico
 */
export async function downloadMedicalReport(id: string) {
  // Esta función usa las nuevas utilidades para obtener la respuesta completa de descarga
  try {
    // Hacer la solicitud para verificar que el archivo existe y obtener metadatos
    const [_, err, response] = await http.downloadFile(`${API_ENDPOINT}/${id}/medical-report`);
    if (err !== null) {
      throw new Error(err.message || "Error al descargar informe");
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
        downloadUrl: process.env.BACKEND_URL + `${API_ENDPOINT}/${id}/medical-report`,
        filename,
        contentType,
      };
    }

    // Si no hay respuesta pero tampoco error, informamos de éxito pero sin datos
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al descargar informe" };
  }
}

/**
 * Actualiza los detalles médicos de un registro
 */
export async function updateMedicalRecordDetails(
  id: string,
  details: UpdateMedicalRecordDetails
): Promise<{ data: MedicalRecordResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.patch<MedicalRecordResponse>(`${API_ENDPOINT}/${id}/details`, details);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar detalles médicos" };
    }

    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al actualizar detalles médicos" };
  }
}

/**
 * Actualiza un registro médico
 */
export async function updateMedicalRecord(
  id: string,
  data: MedicalRecordUpdate
): Promise<{ data: MedicalRecordResponse | null; success: boolean; error?: string }> {
  try {
    const [response, err] = await http.patch<MedicalRecordResponse>(`${API_ENDPOINT}/${id}`, data);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar registro médico" };
    }

    return { success: true, data: response };
  } catch (_error) {
    return { success: false, data: null, error: "Error al actualizar registro médico" };
  }
}

/**
 * Elimina un registro médico
 */
export async function deleteMedicalRecord(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);

    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar registro médico" };
    }

    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al eliminar registro médico" };
  }
}

/**
 * Obtiene todos los diagnósticos de un registro médico
 */
export async function getDiagnostics(id: string): Promise<{ data: any[]; success: boolean; error?: string }> {
  try {
    const endpoint = `/diagnostics/medical-records/${id}/diagnostics`;

    const [data, err] = await http.get<any[]>(endpoint);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener diagnósticos" };
    }

    return { success: true, data };
  } catch (_error) {
    return { success: false, data: [], error: "Error al obtener diagnósticos" };
  }
}

/**
 * Agrega un diagnóstico a un registro médico
 */
export async function addDiagnostic(
  id: string,
  diagnostic: CreateDiagnostic
): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const endpoint = `/diagnostics/medical-records/${id}/diagnostics`;

    const [data, err] = await http.post<any>(endpoint, diagnostic);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al agregar diagnóstico" };
    }

    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al agregar diagnóstico" };
  }
}

/**
 * Elimina un diagnóstico de un registro médico
 */
export async function deleteDiagnostic(
  id: string,
  diagnosticId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const endpoint = `/diagnostics/medical-records/${id}/diagnostics/${diagnosticId}`;

    const [_, err] = await http.delete(endpoint);

    if (err !== null) {
      if (err.statusCode === 404) {
        return {
          success: false,
          error: `El endpoint para eliminar diagnósticos no está implementado (404). Contacte al administrador del sistema.`,
        };
      }

      return { success: false, error: err.message || "Error al eliminar diagnóstico" };
    }

    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al eliminar diagnóstico" };
  }
}

/**
 * Obtiene todas las categorías médicas y sus condiciones
 */
export async function getAllMedicalCategories(): Promise<{
  data: any | null;
  success: boolean;
  error?: string;
}> {
  try {
    const [data, err] = await http.get<any>(`${API_ENDPOINT}/categories/all`);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener categorías médicas" };
    }

    return { success: true, data };
  } catch (_error) {
    return { success: false, data: null, error: "Error al obtener categorías médicas" };
  }
}

/**
 * Agrega múltiples diagnósticos a un registro médico
 */
export async function addMultipleDiagnostics(
  id: string,
  diagnostics: CreateDiagnostic[]
): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    if (diagnostics.length === 0) {
      return { success: true, data: [] };
    }

    const validDiagnostics = diagnostics.filter((d) => d.diagnosticId || d.diagnosticValueId);
    const payload: any = { diagnostics: validDiagnostics };

    const [data, err] = await http.post<any>(`/diagnostics/medical-records/${id}/bulk-diagnostics`, payload);

    if (err !== null) {
      return {
        success: false,
        data: null,
        error: err.message || "Error al agregar múltiples diagnósticos",
      };
    }

    return { success: true, data };
  } catch (_error) {
    return {
      success: false,
      data: null,
      error: "Error al agregar múltiples diagnósticos",
    };
  }
}

/**
 * Agrega un valor de diagnóstico personalizado a un registro médico
 */
export async function addDiagnosticValue(
  id: string,
  name: string,
  values: string[]
): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const endpoint = `/diagnostics/medical-records/${id}/diagnostic-value`;

    const payload = {
      name,
      value: values,
    };

    const [data, err] = await http.post<any>(endpoint, payload);

    if (err !== null) {
      return {
        success: false,
        data: null,
        error: err.message || "Error al agregar diagnóstico personalizado",
      };
    }

    return { success: true, data };
  } catch (_error) {
    return {
      success: false,
      data: null,
      error: "Error al agregar diagnóstico personalizado",
    };
  }
}

/**
 * Actualiza el nombre de un valor de diagnóstico personalizado
 */
export async function updateDiagnosticValueName(
  diagnosticValueId: string,
  name: string
): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const endpoint = `/diagnostics/diagnostic-values/${diagnosticValueId}/name`;

    const payload = {
      name,
    };

    const [data, err] = await http.patch<any>(endpoint, payload);

    if (err !== null) {
      return {
        success: false,
        data: null,
        error: err.message || "Error al actualizar nombre del diagnóstico personalizado",
      };
    }

    return { success: true, data };
  } catch (_error) {
    return {
      success: false,
      data: null,
      error: "Error al actualizar nombre del diagnóstico personalizado",
    };
  }
}

/**
 * Obtiene todos los diagnósticos disponibles en el sistema
 */
export async function getAllAvailableDiagnostics(): Promise<{
  data: DiagnosticEntity[];
  success: boolean;
  error?: string;
}> {
  try {
    const endpoint = `${DIAGNOSTICS_API_ENDPOINT}`;

    const [response, err] = await http.get<{ diagnostics: DiagnosticEntity[] }>(endpoint);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener diagnósticos disponibles" };
    }

    const diagnostics = response.diagnostics || [];

    return { success: true, data: diagnostics };
  } catch (_error) {
    return { success: false, data: [], error: "Error crítico al obtener diagnósticos disponibles" };
  }
}

/**
 * Obtiene todos los diagnósticos activos en el sistema
 */
export async function getActiveDiagnostics(): Promise<{
  data: DiagnosticEntity[];
  success: boolean;
  error?: string;
}> {
  try {
    const endpoint = `${DIAGNOSTICS_API_ENDPOINT}/active`;

    const [response, err] = await http.get<{ diagnostics: DiagnosticEntity[] }>(endpoint);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener diagnósticos activos" };
    }

    const diagnostics = response.diagnostics || [];

    return { success: true, data: diagnostics };
  } catch (_error) {
    return { success: false, data: [], error: "Error crítico al obtener diagnósticos activos" };
  }
}

/**
 * Obtiene todos los diagnósticos disponibles en el sistema
 */
export async function getAllDiagnosticsForTable(): Promise<{
  data: DiagnosticEntity[];
  success: boolean;
  error?: string;
}> {
  try {
    const endpoint = `${DIAGNOSTICS_API_ENDPOINT}?includeInactive=true`;

    const [response, err] = await http.get<{ diagnostics: DiagnosticEntity[] }>(endpoint);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener diagnósticos disponibles" };
    }

    const diagnostics = response.diagnostics || [];

    return { success: true, data: diagnostics };
  } catch (_error) {
    return { success: false, data: [], error: "Error crítico al obtener diagnósticos disponibles" };
  }
}

/**
 * Elimina un diagnóstico del sistema
 */
export async function deleteDiagnosticFromSystem(diagnosticId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${DIAGNOSTICS_API_ENDPOINT}/${diagnosticId}`);

    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar diagnóstico" };
    }

    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al eliminar diagnóstico" };
  }
}

/**
 * Actualiza un diagnóstico en el sistema
 */
export async function updateDiagnosticInSystem(
  diagnosticId: string,
  data: SystemUpdateDiagnosticRequest
): Promise<{ data: DiagnosticEntity | null; success: boolean; error?: string }> {
  try {
    const [response, err] = await http.patch<DiagnosticEntity>(`${DIAGNOSTICS_API_ENDPOINT}/${diagnosticId}`, data);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar diagnóstico" };
    }

    return { success: true, data: response };
  } catch (_error) {
    return { success: false, data: null, error: "Error al actualizar diagnóstico" };
  }
}

/**
 * Crea un nuevo diagnóstico en el sistema
 */
export async function createDiagnosticInSystem(
  data: SystemCreateDiagnosticRequest
): Promise<{ data: DiagnosticEntity | null; success: boolean; error?: string }> {
  try {
    const [response, err] = await http.post<DiagnosticEntity>(`${DIAGNOSTICS_API_ENDPOINT}`, data);

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear diagnóstico" };
    }

    return { success: true, data: response };
  } catch (_error) {
    return { success: false, data: null, error: "Error al crear diagnóstico" };
  }
}

/**
 * Activa un diagnóstico en el sistema
 */
export async function activateDiagnosticInSystem(
  diagnosticId: string
): Promise<{ data: DiagnosticEntity | null; success: boolean; error?: string }> {
  try {
    const [response, err] = await http.patch<DiagnosticEntity>(
      `${DIAGNOSTICS_API_ENDPOINT}/${diagnosticId}/activate`,
      {}
    );

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al activar diagnóstico" };
    }

    // El backend devuelve { message: string, diagnostic: DiagnosticEntity }
    // Aquí asumimos que el objeto `diagnostic` está en la respuesta, si no, hay que ajustar.
    // Si la respuesta es solo un mensaje de éxito y el diagnóstico actualizado no viene en el cuerpo,
    // se podría necesitar hacer un GET después o simplemente devolver success: true.
    // Basado en el controller, sí devuelve el diagnóstico.
    // @ts-expect-error backend devuelve un objeto { message, diagnostic }
    if (response && response.diagnostic) {
      // @ts-expect-error response.diagnostic es el tipo correcto aquí
      return { success: true, data: response.diagnostic };
    }

    return { success: true, data: response }; // Asumiendo que la respuesta directa es DiagnosticEntity
  } catch (_error) {
    return { success: false, data: null, error: "Error al activar diagnóstico" };
  }
}

/**
 * Desactiva un diagnóstico en el sistema
 */
export async function deactivateDiagnosticInSystem(
  diagnosticId: string
): Promise<{ data: DiagnosticEntity | null; success: boolean; error?: string }> {
  try {
    // Asumiendo que el endpoint es PATCH y no necesita un body, o un body vacío.
    // Si necesita un body específico para desactivar, hay que añadirlo.
    const [response, err] = await http.patch<DiagnosticEntity>(
      `${DIAGNOSTICS_API_ENDPOINT}/${diagnosticId}/deactivate`,
      {}
    );

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al desactivar diagnóstico" };
    }

    // Similar a activar, el backend devuelve { message: string, diagnostic: DiagnosticEntity }
    // @ts-expect-error backend devuelve un objeto { message, diagnostic }
    if (response && response.diagnostic) {
      // @ts-expect-error response.diagnostic es el tipo correcto aquí
      return { success: true, data: response.diagnostic };
    }
    // Si la respuesta es solo un mensaje de éxito y el diagnóstico actualizado no viene en el cuerpo
    return { success: true, data: response }; // Asumiendo que la respuesta directa es DiagnosticEntity
  } catch (_error) {
    return { success: false, data: null, error: "Error al desactivar diagnóstico" };
  }
}

export async function toggleIncludeReportsDiagnostic(
  diagnosticId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.patch<DiagnosticEntity>(
      `${DIAGNOSTICS_API_ENDPOINT}/${diagnosticId}/toggle-include-reports`
    );

    if (err !== null) {
      return { success: false, error: err.message || "Error al cambiar el estado de inclusión en informes" };
    }

    return { success: true };
  } catch (_error) {
    return { success: false, error: "Error al cambiar el estado de inclusión en informes" };
  }
}
