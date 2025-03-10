import { ENDPOINTS } from "./endpoints";

// Estado para almacenar información del token
let refreshPromise: Promise<string> | null = null;

/**
 * Construye una URL correctamente manteniendo la ruta base
 * Duplicamos esta lógica para evitar importaciones circulares
 */
function buildFullUrl(path: string): string {
  const baseUrl = process.env.API_URL || "";

  if (path.startsWith("/")) {
    const baseUrlObj = new URL(baseUrl);
    const basePath = baseUrlObj.pathname.endsWith("/") ? baseUrlObj.pathname.slice(0, -1) : baseUrlObj.pathname;

    return `${baseUrlObj.origin}${basePath}${path}`;
  }
  return new URL(path, baseUrl).toString();
}

/**
 * Realiza el refresh del token usando el endpoint de refresh
 * @returns Promise con el nuevo accessToken
 */
export async function refreshAccessToken(): Promise<string> {
  // Si ya hay un refresh en proceso, retornamos la misma promesa
  // para evitar múltiples solicitudes simultáneas
  if (refreshPromise) {
    return refreshPromise;
  }

  // Crear una nueva promesa para el proceso de refresh
  refreshPromise = new Promise<string>(async (resolve, reject) => {
    try {
      // Construimos la URL completa
      const refreshUrl = buildFullUrl(ENDPOINTS.REFRESH);

      // Usamos fetch directamente para evitar circular imports
      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include", // Importante para enviar las cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo refrescar el token");
      }

      const data = await response.json();

      // Resolvemos con el nuevo token
      resolve(data.accessToken);
    } catch (error) {
      reject(error);
    } finally {
      // Limpiamos la promesa de refresh cuando termina
      refreshPromise = null;
    }
  });

  return refreshPromise;
}

/**
 * Verifica si una respuesta indica un error de token expirado (401)
 */
export function isTokenExpiredError(status: number): boolean {
  return status === 401;
}
