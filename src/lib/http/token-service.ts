// Estado para almacenar información del token
let refreshPromise: Promise<boolean> | null = null;

// Cola de solicitudes pendientes
const pendingRequests: Array<() => void> = [];

/**
 * Realiza el refresh del token usando el endpoint de refresh
 * @returns Promise con el resultado del refresh
 */
export async function refreshAccessToken(): Promise<boolean> {
  console.log("🚀 ~ refreshAccessToken ~ refreshAccessToken:", refreshAccessToken);
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Importante para cookies
      });

      if (!response.ok) {
        throw new Error("No se pudo refrescar el token");
      }

      // Resolver todas las solicitudes pendientes
      pendingRequests.forEach((resolve) => resolve());
      pendingRequests.length = 0;

      return true;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Verifica si una respuesta indica un error de token expirado (401)
 */
export function isTokenExpiredError(status: number): boolean {
  return status === 401;
}

/**
 * Registra una solicitud pendiente para ejecutar después del refresh
 * @returns Promise que se resuelve cuando el token se ha refrescado
 */
export function waitForTokenRefresh(): Promise<void> {
  return new Promise((resolve) => {
    if (refreshPromise) {
      pendingRequests.push(resolve);
    } else {
      resolve();
    }
  });
}
