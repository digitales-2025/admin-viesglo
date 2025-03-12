import { cookies } from "next/headers";

// Estado para almacenar información del token
let refreshPromise: Promise<boolean> | null = null;

/**
 * Verifica si una respuesta indica un error de token expirado (401)
 */
export function isTokenExpiredError(status: number): boolean {
  return status === 401;
}

/**
 * Función auxiliar para obtener cookies de manera segura
 * que funciona con diferentes versiones de Next.js
 */
export async function getCookieValue(name: string): Promise<string | undefined> {
  if (typeof window !== "undefined") {
    // En el cliente, leer de document.cookie
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
    return value ? decodeURIComponent(value) : undefined;
  } else {
    // En el servidor, usar cookies() de next/headers
    try {
      // Manejar caso donde cookies() devuelve una promesa
      const cookieStore = await Promise.resolve(cookies());
      return cookieStore.get(name)?.value;
    } catch (error) {
      console.error(`Error al obtener cookie ${name}:`, error);
      return undefined;
    }
  }
}

/**
 * Realiza el refresh del token usando el endpoint de refresh
 * Esta función está optimizada para funcionar en el navegador
 * @returns Promise con el resultado del refresh
 */
export async function refreshAccessToken(): Promise<boolean> {
  console.log("🔄 Iniciando proceso de refresh token");

  // Si ya hay un refresh en proceso, retorna esa promesa
  if (refreshPromise) {
    console.log("⏳ Refresh token ya en progreso, esperando resultado...");
    return refreshPromise;
  }

  // Crear nueva promesa de refresh
  refreshPromise = (async () => {
    try {
      // Verificar que estamos en el cliente (el refresh solo funciona bien en el cliente)
      if (typeof window === "undefined") {
        console.warn("⚠️ Refresh token llamado desde el servidor, no es recomendado");
        return false;
      }

      // Verificar que tenemos la URL base
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error("❌ URL base no definida en variables de entorno");
        return false;
      }

      // Construir URL de refresh
      const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
      console.log("📡 Enviando solicitud a:", refreshUrl);

      // Realizar la petición de refresh
      // Las cookies se enviarán automáticamente gracias a credentials: "include"
      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include", // Esto es fundamental para enviar las cookies de refresh token
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`📨 Respuesta de refresh: ${response.status}`);

      // Verificar resultado
      if (!response.ok) {
        console.error(`❌ Error en refresh: ${response.status}`);
        return false;
      }

      // Procesar respuesta exitosa
      await response.json();
      console.log("✅ Refresh exitoso, nuevo token obtenido");
      return true;
    } catch (error) {
      console.error("❌ Error en proceso de refresh:", error);
      return false;
    } finally {
      // Limpiar la promesa de refresh cuando termina
      refreshPromise = null;
    }
  })();

  // Retornar promesa de refresh
  return refreshPromise;
}
