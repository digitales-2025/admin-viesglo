"use server";

import { http } from "@/lib/http/serverFetch";
import {
  MedicalRecordFileInfo,
  MedicalRecordResponse,
  MedicalRecordUpdate,
  UpdateCustomSections,
  UpdateMedicalRecordDetails,
} from "../_types/medical-record.types";

const API_ENDPOINT = "/medical-records";

/**
 * Obtiene todos los registros médicos
 */
export async function getMedicalRecords(
  clientId?: string
): Promise<{ data: MedicalRecordResponse[]; success: boolean; error?: string }> {
  try {
    const queryParams = clientId ? `?clientId=${clientId}` : "";
    const [data, err] = await http.get<MedicalRecordResponse[]>(`${API_ENDPOINT}${queryParams}`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener registros médicos" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener registros médicos", error);
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

    const [_, err] = await http.post(`${API_ENDPOINT}/${id}/aptitude-certificate`, formData, {
      headers: {
        // No establecer Content-Type, el navegador lo establecerá automáticamente con el boundary correcto
      },
    });

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

    const [_, err] = await http.post(`${API_ENDPOINT}/${id}/medical-report`, formData, {
      headers: {
        // No establecer Content-Type, el navegador lo establecerá automáticamente con el boundary correcto
      },
    });

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
export async function downloadAptitudeCertificate(
  id: string
): Promise<{ data: Blob | null; filename: string | null; success: boolean; error?: string }> {
  try {
    console.log("⬇️ Iniciando descarga de certificado para ID:", id);

    const [result, err] = await http.download(`/medical-records/${id}/aptitude-certificate`);

    if (err !== null || result === null) {
      console.warn(`❌ Error al descargar certificado:`, err);
      return {
        success: false,
        data: null,
        filename: null,
        error: err?.message || `Error al descargar documento`,
      };
    }

    console.log("✅ Certificado descargado correctamente:", result.filename);
    return {
      success: true,
      data: result.blob,
      filename: result.filename,
    };
  } catch (error) {
    console.warn("❌ Error inesperado al descargar el certificado", error);
    return {
      success: false,
      data: null,
      filename: null,
      error: "Error al descargar documento",
    };
  }
}

/**
 * Descarga el informe médico
 */
export async function downloadMedicalReport(
  id: string
): Promise<{ data: Blob | null; filename: string | null; success: boolean; error?: string }> {
  try {
    console.log("⬇️ Iniciando descarga de informe para ID:", id);

    const [result, err] = await http.download(`/medical-records/${id}/medical-report`);

    if (err !== null || result === null) {
      console.warn(`❌ Error al descargar informe:`, err);
      return {
        success: false,
        data: null,
        filename: null,
        error: err?.message || `Error al descargar documento`,
      };
    }

    console.log("✅ Informe médico descargado correctamente:", result.filename);
    return {
      success: true,
      data: result.blob,
      filename: result.filename,
    };
  } catch (error) {
    console.warn("❌ Error inesperado al descargar el informe", error);
    return {
      success: false,
      data: null,
      filename: null,
      error: "Error al descargar documento",
    };
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
 * Actualiza las secciones personalizadas de un registro médico
 */
export async function updateCustomSections(
  id: string,
  customSections: UpdateCustomSections
): Promise<{ data: MedicalRecordResponse | null; success: boolean; error?: string }> {
  try {
    console.log(`🔄 Actualizando secciones personalizadas para el registro médico con ID: ${id}`);
    console.log(`📊 Datos enviados:`, JSON.stringify(customSections).substring(0, 500) + "...");

    const [data, err] = await http.patch<MedicalRecordResponse>(
      `${API_ENDPOINT}/${id}/custom-sections`,
      customSections
    );

    if (err !== null) {
      console.error(`❌ Error al actualizar secciones personalizadas:`, err);
      return { success: false, data: null, error: err.message || "Error al actualizar secciones personalizadas" };
    }

    console.log(
      `✅ Secciones personalizadas actualizadas correctamente:`,
      JSON.stringify(data).substring(0, 200) + "..."
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error al actualizar secciones personalizadas", error);
    return { success: false, data: null, error: "Error al actualizar secciones personalizadas" };
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
