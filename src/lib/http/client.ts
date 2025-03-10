import { isTokenExpiredError, refreshAccessToken } from "./token-service";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipRefreshToken?: boolean; // Opción para evitar intentos de refresh en ciertas solicitudes
}

export async function httpClient<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipRefreshToken = false, ...config } = options;

  // Construir URL correctamente manteniendo la ruta base
  const baseUrl = process.env.API_URL || "";

  // Asegurarse de combinar correctamente las rutas
  let fullUrl: URL;
  if (url.startsWith("/")) {
    // Si url empieza con /, asegurarse de que se mantiene la ruta base
    const baseUrlObj = new URL(baseUrl);
    const basePath = baseUrlObj.pathname.endsWith("/") ? baseUrlObj.pathname.slice(0, -1) : baseUrlObj.pathname;

    fullUrl = new URL(`${baseUrlObj.origin}${basePath}${url}`);
  } else {
    // URL relativa normal
    fullUrl = new URL(url, baseUrl);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
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

  try {
    // Realizar la solicitud
    let response = await fetch(fullUrl.toString(), requestConfig);

    // Si el token expiró (401) y no estamos en una solicitud de refresh token
    if (isTokenExpiredError(response.status) && !skipRefreshToken && url !== "/auth/refresh") {
      try {
        // Intentar refrescar el token
        await refreshAccessToken();

        // Reintentar la solicitud original con el nuevo token
        response = await fetch(fullUrl.toString(), requestConfig);
      } catch (refreshError) {
        // Si el refresh falla, consideramos que la sesión expiró
        console.error("Error refreshing token:", refreshError);

        // No se pudo refrescar el token, la sesión probablemente expiró
        if (typeof window !== "undefined") {
          // Solo redirigir en el cliente
          window.location.href = "/auth/sign-in";
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
