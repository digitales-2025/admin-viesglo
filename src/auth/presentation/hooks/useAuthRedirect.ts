import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getUserDashboardPath, UserType } from "../../domain/entities/User";
import { useAuth } from "../providers/AuthProvider";

interface AuthRedirectOptions {
  requireAuth?: boolean;
  allowedUserTypes?: UserType[];
  allowedRoles?: string[];
  fallbackPath?: string;
  redirectIfAuthenticated?: boolean;
  redirectPath?: string;
}

/**
 * Hook personalizado para manejar redirecciones basadas en autenticación y autorización.
 *
 * @param options Opciones de configuración para la redirección
 */
export const useAuthRedirect = ({
  requireAuth = false,
  allowedUserTypes = [],
  allowedRoles = [],
  fallbackPath = "/forbidden",
  redirectIfAuthenticated = false,
  redirectPath,
}: AuthRedirectOptions = {}) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      // Si aún está cargando, no hacemos nada
      if (isLoading) {
        return;
      }

      // Caso 1: Redireccionar si el usuario está autenticado (útil para páginas de login)
      if (redirectIfAuthenticated && isAuthenticated) {
        const path = redirectPath || getUserDashboardPath();
        router.replace(path);
        return;
      }

      // Caso 2: Redireccionar si se requiere autenticación y el usuario no está autenticado
      if (requireAuth && !isAuthenticated) {
        router.replace("/auth/sign-in");
        return;
      }

      // Caso 3: Verificar tipos de usuario permitidos
      if (
        requireAuth &&
        isAuthenticated &&
        user &&
        allowedUserTypes.length > 0 &&
        !allowedUserTypes.includes(user.type)
      ) {
        router.replace(fallbackPath);
        return;
      }

      // Caso 4: Verificar roles permitidos
      if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
        const roleChecks = await Promise.all(allowedRoles.map((role) => hasRole(role)));
        const hasAllowedRole = roleChecks.some(Boolean);

        if (!hasAllowedRole) {
          router.replace(fallbackPath);
          return;
        }
      }
    };

    handleRedirect();
  }, [
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    redirectIfAuthenticated,
    allowedUserTypes,
    allowedRoles,
    fallbackPath,
    redirectPath,
    router,
    hasRole,
  ]);

  return { isLoading, isAuthenticated, user };
};
