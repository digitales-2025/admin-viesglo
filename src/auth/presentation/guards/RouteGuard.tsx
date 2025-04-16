import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { UserType } from "../../domain/entities/User";
import { useAuth } from "../providers/AuthProvider";

interface RouteGuardProps {
  children: ReactNode;
  allowedUserTypes?: UserType[];
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

/**
 * Componente para proteger rutas según el tipo de usuario, roles y permisos.
 * Se puede usar para proteger secciones enteras de una aplicación.
 */
export const RouteGuard = ({
  children,
  allowedUserTypes,
  allowedRoles,
  requiredPermissions,
  fallbackPath = "/forbidden",
}: RouteGuardProps) => {
  const { user, isLoading, isAuthenticated, authorizeUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      // Si está cargando o no está autenticado, no hacemos más verificaciones
      if (isLoading || !isAuthenticated) {
        return;
      }

      // Verificar el tipo de usuario
      if (allowedUserTypes && user) {
        if (!allowedUserTypes.includes(user.type)) {
          router.replace(fallbackPath);
          setIsAuthorized(false);
          setAuthChecked(true);
          return;
        }
      }

      // Verificar roles y permisos
      try {
        await authorizeUser(allowedRoles, requiredPermissions);
        setIsAuthorized(true);
      } catch (error) {
        console.error("Authorization error in RouteGuard:", error);
        setIsAuthorized(false);
        router.replace(fallbackPath);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuthorization();
  }, [
    user,
    isLoading,
    isAuthenticated,
    allowedUserTypes,
    allowedRoles,
    requiredPermissions,
    authorizeUser,
    router,
    fallbackPath,
  ]);

  // Mientras se verifica la autenticación, podemos mostrar un loading
  if (isLoading || !authChecked) {
    return <div>Cargando...</div>;
  }

  // Si está autorizado, mostramos el contenido
  return isAuthorized ? <>{children}</> : null;
};
