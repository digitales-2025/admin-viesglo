import { NextRequest, NextResponse } from "next/server";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/auth/sign-in", "/forbidden"];

//const PUBLIC_ROUTES_WITHOUT_AUTH = ['/'];

// Rutas de API que no deberían pasar por el middleware de autenticación
const API_ROUTES = ["/api/auth", "/api/v1/auth"];

// Rutas que no deben guardarse para redirección después del login
const EXCLUDED_REDIRECT_ROUTES = ["/forbidden", "/auth/sign-in"];

/**
 * Verifica si la solicitud es una petición de login o está relacionada con la autenticación
 */
function isAuthRelatedRequest(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;

  // Verificaciones rápidas primero
  if (pathname === "/log-in" && method === "POST") return true;

  // Verificar si es una petición a la API de autenticación
  for (const route of API_ROUTES) {
    if (pathname.startsWith(route)) return true;
  }

  // Verificar parámetros relacionados con autenticación
  return searchParams.has("token") || searchParams.has("code");
}

/**
 * Verifica si la ruta es un recurso estático que no necesita verificación
 */
function isStaticResource(pathname: string): boolean {
  return (
    pathname.includes("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".js")
  );
}

function devlog(message: string) {
  if (process.env.NODE_ENV === "development") {
    console.log("\tDEBUG: " + message);
  }
}

export async function middleware(request: NextRequest) {
  const startTime = process.env.NODE_ENV === "development" ? Date.now() : 0;
  const { pathname } = request.nextUrl;

  devlog(`Middleware: ${pathname}`);

  // Permitir recursos estáticos sin verificación
  if (isStaticResource(pathname)) {
    return NextResponse.next();
  }

  // Si es una ruta pública sin autenticación, permitir acceso
  // if (PUBLIC_ROUTES_WITHOUT_AUTH.includes(pathname)) {
  //     devlog('Ruta pública sin autenticación, permitiendo acceso');
  //     return NextResponse.next();
  // }

  // Si es una petición relacionada con autenticación, permitir sin interferir
  if (isAuthRelatedRequest(request)) {
    devlog("Petición relacionada con autenticación, permitiendo sin interferir");
    return NextResponse.next();
  }

  // Verificar presencia de cookie de autenticación (sin validar su contenido)
  const session_token = !!request.cookies.get("better-auth.session_token")?.value;

  // CASO 1: Ruta pública, usuario aparentemente autenticado -> redirigir a la página principal
  if (PUBLIC_ROUTES.includes(pathname) && session_token) {
    devlog("Ruta pública, token presente, redirigiendo a dashboard");
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("lastUrl");
    return response;
  }

  // CASO 2: Ruta privada, usuario sin token -> redirigir a login
  if (!PUBLIC_ROUTES.includes(pathname) && !session_token) {
    devlog("Ruta privada, token ausente, redirigiendo a login");
    const response = NextResponse.redirect(new URL("/auth/sign-in", request.url));

    // Guardar URL para redirección posterior
    if (!EXCLUDED_REDIRECT_ROUTES.includes(pathname)) {
      response.cookies.set("lastUrl", pathname, {
        path: "/",
        maxAge: 3600, // 1 hora
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      });
      devlog(`Guardando última URL: ${pathname}`);
    }

    return response;
  }

  // En cualquier otro caso, continuar (el backend validará el token)
  if (process.env.NODE_ENV === "development") {
    const endTime = Date.now();
    devlog(`Middleware completado en ${endTime - startTime}ms`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos estáticos de Next.js)
     * 3. /_static (si tienes una carpeta static)
     * 4. /_vercel (archivos internos de Vercel)
     * 5. /assets (carpeta de recursos estáticos)
     * 6. /favicon.ico, /sitemap.xml, etc.
     */
    "/((?!api|_next|_static|_vercel|assets|favicon\\.ico|sitemap\\.xml|.*\\.(?:png|jpe?g|gif|svg|webp|bmp|ico|otf|ttf|tiff?)(?:$|\\?)).*)",
  ],
};
