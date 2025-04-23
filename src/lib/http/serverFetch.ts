import { cookies } from "next/headers";

import { Result } from "./result";

// Configuración extendida para las peticiones
interface ServerFetchConfig extends RequestInit {
  body?: BodyInit | FormData;
  contentType?: string;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Información acerca del error en la petición al backend
 */
type ServerFetchError = {
  statusCode: number;
  message: string;
  error: string;
};

/**
 * Realiza una petición al backend y devuelve un Result.
 *
 * Un Result es una tupla que contiene uno de dos casos:
 * - Si la petición es exitosa (codigo 2xx) la tupla contiene `[datos, null]`
 * - Si la petición falla la tupla contiene `[null, ServerFetchError]`
 *
 * `ServerFetchError` es un objeto que contiene {statusCode, message, error}
 *
 * @example
 * ```ts
 * const [user, err] = await serverFetch<User>("/users/123")
 * if (err !== null) {
 *     // Manejar error
 *     return not_found();
 * }
 * // Utilizar `user`
 * return <p>Hola {user.name}</p>
 * ```
 *
 * IMPORTANTE: Si la API no responde, o hubo algun otro error, esta funcion devuelve `{statusCode: 503}`
 *
 * IMPORTANTE: Esta funcion no refresca cookies de sesion. Esta función asume
 * que la cookie `access_token` existe y es válida. El refresco de
 * tokens se realiza en el middleware.
 *
 * @type Success El tipo de dato que el API devuelve
 * @param url La URL a hacer la petición
 * @param options Opciones enviadas a fetch
 * @returns Una tupla con los datos, o un error
 *
 */
export async function serverFetch<Success>(
  url: string,
  options?: RequestInit
): Promise<Result<Success, ServerFetchError>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Si no hay refreshToken, no podemos autenticar la solicitud
  if (!refreshToken) {
    if (process.env.NODE_ENV === "development") {
      console.error("\tSERVER FETCH: No hay refresh_token disponible para la solicitud");
    }
    return [
      // @ts-expect-error allowing null
      null,
      {
        statusCode: 401,
        message: "No autenticado",
        error: "Token de autenticación no disponible",
      },
    ];
  }

  try {
    // Configuramos los cookies para la solicitud
    let cookieHeader = `refresh_token=${refreshToken}`;
    if (accessToken) {
      cookieHeader += `; access_token=${accessToken}`;
    }

    const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        Cookie: cookieHeader,
      },
      credentials: "include", // Importante para que el navegador incluya las cookies en la solicitud
    });

    // Si recibimos cookies de Set-Cookie, las guardamos para actualizar el access_token
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // Extraer y guardar el nuevo access_token si está presente
      const accessTokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
      if (accessTokenMatch && accessTokenMatch[1]) {
        cookieStore.set("access_token", accessTokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }
    }

    if (!response.ok) {
      const data = (await response.json()) as Partial<ServerFetchError>;
      return [
        // @ts-expect-error allowing null
        null,
        {
          statusCode: response.status,
          message: data.message ?? "API no disponible",
          error: data.error ?? "Error desconocido",
        },
      ];
    }

    const data = await response.json();
    return [data, null];
  } catch (error) {
    console.error(error);
    return [
      // @ts-expect-error allowing null
      null,
      {
        statusCode: 503,
        message: "Error interno",
        error: "Error interno",
      },
    ];
  }
}

// Función para procesar respuestas con headers y datos binarios
async function processResponse<T>(response: Response): Promise<[T | null, ServerFetchError | null, Response | null]> {
  if (!response.ok) {
    try {
      const data = (await response.json()) as Partial<ServerFetchError>;
      return [
        null,
        {
          statusCode: response.status,
          message: data.message ?? "API no disponible",
          error: data.error ?? "Error desconocido",
        },
        null,
      ];
    } catch (error) {
      console.log("X ~ Error al procesar la respuesta", error);
      return [
        null,
        {
          statusCode: response.status,
          message: "Error en la respuesta",
          error: "No se pudo procesar la respuesta",
        },
        null,
      ];
    }
  }

  // Para respuestas binarias o descargas, devolvemos la respuesta completa
  if (
    response.headers.get("Content-Type")?.includes("application/octet-stream") ||
    response.headers.get("Content-Disposition")?.includes("attachment") ||
    response.headers.get("Content-Disposition")?.includes("inline")
  ) {
    return [null, null, response];
  }

  try {
    const data = await response.json();
    return [data as T, null, null];
  } catch (error) {
    console.log("X ~ Error al procesar la respuesta", error);
    // Si la respuesta no es JSON, devolvemos la respuesta completa
    return [null, null, response];
  }
}

