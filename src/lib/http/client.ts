import { isTokenExpiredError, refreshAccessToken, waitForTokenRefresh } from "./token-service";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipRefreshToken?: boolean; // Opción para evitar intentos de refresh en ciertas solicitudes
}

export async function httpClient<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipRefreshToken = false, ...config } = options;
  console.log("🚀 ~ params:", params);

  // Construir URL - simplificado
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fullUrl = url.startsWith("http") ? new URL(url) : new URL(url, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  // Si hay un refresh en progreso, esperar a que termine
  await waitForTokenRefresh();

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
    console.log("🚀 ~ response:", response);

    // Si el token expiró (401) y no estamos en una solicitud de refresh token
    if (isTokenExpiredError(response.status) && !skipRefreshToken) {
      // Intentar refrescar el token
      const refreshSuccess = await refreshAccessToken();
      console.log("🚀 ~ refreshSuccess:", refreshSuccess);

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
