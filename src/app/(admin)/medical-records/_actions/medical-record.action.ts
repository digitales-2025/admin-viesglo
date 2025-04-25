"use server";

import { cookies } from "next/headers";

import { http } from "@/lib/http/serverFetch";
import {
  MedicalRecordCreate,
  MedicalRecordFileInfo,
  MedicalRecordResponse,
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
  medicalRecord: MedicalRecordCreate
): Promise<{ data: MedicalRecordResponse | null; success: boolean; error?: string }> {
  try {
    // Crear un FormData para enviar los archivos
    const formData = new FormData();

    // Agregar los campos básicos
    formData.append("ruc", medicalRecord.ruc);
    formData.append("firstName", medicalRecord.firstName);
    formData.append("firstLastName", medicalRecord.firstLastName);
    formData.append("examType", medicalRecord.examType);
    formData.append("aptitude", medicalRecord.aptitude);

    // Agregar campos opcionales si existen
    if (medicalRecord.dni) {
      formData.append("dni", medicalRecord.dni);
    }

    if (medicalRecord.secondName) {
      formData.append("secondName", medicalRecord.secondName);
    }

    if (medicalRecord.secondLastName) {
      formData.append("secondLastName", medicalRecord.secondLastName);
    }

    if (medicalRecord.restrictions) {
      formData.append("restrictions", medicalRecord.restrictions);
    }

    // Agregar archivos si existen
    if (medicalRecord.aptitudeCertificate) {
      formData.append("aptitudeCertificate", medicalRecord.aptitudeCertificate);
    }

    if (medicalRecord.medicalReport) {
      formData.append("medicalReport", medicalRecord.medicalReport);
    }

    const [data, err] = await http.post<MedicalRecordResponse>(API_ENDPOINT, formData, {
      headers: {
        // No establecer Content-Type, el navegador lo establecerá automáticamente con el boundary correcto
      },
    });

    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear registro médico" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear registro médico", error);
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

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    console.log("🍪 Token disponible:", accessToken ? "Sí" : "No");

    // Corregir URL eliminando la duplicación de /api/v1/
    const url = `${process.env.BACKEND_URL}/medical-records/${id}/aptitude-certificate`;
    console.log("🔗 URL de descarga:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      credentials: "include", // Importante para que se envíen las cookies
    });

    console.log("📡 Respuesta:", response.status, response.statusText);

    if (!response.ok) {
      console.warn(`Error al descargar certificado: ${response.status} ${response.statusText}`);
      return {
        success: false,
        data: null,
        filename: null,
        error: `Error al descargar documento (${response.status})`,
      };
    }

    // Verificar que la respuesta no esté vacía
    const contentLength = response.headers.get("content-length");
    console.log("📊 Tamaño de respuesta:", contentLength || "desconocido");

    if (contentLength && parseInt(contentLength) === 0) {
      console.warn("Respuesta vacía del servidor");
      return {
        success: false,
        data: null,
        filename: null,
        error: "El documento está vacío o no disponible",
      };
    }

    const blob = await response.blob();
    console.log("📄 Blob recibido:", blob.size, "bytes, tipo:", blob.type);

    // Intentar obtener el nombre del archivo del encabezado Content-Disposition
    let filename = "aptitude-certificate.pdf";
    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    return { success: true, data: blob, filename };
  } catch (error) {
    console.warn("Error al descargar el certificado", error);
    return { success: false, data: null, filename: null, error: "Error al descargar documento" };
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

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    console.log("🍪 Token disponible:", accessToken ? "Sí" : "No");

    // Corregir URL eliminando la duplicación de /api/v1/
    const url = `${process.env.BACKEND_URL}/medical-records/${id}/medical-report`;
    console.log("🔗 URL de descarga:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      credentials: "include", // Importante para que se envíen las cookies
    });

    console.log("📡 Respuesta:", response.status, response.statusText);

    if (!response.ok) {
      console.warn(`Error al descargar informe: ${response.status} ${response.statusText}`);
      return {
        success: false,
        data: null,
        filename: null,
        error: `Error al descargar documento (${response.status})`,
      };
    }

    // Verificar que la respuesta no esté vacía
    const contentLength = response.headers.get("content-length");
    console.log("📊 Tamaño de respuesta:", contentLength || "desconocido");

    if (contentLength && parseInt(contentLength) === 0) {
      console.warn("Respuesta vacía del servidor");
      return {
        success: false,
        data: null,
        filename: null,
        error: "El documento está vacío o no disponible",
      };
    }

    const blob = await response.blob();
    console.log("📄 Blob recibido:", blob.size, "bytes, tipo:", blob.type);

    // Intentar obtener el nombre del archivo del encabezado Content-Disposition
    let filename = "medical-report.pdf";
    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    return { success: true, data: blob, filename };
  } catch (error) {
    console.warn("Error al descargar el informe", error);
    return { success: false, data: null, filename: null, error: "Error al descargar documento" };
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
