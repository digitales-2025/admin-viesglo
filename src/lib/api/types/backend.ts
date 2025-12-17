import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { paths } from "./api";

// This is the result of the last optimized error management defined in the backend
export type FetchErrorResponse = {
  statusCode: number;
  message: string;
  error: unknown;
  id?: string;
  category?: string;
  severity?: string;
  timestamp?: string;
  path?: string;
  method?: string;
};

export type FetchError = typeof Error & FetchErrorResponse;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is not set");
}

const backendUrl = (baseUrl: string, version?: string) => {
  return version ? `${baseUrl}/${version}` : baseUrl;
};

/**
 * Custom fetch implementation that includes credentials and handles errors
 */
const enhancedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      credentials: "include",
    });
  } catch (e) {
    throw e;
    // throw {
    //     statusCode: 503,
    //     message: 'Servidor no disponible',
    //     error: e,
    // };
  }

  // if (!response.ok) {
  //     // const text = await response.text();

  //     // let parsedError;

  //     // // Try to parse as JSON, but fall back to plain text if it fails
  //     // try {
  //     //     parsedError = JSON.parse(text);

  //     //     // Check if it's the backend error format
  //     //     if (parsedError.success === false && parsedError.error) {
  //     //         const backendError = parsedError.error;
  //     //         throw {
  //     //             statusCode: backendError.statusCode || response.status,
  //     //             message: backendError.message || response.statusText,
  //     //             error: backendError,
  //     //             id: backendError.id,
  //     //             category: backendError.category,
  //     //             severity: backendError.severity,
  //     //             timestamp: backendError.timestamp,
  //     //             path: backendError.path,
  //     //             method: backendError.method,
  //     //         } as FetchError;
  //     //     }
  //     // } catch {
  //     //     // Not JSON, use the raw text
  //     //     parsedError = { rawText: text };
  //     // }

  //     // throw {
  //     //     statusCode: response.status,
  //     //     message: response.statusText,
  //     //     error: parsedError,
  //     // } as FetchError;

  //     throw response;
  // }

  return response;
};

/**
 * Client for connecting with the backend
 */
export const fetchClient = createFetchClient<paths>({
  baseUrl: backendUrl(BACKEND_URL),
  fetch: enhancedFetch,
});

export const backend = createClient(fetchClient);

/**
 * Función para descargar archivos del backend
 * Maneja errores de manera consistente con el resto del sistema
 */
export const downloadFile = async (
  endpoint: string,
  params?: Record<string, string>,
  filename?: string
): Promise<Blob> => {
  const url = new URL(endpoint, BACKEND_URL);

  // Agregar parámetros de consulta si existen
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  const response = await enhancedFetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    // Manejar errores de manera consistente con el sistema
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorData = await response.json();
      // Crear un objeto que simule la estructura BaseErrorResponse
      const error = {
        error: {
          userMessage: errorData.error?.userMessage || "Error al descargar el archivo",
        },
      };
      throw error;
    } else {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
  }

  const blob = await response.blob();

  // Si se proporciona un filename, manejar la descarga automáticamente
  if (filename) {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }

  return blob;
};