// Función para realizar peticiones y obtener también la respuesta
export async function serverFetchWithResponse<T>(
  url: string,
  options?: RequestInit
): Promise<[T | null, ServerFetchError | null, Response | null]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Si no hay refreshToken, no podemos autenticar la solicitud
  if (!refreshToken) {
    if (process.env.NODE_ENV === "development") {
      console.error("\tSERVER FETCH: No hay refresh_token disponible para la solicitud");
    }
    return [
      null,
      {
        statusCode: 401,
        message: "No autenticado",
        error: "Token de autenticación no disponible",
      },
      null,
    ];
  }

  try {
    // Configuramos los cookies para la solicitud
    let cookieHeader = `refresh_token=${refreshToken}`;
    if (accessToken) {
      cookieHeader += `; access_token=${accessToken}`;
    }

    const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        Cookie: cookieHeader,
      },
      credentials: "include", // Importante para que el navegador incluya las cookies en la solicitud
    });

    // Si recibimos cookies de Set-Cookie, las guardamos para actualizar el access_token
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // Extraer y guardar el nuevo access_token si está presente
      const accessTokenMatch = setCookieHeader.match(/access_token=([^;]+)/);
      if (accessTokenMatch && accessTokenMatch[1]) {
        cookieStore.set("access_token", accessTokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }
    }

    return processResponse<T>(response);
  } catch (error) {
    console.error(error);
    return [
      null,
      {
        statusCode: 503,
        message: "Error interno",
        error: "Error interno",
      },
      null,
    ];
  }
}

/**
 * Objeto que proporciona métodos para realizar peticiones HTTP
 */
