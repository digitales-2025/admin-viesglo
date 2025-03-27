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

  /* if (process.env.NODE_ENV === "development") {
    console.log("\tSERVER FETCH: server fetch hit w cookie:");
    console.log("\tSERVER FETCH:", accessToken ?? "---");
  } */

  if (!accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.error("\tSERVER FETCH: Intentando user serverFetch sin una cookie `access_token valida`");
    }
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        Cookie: `access_token=${accessToken}`,
      },
    });

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
