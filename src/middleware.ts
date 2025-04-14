import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/sign-in"];

// Rutas que no deben guardarse para redirección después del login
const EXCLUDED_REDIRECT_ROUTES = ["/forbidden"];

interface JWTPayload {
  exp: number;
  type?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  devlog(`Middleware hit: ${pathname}`);

  // Obtener tokens de las cookies
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Verificar la autenticación
  let isAuthenticated = false;

  // Si hay un refresh_token válido, el usuario está autenticado
  // El access_token puede haber expirado, pero el backend lo renovará automáticamente
  if (refreshToken) {
    try {
      // Verificar si el refresh_token es válido (no está expirado)
      const decoded = jwtDecode<JWTPayload>(refreshToken);
      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      isAuthenticated = Date.now() < expirationTime;

      if (!isAuthenticated) {
        devlog("Refresh token expirado");
      }
    } catch (error: any) {
      devlog("Error al decodificar refresh token");
      console.error("Error al decodificar refresh token:", error);
    }
  }

  // El access_token puede haber expirado, pero si el refresh_token es válido,
  // el backend se encargará de renovarlo automáticamente

  // CASO 1: Si estamos en una ruta pública y el usuario está autenticado,
  // redirigimos a la página principal
  if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated) {
    devlog("Ruta pública, usuario autenticado");

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("lastUrl");

    devlog(`Redirigiendo a la página principal`);
    return response;
  }

  // CASO 2: Si estamos en una ruta privada y el usuario no está autenticado,
  // guardamos la URL actual (si no está excluida) y redirigimos a sign-in
  if (!PUBLIC_ROUTES.includes(pathname) && !isAuthenticated) {
    devlog("Ruta privada, usuario no autenticado");

    const response = NextResponse.redirect(new URL("/sign-in", request.url));

    // Solo guardamos la URL si no está en la lista de excluidas
    if (!EXCLUDED_REDIRECT_ROUTES.includes(pathname)) {
      response.cookies.set("lastUrl", pathname);
      devlog(`Guardando última URL: ${pathname}`);
    }

    return response;
  }

  // CASO 3: Si estamos en una ruta pública y el usuario no está autenticado,
  // permitimos continuar
  if (PUBLIC_ROUTES.includes(pathname) && !isAuthenticated) {
    devlog("Ruta pública, usuario no autenticado, continuando");
    return NextResponse.next();
  }

  // El usuario está autenticado con refresh_token, continuamos
  // El backend se encargará de verificar y renovar el access_token si es necesario
  // usando el refresh_token en las peticiones
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
