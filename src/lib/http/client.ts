// NOTA: No importamos cookies directamente aquí para evitar errores en cliente
// import { cookies } from "next/headers"; <- ESTO CAUSARÍA ERROR EN CLIENTE

import { isTokenExpiredError, refreshAccessToken } from "./token-service";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipRefreshToken?: boolean; // Opción para evitar intentos de refresh en ciertas solicitudes
}

/**
 * Cliente HTTP unificado para cliente y servidor.
 *
 * NOTA IMPORTANTE SOBRE COOKIES Y AUTENTICACIÓN:
 * - Si se ejecuta desde el cliente: Maneja automáticamente refresh token para errores 401
 * - Si se ejecuta desde el servidor: Pasa cookies al backend, pero NO puede hacer refresh token
 *
 * Para operaciones de autenticación directa (login, logout, refresh) se debe usar fetch directo
 * desde el cliente, NO este cliente HTTP.
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

  // Si estamos en el servidor, intentar obtener las cookies y pasarlas manualmente
  if (isServer) {
    try {
      // Importamos cookies() dinámicamente solo en el servidor
      // Esto evita errores en el cliente
      const { cookies } = await import("next/headers");

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
    // Realizar la petición
    const response = await fetch(fullUrl.toString(), requestConfig);

    // Verificar si hay error de token y manejarlo
    if (!response.ok && isTokenExpiredError(response.status) && !skipRefreshToken && !isServer) {
      console.log("🔑 Token expirado detectado, intentando refresh...");

      // IMPORTANTE: El refresh token DEBE ejecutarse en el cliente
      // para que las cookies se establezcan en el navegador
      if (typeof window === "undefined") {
        console.error("❌ No se puede hacer refresh en el servidor");
        throw new Error("No se puede renovar sesión desde el servidor");
      }

      // Intentar hacer refresh del token (sólo en el cliente)
      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        console.log("🔄 Refresh exitoso, reintentando petición original");
        // Reintentar la petición original
        const retryResponse = await fetch(fullUrl.toString(), requestConfig);

        if (!retryResponse.ok) {
          throw new Error(`Error HTTP ${retryResponse.status} después de refresh`);
        }

        return await retryResponse.json();
      } else {
        console.error("❌ Refresh token falló, no se puede continuar");
        throw new Error("No se pudo renovar la sesión");
      }
    }

    // Si la respuesta no es OK y no es un problema de token, o no se pudo resolver con refresh
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    // Procesar respuesta exitosa
    return await response.json();
  } catch (error) {
    console.error("❌ Error en petición HTTP:", error);
    throw error;
  }
}
