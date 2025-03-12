import { cookies } from "next/headers";

import { isTokenExpiredError, refreshAccessToken } from "./token-service";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipRefreshToken?: boolean; // Opción para evitar intentos de refresh en ciertas solicitudes
}

/**
 * Cliente HTTP unificado para cliente y servidor
 * Maneja automáticamente las cookies en ambos entornos
 */
export async function httpClient<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipRefreshToken = false, ...config } = options;

  // Construir URL preservando la ruta base API
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  let fullUrl: URL;

  if (url.startsWith("http")) {
    // URL absoluta
    fullUrl = new URL(url);
  } else {
    // Para URLs relativas
    const base = new URL(baseUrl);

    // Normalizamos las rutas
    const basePath =
      base.pathname === "/" ? "" : base.pathname.endsWith("/") ? base.pathname.slice(0, -1) : base.pathname;
    const urlPath = url.startsWith("/") ? url : `/${url}`;

    // Combinamos las rutas
    base.pathname = `${basePath}${urlPath}`;

    fullUrl = base;
  }

  // Añadir parámetros de consulta si existen
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  // Determinar si estamos en el servidor o cliente
  const isServer = typeof window === "undefined";

  // Configuración base con credentials:include para asegurar el envío de cookies
  const requestConfig: RequestInit = {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    credentials: "include", // Asegura que todas las peticiones envíen cookies (fundamental)
  };

  // Log para depuración
  console.log(
    `🔄 HTTP ${requestConfig.method || "GET"} a ${fullUrl.toString()} (${isServer ? "servidor" : "cliente"})`
  );

  // Si estamos en el servidor, intentar obtener las cookies y pasarlas manualmente
  if (isServer) {
    try {
      // En algunas versiones de Next.js, cookies() devuelve una Promise
      const cookieStore = await Promise.resolve(cookies());

      // Intentar recuperar las cookies de autenticación
      let cookieHeader = "";

      try {
        const accessToken = cookieStore.get("access_token");
        const refreshToken = cookieStore.get("refresh_token");

        // Construir el header Cookie si tenemos algún token
        if (accessToken || refreshToken) {
          const parts = [];
          if (accessToken) parts.push(`access_token=${accessToken.value}`);
          if (refreshToken) parts.push(`refresh_token=${refreshToken.value}`);
          cookieHeader = parts.join("; ");
        }

        if (cookieHeader) {
          // Crear nuevo objeto headers para no modificar el existente
          const headersObj = new Headers(requestConfig.headers);
          headersObj.append("Cookie", cookieHeader);

          // Convertir a formato regular para Request
          requestConfig.headers = Object.fromEntries(headersObj.entries());
          console.log("🍪 Cookies añadidas a la petición del servidor:", cookieHeader);
        } else {
          console.warn("⚠️ No se encontraron cookies de autenticación");
        }
      } catch (cookieError) {
        console.error("❌ Error al obtener cookies específicas:", cookieError);
      }
    } catch (error) {
      console.error("❌ Error al acceder a cookies():", error);
    }
  }

  try {
    // Realizar la solicitud inicial
    let response = await fetch(fullUrl.toString(), requestConfig);

    // Si el token expiró (401), intentamos refresh solo en el cliente
    if (isTokenExpiredError(response.status) && !skipRefreshToken && !isServer) {
      console.log("🔑 Token expirado, intentando refresh...");

      try {
        // Intentar refrescar el token
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
          console.log("✅ Refresh exitoso, reintentando solicitud original");
          // Reintentar la solicitud original con el nuevo token
          response = await fetch(fullUrl.toString(), requestConfig);
        } else {
          // Si el refresh falla, consideramos que la sesión expiró
          console.error("❌ Refresh falló, la sesión probablemente expiró");

          if (!isServer) {
            // Redirigir a login (solo en el cliente)
            console.log("🔀 Redirigiendo a login...");
            window.location.href = "/sign-in";
          }

          throw new Error("La sesión ha expirado");
        }
      } catch (refreshError) {
        console.error("❌ Error en el proceso de refresh:", refreshError);
        throw refreshError;
      }
    }

    // Si hay error en la respuesta (después del posible refresh)
    if (!response.ok) {
      const status = response.status;
      console.error(`❌ Error HTTP ${status} en ${fullUrl.toString()}`);

      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
        console.error("Detalle del error:", errorData);
      } catch {
        errorData = { message: response.statusText };
      }

      // Crear un error enriquecido
      const error = new Error(errorData.message || "Error en la solicitud");
      (error as any).status = status;
      (error as any).data = errorData;
      throw error;
    }

    // Respuestas vacías (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Respuestas con contenido
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("HTTP Request error:", error);
    throw error;
  }
}
