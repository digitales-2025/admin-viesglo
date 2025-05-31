"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

import { useAuthPermissions } from "@/app/(public)/auth/sign-in/_hooks/useAuth";
import { EnumAction, EnumResource } from "@/app/dashboard/admin/roles/_utils/groupedPermission";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { UserType } from "../../domain/entities/User";
import { useAuth } from "../providers/AuthProvider";

// Definimos los posibles estados de autorización
type AuthState = "LOADING" | "AUTHORIZED" | "UNAUTHORIZED";

interface ProtectedComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  allowedUserTypes?: UserType[];
  allowedRoles?: string[];
  requiredPermissions?: { resource: EnumResource; action: EnumAction }[];
}

/**
 * Componente que muestra su contenido solo si el usuario cumple con los requisitos
 * de tipo de usuario, roles y/o permisos.
 *
 * @example
 * Solo mostrar para administradores con rol superadmin
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
  // Obtenemos isPermissionsLoading del hook useAuthPermissions directamente
  const { data: permissions, isLoading: isPermissionsLoading } = useAuthPermissions();
  const { user, hasRole, isLoading: authLoading } = useAuth();
  // Utilizamos el patrón State para manejar el estado de autorización
  const [authState, setAuthState] = useState<AuthState>("LOADING");

  // Detectamos si el componente necesita verificar permisos (para optimizar)
  const needsPermissionsCheck = useMemo(() => requiredPermissions.length > 0, [requiredPermissions]);

  // Detectamos si hay restricciones
  const hasRestrictions = useMemo(
    () => allowedUserTypes.length > 0 || allowedRoles.length > 0 || requiredPermissions.length > 0,
    [allowedUserTypes, allowedRoles, requiredPermissions]
  );

  // Verificar si el usuario es superadmin (para optimizar)
  const isSuperAdmin = useMemo(() => user?.roles?.includes("superadmin") || false, [user]);

  useEffect(() => {
    // Si no hay restricciones, autorizamos inmediatamente
    if (!hasRestrictions) {
      setAuthState("AUTHORIZED");
      return;
    }

    // Si es superadmin, autorizamos inmediatamente (tienen todos los permisos)
    if (isSuperAdmin) {
      setAuthState("AUTHORIZED");
      return;
    }

    // Si necesita permisos y aún están cargando, mantenemos en LOADING
    if (needsPermissionsCheck && isPermissionsLoading) {
      setAuthState("LOADING");
      return;
    }

    // Si el usuario está cargando, mantenemos en LOADING
    if (authLoading) {
      setAuthState("LOADING");
      return;
    }

    // Si no hay usuario pero hay restricciones, no está autorizado
    if (!user && hasRestrictions) {
      setAuthState("UNAUTHORIZED");
      return;
    }

    const checkAuthorization = async () => {
      try {
        // Verificar tipo de usuario (rápida, sin async)
        if (allowedUserTypes.length > 0) {
          const hasAllowedType = allowedUserTypes.includes(user?.type as UserType);
          if (!hasAllowedType) {
            setAuthState("UNAUTHORIZED");
            return;
          }
        }

        // Verificar roles (async)
        if (allowedRoles.length > 0) {
          // Optimización: verificar primero si el usuario tiene alguno de los roles directamente
          const hasDirectRole = allowedRoles.some((role) => user?.roles?.includes(role));

          if (hasDirectRole) {
            // Si ya tiene al menos un rol, está autorizado para esta restricción
            // Continuamos con las siguientes verificaciones
          } else {
            // Si no tiene roles directamente, verificamos con hasRole
            const roleChecks = await Promise.all(allowedRoles.map((role) => hasRole(role)));
            if (!roleChecks.some(Boolean)) {
              setAuthState("UNAUTHORIZED");
              return;
            }
          }
        }

        // Verificar permisos (rápido, sin async)
        if (needsPermissionsCheck && permissions) {
          const hasRequiredPermission = requiredPermissions.some((requiredPerm) =>
            permissions.some((p) => p.resource === requiredPerm.resource && p.action === requiredPerm.action)
          );

          if (!hasRequiredPermission) {
            setAuthState("UNAUTHORIZED");
            return;
          }
        }

        // Si pasó todas las verificaciones, está autorizado
        setAuthState("AUTHORIZED");
      } catch (error) {
        console.error("Error verificando autorización:", error);
        setAuthState("UNAUTHORIZED");
      }
    };

    // Ejecutar verificación
    checkAuthorization();
  }, [
    user,
    authLoading,
    isSuperAdmin,
    isPermissionsLoading,
    permissions,
    allowedUserTypes,
    allowedRoles,
    requiredPermissions,
    hasRole,
    hasRestrictions,
    needsPermissionsCheck,
  ]);

  // Renderizamos según el estado actual
  switch (authState) {
    case "LOADING":
      return <LoadingOverlay isLoading={true} fullScreen={true} />;
    case "AUTHORIZED":
      return <>{children}</>;
    case "UNAUTHORIZED":
      return <>{fallback}</>;
  }
}
