import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/sign-in", "/forbidden"];

// Rutas de API que no deberían pasar por el middleware de autenticación
const API_ROUTES = ["/api/auth", "/api/v1/auth"];

// Rutas que no deben guardarse para redirección después del login
const EXCLUDED_REDIRECT_ROUTES = ["/forbidden", "/sign-in"];

// Timeout para la verificación con el backend (en ms)
const VERIFY_TOKEN_TIMEOUT = 2000;

// Nombres de las cookies de autenticación
const AUTH_COOKIES = ["refresh_token", "access_token", "logged_in"];

interface JWTPayload {
  exp: number;
  type?: string;
  sub?: string;
  id?: string;
}

/**
 * Verifica si un token está firmado correctamente mediante una llamada al backend
 * Esto asegura que el token no solo tenga la estructura correcta, sino que
 * también haya sido emitido por nuestro sistema y sea válido
 *
 * @returns Un objeto con el estado de validación y si se debe limpiar las cookies
 */
async function verifyToken(token: string): Promise<{
  isValid: boolean;
  shouldClearCookies: boolean;
}> {
  // Valor por defecto: no limpiar cookies a menos que el backend explícitamente rechace el token
  let shouldClearCookies = false;

  try {
    // Si no hay token, no está firmado pero no limpiamos cookies
    if (!token) return { isValid: false, shouldClearCookies: false };

    // Realizar validación local básica primero
    let isLocallyValid = false;
    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // Verificar que tenga los campos necesarios
      if (!decoded.exp || !decoded.sub) {
        devlog("Token malformado: faltan campos necesarios");
        // Token malformado no implica limpieza, podría ser otro formato
        return { isValid: false, shouldClearCookies: false };
      }

      // Verificar expiración del token
      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      if (Date.now() >= expirationTime) {
        devlog("Token expirado localmente");
        // Token expirado localmente no implica limpieza, podría renovarse
        return { isValid: false, shouldClearCookies: false };
      }

      isLocallyValid = true;
    } catch (error) {
      devlog(`Error en validación local del token: ${error}`);
      // Error de formato no implica limpieza
      return { isValid: false, shouldClearCookies: false };
    }

    // Si la validación local falla, no necesitamos verificar con el backend
    if (!isLocallyValid) return { isValid: false, shouldClearCookies: false };

    // Verificar el token con el backend
    try {
      const verifyEndpoint = `${process.env.BACKEND_URL || "http://localhost:3001"}/auth/verify-token`;
      // Usar AbortController para el timeout en lugar de Promise.race
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), VERIFY_TOKEN_TIMEOUT);

      try {
        const response = await fetch(verifyEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: token }),
          signal: controller.signal,
        });
        // Limpiar el timeout si la llamada fue exitosa
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          devlog(`Token verificado por el backend: ${data.isValid}`);

          // SOLO limpiamos cookies si el backend explícitamente rechaza el token
          if (data.isValid === false) {
            devlog("Backend rechazó explícitamente el token como inválido. Marcando para limpieza.");
            shouldClearCookies = true;
          }

          return { isValid: data.isValid === true, shouldClearCookies };
        } else {
          devlog(`El backend rechazó el token: ${response.status}`);

          // Si el backend da un 401 o 403, el token es inválido y limpiamos
          if (response.status === 401 || response.status === 403) {
            devlog("Respuesta de error de autenticación del backend. Marcando para limpieza.");
            shouldClearCookies = true;
          }

          return { isValid: false, shouldClearCookies };
        }
      } catch (fetchError: any) {
        // Limpiar el timeout en caso de error
        clearTimeout(timeoutId);

        // Verificar si el error fue por timeout
        if (fetchError.name === "AbortError") {
          devlog("Timeout al verificar el token");
        } else {
          devlog(`Error en la petición al backend: ${fetchError.message}`);
        }

        // En caso de error de conexión, no limpiamos cookies

        // En producción siempre rechazamos pero sin limpiar cookies
        if (process.env.NODE_ENV === "production") {
          return { isValid: false, shouldClearCookies: false };
        }

        // En desarrollo, podemos aceptar la validación local
        devlog("En desarrollo, aceptamos validación local");
        return { isValid: isLocallyValid, shouldClearCookies: false };
      }
    } catch (error) {
      devlog(`Error general al verificar con el backend: ${error}`);
      // En caso de error, no limpiamos cookies
      return {
        isValid: process.env.NODE_ENV !== "production" && isLocallyValid,
        shouldClearCookies: false,
      };
    }
  } catch (error) {
    // Error general en la verificación
    devlog(`Error general al verificar el token: ${error}`);
    return { isValid: false, shouldClearCookies: false };
  }
}

/**
 * Limpia todas las cookies de autenticación
 */
