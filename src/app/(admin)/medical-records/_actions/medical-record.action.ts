"use server";

import { http } from "@/lib/http/serverFetch";
import {
  CreateDiagnostic,
  MedicalRecordFileInfo,
  MedicalRecordResponse,
  MedicalRecordsFilter,
  MedicalRecordUpdate,
  UpdateMedicalRecordDetails,
} from "../_types/medical-record.types";

const API_ENDPOINT = "/medical-records";

/**
 * Obtiene todos los registros médicos
 */
export async function getMedicalRecords(
  filters?: MedicalRecordsFilter
): Promise<{ data: MedicalRecordResponse[]; success: boolean; error?: string }> {
  try {
    // Construir query params basados en los filtros proporcionados
    const queryParams = new URLSearchParams();

    if (filters?.clientId) {
      queryParams.append("clientId", filters.clientId);
    }

    const queryString = queryParams.toString();
    const endpoint = `${API_ENDPOINT}${queryString ? `?${queryString}` : ""}`;

    console.log(`🔍 Obteniendo registros médicos con filtros:`, JSON.stringify(filters, null, 2));
    console.log(`📡 URL de solicitud: ${process.env.BACKEND_URL}${endpoint}`);

    const [data, err] = await http.get<MedicalRecordResponse[]>(endpoint);
    if (err !== null) {
      console.error(`❌ Error al obtener registros médicos:`, err);
      return { success: false, data: [], error: err.message || "Error al obtener registros médicos" };
    }

    console.log(`✅ Registros médicos obtenidos. Cantidad: ${data.length}`);

    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al obtener registros médicos", error);
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
  } catch (error) {
    console.error("Error al obtener registro médico", error);
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
  } catch (error) {
    console.error("Error al crear registro médico:", error);
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
  } catch (error) {
    console.error("Error al obtener información del certificado", error);
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
  } catch (error) {
    console.error("Error al obtener información del informe médico", error);
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
  } catch (error) {
    console.error("Error al subir el certificado de aptitud médica", error);
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
  } catch (error) {
    console.error("Error al subir el informe médico", error);
    return { success: false, error: "Error al subir el informe médico" };
  }
}

/**
 * Descarga el certificado de aptitud médica
 */
export async function downloadAptitudeCertificate(id: string) {
  // Esta función usa las nuevas utilidades para obtener la respuesta completa de descarga
  try {
    // Hacer la solicitud para verificar que el archivo existe y obtener metadatos
    const [_, err, response] = await http.downloadFile(`${API_ENDPOINT}/${id}/aptitude-certificate`);
    if (err !== null) {
      throw new Error(err.message || "Error al descargar certificado");
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
        downloadUrl: process.env.BACKEND_URL + `${API_ENDPOINT}/${id}/aptitude-certificate`,
        filename,
        contentType,
      };
    }

    // Si no hay respuesta pero tampoco error, informamos de éxito pero sin datos
    return { success: true };
  } catch (error) {
    console.error("Error al descargar certificado", error);
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
  } catch (error) {
    console.error("Error al descargar informe", error);
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
    console.log(`📝 Actualizando detalles médicos para el registro con ID: ${id}`);
    console.log(`📊 Datos enviados:`, JSON.stringify(details).substring(0, 500) + "...");

    const [data, err] = await http.patch<MedicalRecordResponse>(`${API_ENDPOINT}/${id}/details`, details);

    if (err !== null) {
      console.error(`❌ Error al actualizar detalles médicos:`, err);
      return { success: false, data: null, error: err.message || "Error al actualizar detalles médicos" };
    }

    console.log(`✅ Detalles médicos actualizados correctamente:`, JSON.stringify(data).substring(0, 200) + "...");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al actualizar detalles médicos", error);
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
    console.log(`📝 Actualizando registro médico con ID: ${id}`);
    console.log(`📊 Datos enviados:`, JSON.stringify(data).substring(0, 500) + "...");

    const [response, err] = await http.patch<MedicalRecordResponse>(`${API_ENDPOINT}/${id}`, data);

    if (err !== null) {
      console.error(`❌ Error al actualizar registro médico:`, err);
      return { success: false, data: null, error: err.message || "Error al actualizar registro médico" };
    }

    console.log(`✅ Registro médico actualizado correctamente:`, JSON.stringify(response).substring(0, 200) + "...");
    return { success: true, data: response };
  } catch (error) {
    console.error("❌ Error al actualizar registro médico", error);
    return { success: false, data: null, error: "Error al actualizar registro médico" };
  }
}