export const http = {
  /**
   * Realiza una petición GET
   * @param url - La URL a la que se realizará la petición
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [data, err] = await http.get<User>("/users/");
   * ```
   */
  get<T>(url: string, config?: RequestInit) {
    return serverFetch<T>(url, config);
  },

  /**
   * Realiza una petición POST
   * @param url - La URL a la que se realizará la petición
   * @param body - El cuerpo de la petición, puede ser un objeto o BodyInit
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [newUser, err] = await http.post<User>("/users", { name: "Linus" });
   * ```
   */
  post<T>(url: string, body?: BodyInit | object, config?: RequestInit) {
    return serverFetch<T>(url, {
      ...config,
      method: "POST",
      body: processBody(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Realiza una petición PUT
   * @param url - La URL a la que se realizará la petición
   * @param body - El cuerpo de la petición, puede ser un objeto o BodyInit
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [updatedUser, err] = await http.put<User>("/users/1f0c-3fca" { name: "Torvalds" });
   * ```
   */
  put<T>(url: string, body?: BodyInit | object, config?: RequestInit) {
    return serverFetch<T>(url, {
      ...config,
      method: "PUT",
      body: processBody(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Realiza una petición DELETE
   * @param url - La URL a la que se realizará la petición
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [result, err] = await http.delete<void>("/users/1ca0-0aa3");
   * ```
   */
  delete<T>(url: string, body?: BodyInit | object, config?: ServerFetchConfig) {
    return serverFetch<T>(url, {
      ...config,
      method: "DELETE",
      body: processBody(body),

      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Realiza una petición PATCH
   * @param url - La URL a la que se realizará la petición
   * @param body - El cuerpo de la petición, puede ser un objeto o BodyInit
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [patchedUser, err] = await http.patch<User>("/users/1010-1a0b", { name: "Linux" });
   * ```
   */
  patch<T>(url: string, body?: BodyInit | object, config?: Omit<ServerFetchConfig, "body">) {
    return serverFetch<T>(url, {
      ...config,
      method: "PATCH",
      body: processBody(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Realiza una petición POST para enviar un multipart/form-data
   * @param url - La URL a la que se realizará la petición
   * @param body - El cuerpo de la petición, debe ser un FormData
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [newUser, err] = await http.multipartPost<User>("/users", formData);
   * ```
   */
  multipartPost<T>(url: string, body?: FormData, config?: RequestInit) {
    return serverFetch<T>(url, {
      ...config,
      method: "POST",
      body: body,
      headers: {
        // No establecer Content-Type para multipart/form-data
        ...config?.headers,
      },
    });
  },

  /**
   * Realiza una petición PUT multipart/form-data
   * @param url - La URL a la que se realizará la petición
   * @param body - El cuerpo de la petición, debe ser un FormData
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos de tipo T, o un error
   * @example
   * ```ts
   * const [updatedUser, err] = await http.multipartPut<User>("/users/1", formData);
   * ```
   */
  multipartPut<T>(url: string, body?: FormData, config?: RequestInit) {
    return serverFetch<T>(url, {
      ...config,
      method: "PUT",
      body: body,
      headers: {
        // No establecer Content-Type para multipart/form-data
        ...config?.headers,
      },
    });
  },

  multipartPatch<T>(url: string, body?: FormData, config?: RequestInit) {
    return serverFetch<T>(url, {
      ...config,
      method: "PATCH",
      body: body,
      headers: {
        // No establecer Content-Type para multipart/form-data
        ...config?.headers,
      },
    });
  },

  /**
   * Realiza una petición GET obteniendo la respuesta completa con headers
   * Útil para descargas de archivos y peticiones que requieren acceso a headers
   * @param url - La URL a la que se realizará la petición
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa que resuelve con los datos, error, y la respuesta completa
   * @example
   * ```ts
   * const [data, err, response] = await http.getWithResponse<User>("/users/");
   * if (response) {
   *   // Acceder a headers o blob para descargas
   *   const contentType = response.headers.get('content-type');
   * }
   * ```
   */
  getWithResponse<T>(url: string, config?: RequestInit) {
    return serverFetchWithResponse<T>(url, config);
  },

  /**
   * Realiza una petición GET especialmente para descargas de archivos
   * @param url - La URL a la que se realizará la petición
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa con la respuesta para descarga o error
   * @example
   * ```ts
   * const [_, err, response] = await http.downloadFile("/files/document.pdf");
   * if (response) {
   *   const blob = await response.blob();
   *   // Procesar la descarga
   * }
   * ```
   */
  downloadFile<T>(url: string, config?: RequestInit) {
    return serverFetchWithResponse<T>(url, {
      ...config,
      headers: {
        ...config?.headers,
        Accept: "application/octet-stream",
      },
    });
  },

  /**
   * Realiza una petición GET para visualizar archivos como imágenes o PDFs
   * @param url - La URL a la que se realizará la petición
   * @param config - Configuración opcional para la petición fetch
   * @returns Una promesa con la respuesta para visualización o error
   * @example
   * ```ts
   * const [_, err, response] = await http.viewFile("/images/photo.jpg");
   * if (response) {
   *   const blob = await response.blob();
   *   const objectUrl = URL.createObjectURL(blob);
   *   // Usar objectUrl para visualizar
   * }
   * ```
   */
  viewFile<T>(url: string, config?: RequestInit) {
    return serverFetchWithResponse<T>(url, {
      ...config,
      headers: {
        ...config?.headers,
        Accept: "application/pdf,image/*",
      },
    });
  },
};

/**
 * Permite utilizar un objeto plano como body
 */
function processBody(body: BodyInit | object | undefined): BodyInit | undefined {
  if (
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream
  ) {
    return body;
  } else {
    return JSON.stringify(body);
  }
}
