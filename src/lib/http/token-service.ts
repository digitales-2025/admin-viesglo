import { cookies } from "next/headers";

// Estado para almacenar información del token
let refreshPromise: Promise<boolean> | null = null;

// Cola de solicitudes pendientes
const pendingRequests: Array<() => void> = [];

/**
 * Realiza el refresh del token usando el endpoint de refresh
 * @returns Promise con el resultado del refresh
 */
export async function refreshAccessToken(): Promise<boolean> {
  console.log("🔄 Iniciando refresh token");
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token");
  console.log("🚀 ~ refreshAccessToken ~ refreshToken:", refreshToken);

  if (refreshPromise) {
    console.log("⏳ Refresh ya en progreso, esperando...");
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Verificar que tenemos la URL base
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error("❌ URL base no definida en variables de entorno");
        return false;
      }

      const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
      console.log("📡 Enviando solicitud a:", refreshUrl);

      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshToken?.value }),
      });

      console.log("📨 Respuesta del servidor:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        console.error(`❌ Error en refresh: ${response.status} - ${errorText}`);
        throw new Error(`Refresh falló con status: ${response.status}`);
      }

      console.log("✅ Refresh exitoso");
      pendingRequests.forEach((resolve) => resolve());
      pendingRequests.length = 0;

      return true;
    } catch (error) {
      console.error("❌ Error detallado:", error);
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
