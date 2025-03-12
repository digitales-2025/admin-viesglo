import { cookies } from "next/headers";

import { isTokenExpiredError, refreshAccessToken, waitForTokenRefresh } from "./token-service";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipRefreshToken?: boolean; // Opción para evitar intentos de refresh en ciertas solicitudes
}

/**
 * Cliente HTTP unificado para cliente y servidor
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
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  // Si hay un refresh en progreso, esperar a que termine
  if (typeof window !== "undefined") {
    // Solo esperar tokens en el cliente
    await waitForTokenRefresh();
  }

  // Configuración base
  const requestConfig: RequestInit = {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    credentials: "include", // Para cookies HttpOnly
  };

  // Si estamos en el servidor, intentamos obtener y adjuntar las cookies
  if (typeof window === "undefined") {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("access_token");
      const refreshToken = cookieStore.get("refresh_token");

      if (accessToken || refreshToken) {
        // Necesitamos crear un nuevo objeto de headers para no modificar el anterior
        const newHeaders = new Headers(requestConfig.headers);

        // Construir el header Cookie
        const cookieHeader = [];
        if (accessToken) cookieHeader.push(`access_token=${accessToken.value}`);
        if (refreshToken) cookieHeader.push(`refresh_token=${refreshToken.value}`);

        if (cookieHeader.length > 0) {
          newHeaders.append("Cookie", cookieHeader.join("; "));
        }

        // Reemplazar los headers en la configuración
        requestConfig.headers = Object.fromEntries(newHeaders.entries());
      }
    } catch (error) {
      console.warn("No se pudieron obtener cookies del servidor:", error);
      // Continuar sin cookies en el header
    }
  }

  try {
    // Realizar la solicitud
    let response = await fetch(fullUrl.toString(), requestConfig);

    // Si el token expiró (401) y no estamos en una solicitud de refresh token
    // y estamos en el cliente (el refresh solo funciona bien en el cliente)
    if (isTokenExpiredError(response.status) && !skipRefreshToken && typeof window !== "undefined") {
      // Intentar refrescar el token
      const refreshSuccess = await refreshAccessToken();
      if (refreshSuccess) {
        // Reintentar la solicitud original con el nuevo token
        response = await fetch(fullUrl.toString(), requestConfig);
      } else {
        // Redirigir a login si el refresh falló (solo en navegador)
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in"; // Corregido a la ruta correcta
        }
        throw new Error("La sesión ha expirado");
      }
    }

    // Si después del refresh aún hay error
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const error = new Error(errorData.message || "Error en la solicitud");
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    // Respuestas vacías
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("HTTP Request error:", error);
    throw error;
  }
}
