import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode"; // Forzar recarga del módulo

import { Result } from "./lib/http/result";

interface JWTPayload {
  exp: number;
}

const PUBLIC_ROUTES = ["/sign-in"];

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000/api/v1";

// Rutas que no queremos guardar como última URL visitada
const EXCLUDED_REDIRECT_ROUTES = ["/", "/sign-in"];

export async function middleware(request: NextRequest) {
  const access_token = request.cookies.get("access_token");
  const refresh_token = request.cookies.get("refresh_token");
  const isAuthenticated = !!access_token || !!refresh_token;
  console.log("🚀 ~ middleware ~ isAuthenticated:", isAuthenticated);
  const { pathname } = request.nextUrl;

  devlog("middleware hit");

  // Si estamos en una ruta pública (sign-in) y el usuario está autenticado
  // redirigimos al home o a la última URL visitada
  if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated) {
    devlog("ruta publica, autenticado, continue");

    const lastVisitedUrl = request.cookies.get("lastUrl")?.value ?? "/";
    const nextResponse = NextResponse.redirect(new URL(lastVisitedUrl, request.url));
    nextResponse.cookies.delete("lastUrl");
    return nextResponse;
  }

  // Si NO estamos en una ruta pública y el usuario NO está autenticado
  // guardamos la URL actual (si no está excluida) y redirigimos a sign-in
  if (!PUBLIC_ROUTES.includes(pathname) && !isAuthenticated) {
    devlog("ruta privada, no autenticado, continue");

    const response = NextResponse.redirect(new URL("/sign-in", request.url));

    // Solo guardamos la URL si no está en la lista de excluidas
    if (!EXCLUDED_REDIRECT_ROUTES.includes(pathname)) {
      response.cookies.set("lastUrl", pathname);
    }

    return response;
  }

  // Si estamos en una ruta publica, y el usuario no esta autenticado, continuar
  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    devlog("ruta publica, no autenticado, continue");

    return NextResponse.next();
  }

  devlog("session check");

  // En este punto se cumple que:
  // - Estamos en una ruta privada, y el usuario esta "autenticado"

  // Si no existe access_token o refresh_token,
  // redirigir a login
  if (!refresh_token) {
    devlog(`no refresh token. access: ${access_token?.value}`);

    const redirectUrl = EXCLUDED_REDIRECT_ROUTES.includes(pathname) ? "/" : pathname;
    return logoutAndRedirectLogin(request, redirectUrl);
  }

  // Si el access_token expira en 30s o menos,
  // intentar refrescarlo
  if (tokenExpiration(access_token?.value ?? "") < 30) {
    devlog("access_token exp: less than 30");

    // Si refresh_token expira en 5s o menos,
    // eliminar todas las cookies y redirigir a login
    if (tokenExpiration(refresh_token.value) < 5) {
      devlog("refresh_token exp: less than 5");

      const redirectUrl = EXCLUDED_REDIRECT_ROUTES.includes(pathname) ? "/" : pathname;
      return logoutAndRedirectLogin(request, redirectUrl);
    }

    const [newCookies, err] = await refresh(refresh_token.value);
    console.log("🚀 ~ middleware ~ newCookies:", newCookies);
    if (err) {
      devlog("refresh failure");

      console.log(err);
      const redirectUrl = EXCLUDED_REDIRECT_ROUTES.includes(pathname) ? "/" : pathname;
      return logoutAndRedirectLogin(request, redirectUrl);
    }

    devlog("resetting cookies & forward");

    const response = NextResponse.next();
    newCookies.forEach((cookie) => {
      devlog("Set-Cookie: " + cookie);
      const { name, value, options } = parseSetCookie(cookie);
      response.cookies.set({
        name,
        value,
        ...options,
      });
    });

    return response;
  }

  devlog("session valid, forward");

  // access_token es valido, continuar
  return NextResponse.next();
}

function parseSetCookie(cookieString: string) {
  const pairs: [string, string | boolean][] = cookieString
    .split(";")
    .map((pair) => pair.trim())
    .map((pair) => {
      const [key, ...values] = pair.split("=");
      return [key.toLowerCase(), values.join("=") || true];
    });

  // Get the first pair which has the cookie name and value
  const [cookieName, cookieValue] = pairs[0];
  const cookieMap = new Map(pairs.slice(1));

  return {
    name: cookieName,
    value: cookieValue as string,
    options: {
      path: cookieMap.get("path") as string,
      maxAge: cookieMap.has("max-age") ? parseInt(cookieMap.get("max-age") as string) : undefined,
      expires: cookieMap.has("expires") ? new Date(cookieMap.get("expires") as string) : undefined,
      httpOnly: cookieMap.get("httponly") === true,
      sameSite: cookieMap.has("samesite")
        ? ((cookieMap.get("samesite") as string).toLowerCase() as "strict")
        : undefined,
    },
  };
}

function devlog(message: string) {
  if (process.env.NODE_ENV === "development") {
    console.log("\tDEBUG: " + message);
  }
}
/**
 * Elimina todas las cookies y redirige a login. Guarda
 * la URL pasada como segundo parametro como cookie.
 */
function logoutAndRedirectLogin(request: NextRequest, redirectUrl: string) {
  const response = NextResponse.redirect(new URL("/sign-in", request.url));
  response.cookies.delete("logged_in");
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.set("lastUrl", redirectUrl);
  return response;
}

/**
 * Devuelve en cuantos segundos expira el token jwt pasado como param.
 * Si el token es invalido, o ya ha expirado, devuelve 0
 */
function tokenExpiration(token: string): number {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const expirationMs = decoded.exp * 1000;
    const now = Date.now();
    const secondsToExpiration = (expirationMs - now) / 1000;
    return secondsToExpiration > 0 ? secondsToExpiration : 0;
  } catch {
    return 0;
  }
}

async function refresh(refreshToken: string): Promise<Result<string[], string>> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const newCookies = response.headers.getSetCookie();

    if (!newCookies || newCookies.length === 0) {
      // @ts-expect-error allowing null
      return [null, "El refresh fue exitoso, pero no contenia nuevas cookies"];
    }

    return [newCookies, null];
  } catch (error) {
    console.error("Refresh token error:", error);
    // @ts-expect-error allowing null
    return [null, "Error refrescando token"];
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