/**
 * Elimina un registro médico
 */
export async function deleteMedicalRecord(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🗑️ Eliminando registro médico con ID: ${id}`);

    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);

    if (err !== null) {
      console.error(`❌ Error al eliminar registro médico:`, err);
      return { success: false, error: err.message || "Error al eliminar registro médico" };
    }

    console.log(`✅ Registro médico eliminado correctamente`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al eliminar registro médico", error);
    return { success: false, error: "Error al eliminar registro médico" };
  }
}

/**
 * Obtiene todos los diagnósticos de un registro médico
 */
export async function getDiagnostics(id: string): Promise<{ data: any[]; success: boolean; error?: string }> {
  try {
    console.log(`🔍 Obteniendo diagnósticos del registro médico con ID: ${id}`);

    // Endpoint correcto según diagnostics.controller.ts
    const endpoint = `/diagnostics/medical-records/${id}/diagnostics`;
    console.log(`🔍 Usando endpoint: ${process.env.BACKEND_URL}${endpoint}`);

    const [data, err] = await http.get<any[]>(endpoint);

    if (err !== null) {
      console.error(`❌ Error al obtener diagnósticos:`, err);
      return { success: false, data: [], error: err.message || "Error al obtener diagnósticos" };
    }

    console.log(`✅ Diagnósticos obtenidos correctamente:`, JSON.stringify(data).substring(0, 200) + "...");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al obtener diagnósticos", error);
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
    console.log(`➕ Agregando diagnóstico al registro médico con ID: ${id}`);
    console.log(`📊 Datos enviados:`, JSON.stringify(diagnostic));

    // Endpoint correcto según diagnostics.controller.ts
    const endpoint = `/diagnostics/medical-records/${id}/diagnostics`;
    console.log(`🔍 Usando endpoint: ${process.env.BACKEND_URL}${endpoint}`);

    const [data, err] = await http.post<any>(endpoint, diagnostic);

    if (err !== null) {
      console.error(`❌ Error al agregar diagnóstico:`, err);
      return { success: false, data: null, error: err.message || "Error al agregar diagnóstico" };
    }

    console.log(`✅ Diagnóstico agregado correctamente:`, JSON.stringify(data).substring(0, 200) + "...");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al agregar diagnóstico", error);
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
    console.log(`🗑️ Eliminando diagnóstico ${diagnosticId} del registro médico con ID: ${id}`);

    // Endpoint correcto según diagnostics.controller.ts
    const endpoint = `/diagnostics/medical-records/${id}/diagnostics/${diagnosticId}`;
    console.log(`🔍 Usando endpoint: ${process.env.BACKEND_URL}${endpoint}`);

    const [_, err] = await http.delete(endpoint);

    if (err !== null) {
      // Verificar si es un 404, lo que podría significar que no está implementado
      if (err.statusCode === 404) {
        console.error(`❌ Error 404: El endpoint para eliminar diagnósticos no está implementado en el servidor.`);
        console.error(`❌ IMPORTANTE: Debe implementar la ruta DELETE ${endpoint} en el servidor.`);
        return {
          success: false,
          error: `El endpoint para eliminar diagnósticos no está implementado (404). Contacte al administrador del sistema.`,
        };
      }

      console.error(`❌ Error al eliminar diagnóstico:`, err);
      return { success: false, error: err.message || "Error al eliminar diagnóstico" };
    }

    console.log(`✅ Diagnóstico eliminado correctamente`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al eliminar diagnóstico", error);
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
    console.log(`🔍 Obteniendo todas las categorías médicas y sus condiciones`);

    const [data, err] = await http.get<any>(`${API_ENDPOINT}/categories/all`);

    if (err !== null) {
      console.error(`❌ Error al obtener categorías médicas:`, err);
      return { success: false, data: null, error: err.message || "Error al obtener categorías médicas" };
    }

    console.log(`✅ Categorías médicas obtenidas correctamente:`, JSON.stringify(data).substring(0, 200) + "...");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al obtener categorías médicas", error);
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
    console.log(`➕ Agregando múltiples diagnósticos al registro médico con ID: ${id}`);
    console.log(`📊 Cantidad de diagnósticos: ${diagnostics.length}`);

    // Log exact endpoint we're calling
    const endpoint = `/diagnostics/medical-records/${id}/bulk-diagnostics`;
    console.log(`🔍 Endpoint completo: ${process.env.BACKEND_URL}${endpoint}`);

    // Realizar una copia profunda y asegurar la estructura correcta
    const normalizedDiagnostics = diagnostics.map((diagnostic, index) => {
      console.log(`🔍 Verificando estructura de diagnóstico #${index + 1}:`);

      // Determinar si estamos usando diagnosticId o diagnosticValueId
      const useDiagnosticId = !!diagnostic.diagnosticId;
      const useDiagnosticValueId = !!diagnostic.diagnosticValueId;

      console.log(`   - Usando diagnosticId: ${useDiagnosticId}`);
      console.log(`   - Usando diagnosticValueId: ${useDiagnosticValueId}`);
      console.log(`   - Tipo de values:`, typeof diagnostic.values);
      console.log(`   - ¿Values es array?:`, Array.isArray(diagnostic.values));

      if (Array.isArray(diagnostic.values)) {
        // Verificar que todos los elementos sean strings
        const allStrings = diagnostic.values.every((v) => typeof v === "string");
        console.log(`   - ¿Todos los valores son strings?:`, allStrings);

        if (!allStrings) {
          console.log(
            `   - Valores que no son strings:`,
            diagnostic.values.filter((v) => typeof v !== "string")
          );
        }
      }

      // Asegurar que values sea un array de strings
      const normalizedValues = Array.isArray(diagnostic.values)
        ? diagnostic.values.map((v) => String(v))
        : [String(diagnostic.values || "")];

      // Normalizar la estructura según si usamos diagnosticId o diagnosticValueId
      if (useDiagnosticId) {
        return {
          diagnosticId: diagnostic.diagnosticId,
          values: normalizedValues,
          isReportIncluded: diagnostic.isReportIncluded !== undefined ? diagnostic.isReportIncluded : true,
        };
      } else if (useDiagnosticValueId) {
        return {
          diagnosticValueId: diagnostic.diagnosticValueId,
          values: normalizedValues,
        };
      } else {
        console.error(`❌ Diagnóstico #${index + 1} no tiene ni diagnosticId ni diagnosticValueId`);
        // Devolver un objeto mínimo para evitar errores, aunque este será filtrado después
        return { values: [] };
      }
    });

    // Filtrar diagnósticos inválidos (sin ID)
    const validDiagnostics = normalizedDiagnostics.filter((d) => d.diagnosticId || d.diagnosticValueId);

    // Format payload according to the CreateMultipleDiagnosticsDto
    const payload: any = { diagnostics: validDiagnostics };
    console.log(`📤 Payload exacto a enviar (después de normalizar):`, JSON.stringify(payload));

    // Realizar la llamada a la API con manejo de errores mejorado
    console.log(`📡 Enviando petición POST a: ${endpoint}`);
    const [data, err] = await http.post<any>(endpoint, payload);

    if (err !== null) {
      console.error(`❌ Error al agregar múltiples diagnósticos:`, err);
      console.error(`❌ Código de error:`, err.statusCode);
      console.error(`❌ Mensaje de error:`, err.message);
      console.error(`❌ Detalles completos del error:`, JSON.stringify(err));

      return {
        success: false,
        data: null,
        error: err.message || "Error al agregar múltiples diagnósticos",
      };
    }

    console.log(`✅ Diagnósticos agregados correctamente:`, JSON.stringify(data).substring(0, 200) + "...");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al agregar múltiples diagnósticos", error);
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : "No stack trace disponible");
    return {
      success: false,
      data: null,
      error: "Error al agregar múltiples diagnósticos",
    };
  }
}
