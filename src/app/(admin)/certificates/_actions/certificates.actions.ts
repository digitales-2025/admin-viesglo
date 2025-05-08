"use server";

import { http } from "@/lib/http/serverFetch";
import { CertificateResponse, CertificatesFilters, PaginatedCertificatesResponse } from "../_types/certificates.types";

const API_ENDPOINT = "/certificate";

/**
 * Obtiene todos los certificados
 */
export async function getCertificates(
  filters?: CertificatesFilters
): Promise<{ data: CertificateResponse[]; success: boolean; error?: string }> {
  try {
    // Construir los parámetros de consulta a partir de los filtros
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar arrays - agregar múltiples parámetros con el mismo nombre
          if (Array.isArray(value)) {
            // Si es un array vacío, no agregar el parámetro
            if (value.length > 0) {
              value.forEach((item) => {
                queryParams.append(key, String(item));
              });
            }
          } else {
            // Para booleanos, asegurarse de que se convierten correctamente a string
            const paramValue = typeof value === "boolean" ? String(value) : String(value);
            queryParams.append(key, paramValue);
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINT}/${queryString ? `?${queryString}` : ""}`;
    const [data, err] = await http.get<CertificateResponse[]>(url);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener certificados" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificados", error);
    return { success: false, data: [], error: "Error al obtener certificados" };
  }
}

/**
 * Obtiene un certificado por su ID
 */
export async function getCertificate(
  id: string
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<CertificateResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener certificado" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificado", error);
    return { success: false, data: null, error: "Error al obtener certificado" };
  }
}

/**
 * Crea un nuevo certificado
 */
export async function createCertificate(
  formData: FormData
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.multipartPost<CertificateResponse>(API_ENDPOINT, formData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear certificado" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear certificado", error);
    return { success: false, data: null, error: "Error al crear certificado" };
  }
}

/**
 * Actualiza un certificado existente
 */
export async function updateCertificate(
  id: string,
  formData: FormData
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.multipartPut<CertificateResponse>(`${API_ENDPOINT}/${id}`, formData);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar certificado" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar certificado", error);
    return { success: false, data: null, error: "Error al actualizar certificado" };
  }
}

/**
 * Elimina un certificado existente
 */
export async function deleteCertificate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar certificado" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar certificado", error);
    return { success: false, error: "Error al eliminar certificado" };
  }
}

/**
 * Obtiene un certificado por su código
 */
export async function getCertificateByCode(
  code: string
): Promise<{ data: CertificateResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<CertificateResponse>(`${API_ENDPOINT}/code/${code}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener certificado por código" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener certificado por código", error);
    return { success: false, data: null, error: "Error al obtener certificado por código" };
  }
}

/**
 * Obtiene los certificados paginados
 */
export async function getCertificatesPaginated(filters?: CertificatesFilters): Promise<{
  data: CertificateResponse[];
  meta?: PaginatedCertificatesResponse["meta"];
  success: boolean;
  error?: string;
}> {
  try {
    // Construir los parámetros de consulta a partir de los filtros
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar arrays - agregar múltiples parámetros con el mismo nombre
          if (Array.isArray(value)) {
            // Si es un array vacío, no agregar el parámetro
            if (value.length > 0) {
              value.forEach((item) => {
                queryParams.append(key, String(item));
              });
            }
          } else {
            // Para booleanos, asegurarse de que se convierten correctamente a string
            const paramValue = typeof value === "boolean" ? String(value) : String(value);
            queryParams.append(key, paramValue);
          }
        }
      });
    }

    // Si no hay filtros específicos, usar los valores predeterminados
    if (!queryParams.has("page")) queryParams.append("page", "1");
    if (!queryParams.has("limit")) queryParams.append("limit", "10");

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINT}/paginated${queryString ? `?${queryString}` : ""}`;

    const [response, err] = await http.get<PaginatedCertificatesResponse>(url);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener los certificados" };
    }

    return {
      success: true,
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error al obtener los certificados", error);
    return { success: false, data: [], error: "Error al obtener los certificados" };
  }
}
