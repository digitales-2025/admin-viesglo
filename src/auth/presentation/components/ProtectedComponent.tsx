"use client";

import { ReactNode, useEffect, useState } from "react";

import { UserType } from "../../domain/entities/User";
import { useAuth } from "../providers/AuthProvider";

interface ProtectedComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  allowedUserTypes?: UserType[];
  allowedRoles?: string[];
  requiredPermissions?: { resource: string; action: string }[];
}

/**
 * Componente que muestra su contenido solo si el usuario cumple con los requisitos
 * de tipo de usuario, roles y/o permisos.
 *
 * @example
 * // Solo mostrar para administradores con rol superadmin
 * <ProtectedComponent
 *   allowedUserTypes={["admin"]}
 *   allowedRoles={["superadmin"]}
 *   fallback={<p>No tienes permiso para ver este contenido</p>}
 * >
 *   <AdminControls />
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  fallback = null,
  allowedUserTypes = [],
  allowedRoles = [],
  requiredPermissions = [],
}: ProtectedComponentProps) {
  const { user, hasRole, hasPermission } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Si no hay usuario, no está autorizado
        if (!user) {
          setIsAuthorized(false);
          return;
        }

        // Verificar tipo de usuario
        if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.type)) {
          setIsAuthorized(false);
          return;
        }

        // Verificar roles
        if (allowedRoles.length > 0) {
          const roleChecks = await Promise.all(allowedRoles.map((role) => hasRole(role)));
          if (!roleChecks.some(Boolean)) {
            setIsAuthorized(false);
            return;
          }
        }

        // Verificar permisos
        if (requiredPermissions.length > 0) {
          const permissionChecks = await Promise.all(
            requiredPermissions.map((permission) => hasPermission(permission.resource, permission.action))
          );
          if (!permissionChecks.some(Boolean)) {
            setIsAuthorized(false);
            return;
          }
        }

        // Si pasó todas las verificaciones, está autorizado
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error verificando autorización:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [user, allowedUserTypes, allowedRoles, requiredPermissions, hasRole, hasPermission]);

  // Mientras verifica autorización, no mostrar nada
  if (isLoading) {
    return null;
  }

  // Si está autorizado, mostrar el contenido, de lo contrario, mostrar el fallback
  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}
