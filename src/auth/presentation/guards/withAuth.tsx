import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import { getUserDashboardPath, UserType } from "../../domain/entities/User";

interface JWTPayload {
  exp: number;
  user_id: string;
  roles: string[];
  type: UserType;
}

interface AuthOptions {
  allowedUserTypes?: UserType[];
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * Función para proteger rutas en Server Components de Next.js
 * Verifica la autenticación y la autorización del usuario
 * y redirecciona si es necesario.
 */
export async function withAuth(options: AuthOptions = {}) {
  const { allowedUserTypes = [], allowedRoles = [], redirectTo = "/sign-in" } = options;

  // Obtener cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Si no hay tokens, redirigir a login
  if (!accessToken && !refreshToken) {
    redirect(redirectTo);
  }

  try {
    // Decodificar el token
    if (!accessToken) {
      redirect("/sign-in");
    }

    const decodedToken = jwtDecode<JWTPayload>(accessToken);

    // Verificar si el token ha expirado
    if (isTokenExpired(decodedToken.exp)) {
      redirect("/sign-in");
    }

    // Verificar tipo de usuario
    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(decodedToken.type)) {
      // Si el usuario no tiene un tipo permitido, redirigir a su dashboard correspondiente
      redirect(getUserDashboardPath());
    }

    // Verificar roles
    if (allowedRoles.length > 0 && !hasAnyRole(decodedToken.roles, allowedRoles)) {
      // Si el usuario no tiene ningún rol permitido, redirigir a su dashboard o a forbidden
      redirect("/forbidden");
    }

    // Devolver información del usuario para uso en Server Components
    return {
      userId: decodedToken.user_id,
      userType: decodedToken.type,
      roles: decodedToken.roles,
    };
  } catch (error) {
    console.error("Auth error:", error);
    redirect("/sign-in");
  }
}

// Verificar si el token ha expirado
function isTokenExpired(expTimestamp: number): boolean {
  const expirationTime = expTimestamp * 1000; // Convertir a milisegundos
  return Date.now() >= expirationTime;
}

// Verificar si el usuario tiene al menos uno de los roles requeridos
function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return userRoles.some((role) => requiredRoles.includes(role));
}
