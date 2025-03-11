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
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // Consideramos autenticado si tiene access token O refresh token
  // El refresh token puede usarse para obtener un nuevo access token
  const isAuthenticated = !!accessToken || !!refreshToken;
  const isPublic = isPublicPath(pathname);

  // Caso 1: Usuario autenticado intentando acceder a ruta pública (redireccionar a dashboard)
  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Caso 2: Usuario no autenticado (sin ninguno de los dos tokens) intentando acceder a ruta privada
  if (!isAuthenticated && !isPublic) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // En cualquier otro caso, permitir la navegación
  return NextResponse.next();
}

export const config = {
  // Aplicar middleware a todas las rutas excepto assets estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
