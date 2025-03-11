import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  "/sign-in",
  // Otros patrones públicos
];

// Rutas de recursos estáticos que no deben ser interceptadas
const staticRoutes = ["/_next", "/images", "/favicon.ico"];

// Verificar si una ruta es pública o estática
const isPublicPath = (path: string) => {
  return publicRoutes.some((route) => path.startsWith(route)) || staticRoutes.some((route) => path.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Verificar si el usuario está autenticado comprobando la cookie de sesión
  const authCookie = request.cookies.get("access_token"); // Ajustar al nombre real
  // El nombre de la cookie debe coincidir con la usada por tu API
  if (!authCookie) {
    // Redirigir a login si no hay cookie de autenticación
    const url = new URL("/sign-in", request.url);
    // Guardar la URL original para redirigir después del login
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  } else if (pathname === "/sign-in") {
    // Si el usuario ya está autenticado y está en la página de login
    // Redirigir al callbackUrl si existe, o a la raíz
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/";
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  // No aplicar middleware a rutas públicas o estáticas
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar middleware a todas las rutas excepto assets estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