function clearAuthCookies(response: NextResponse): void {
  devlog("LIMPIANDO COOKIES DE AUTENTICACIÓN");

  AUTH_COOKIES.forEach((cookieName) => {
    // Eliminar la cookie con el mismo path y dominio
    response.cookies.delete(cookieName);

    // Además, establecer la cookie con fecha de expiración en el pasado
    // para asegurar que se elimine en todos los navegadores
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    });

    devlog(`Cookie ${cookieName} eliminada`);
  });
}

/**
 * Verifica si la solicitud es una petición de login o está relacionada con la autenticación
 * para evitar interferir con el proceso de inicio de sesión
 */
function isAuthRelatedRequest(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;

  // Verificar si es una petición POST a /sign-in (formulario de login)
  if (pathname === "/sign-in" && method === "POST") {
    return true;
  }

  // Verificar si es una petición a la API de autenticación
  for (const route of API_ROUTES) {
    if (pathname.startsWith(route)) {
      return true;
    }
  }

  // Verificar si tiene parámetros relacionados con autenticación
  if (searchParams.has("token") || searchParams.has("code")) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  devlog(`Middleware hit: ${pathname}`);

  // Si es una petición relacionada con autenticación, permitir sin interferir
  if (isAuthRelatedRequest(request)) {
    devlog("Petición relacionada con autenticación, permitiendo sin interferir");
    return NextResponse.next();
  }

  // Obtener tokens de las cookies
  const refreshToken = request.cookies.get("refresh_token")?.value;
  // Verificar la autenticación
  let isAuthenticated = false;
  let shouldClearCookies = false;

  // Si hay un refresh_token, verificar su validez con el backend
  if (refreshToken) {
    try {
      // Comprobar si el token es válido y fue emitido por nuestro sistema
      const verificationResult = await verifyToken(refreshToken);
      isAuthenticated = verificationResult.isValid;
      shouldClearCookies = verificationResult.shouldClearCookies;

      if (!isAuthenticated) {
        devlog("Refresh token inválido, expirado o no reconocido por el backend");

        if (shouldClearCookies) {
          devlog("El backend indicó que el token debe ser limpiado");
        } else {
          devlog("No se limpiarán cookies a pesar de token inválido (no rechazado por backend)");
        }
      } else {
        devlog("Refresh token validado por el backend");
      }
    } catch (error: any) {
      devlog(`Error al verificar refresh token: ${error.message}`);
      console.error("Error al verificar refresh token:", error);
      // En caso de error, no limpiamos cookies
      shouldClearCookies = false;
    }
  } else {
    devlog("No hay refresh token");
    // No hay token, no hay nada que limpiar
    shouldClearCookies = false;
  }

  // CASO 1: Si estamos en una ruta pública y el usuario está autenticado,
  // redirigimos a la página principal
  if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated) {
    devlog("Ruta pública, usuario autenticado");

    // Si es /forbidden, también redirigimos a la página principal
    // Si es cualquier otra ruta pública, redirigimos a la página principal
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("lastUrl");

    devlog(`Redirigiendo a la página principal`);
    return response;
  }

  // CASO 2: Si estamos en una ruta privada y el usuario no está autenticado,
  // limpiamos las cookies SOLO si el backend explícitamente rechazó el token
  if (!PUBLIC_ROUTES.includes(pathname) && !isAuthenticated) {
    devlog("Ruta privada, usuario no autenticado");

    const response = NextResponse.redirect(new URL("/sign-in", request.url));

    // Limpiamos cookies SOLO si el backend nos indicó que el token es inválido
    if (shouldClearCookies) {
      devlog("Limpiando cookies por indicación del backend");
      clearAuthCookies(response);
    } else {
      devlog("No se limpian cookies a pesar de redirección (token no rechazado explícitamente)");
    }

    // Solo guardamos la URL si no está en la lista de excluidas
    if (!EXCLUDED_REDIRECT_ROUTES.includes(pathname)) {
      response.cookies.set("lastUrl", pathname, {
        path: "/",
        maxAge: 3600, // 1 hora
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      devlog(`Guardando última URL: ${pathname}`);
    }

    return response;
  }

  // CASO 3: Si estamos en una ruta pública y el usuario no está autenticado
  if (PUBLIC_ROUTES.includes(pathname) && !isAuthenticated) {
    devlog("Ruta pública, usuario no autenticado, continuando");

    // Si estamos en sign-in y el backend indicó que el token debe limpiarse, lo hacemos
    if (pathname === "/sign-in" && shouldClearCookies) {
      devlog("Limpiando cookies por indicación explícita del backend");
      const response = NextResponse.next();
      clearAuthCookies(response);
      return response;
    }

    return NextResponse.next();
  }

  // El usuario está autenticado con refresh_token, continuamos
  devlog("Sesión válida, continuando");
  return NextResponse.next();
}

function devlog(message: string) {
  if (process.env.NODE_ENV === "development") {
    console.log("\tDEBUG: " + message);
  }
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos estáticos de Next.js)
     * 3. /_static (si tienes una carpeta static)
     * 4. /_vercel (archivos internos de Vercel)
     * 5. /favicon.ico, /sitemap.xml, etc.
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
  ],
};
