"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { useMyProfile } from "@/app/dashboard/admin/users/_hooks/use-users";
import { LoadingOverlay } from "@/shared/components/loading-overlay";

// Definimos los posibles estados de autorización
type AuthState = "LOADING" | "AUTHORIZED" | "UNAUTHORIZED";

// Tipos para los permisos
export type ResourceName = EnumResource;
export type ActionName = EnumAction;

export interface Permission {
  resource: ResourceName;
  action: ActionName;
}

interface ProtectedComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean; // true = AND, false = OR
  allowedRoles?: string[];
  requireAllRoles?: boolean; // true = AND, false = OR
  isSystemRole?: boolean; // Solo roles del sistema
  excludeRoles?: string[]; // Roles excluidos
  hideOnUnauthorized?: boolean; // true = ocultar, false = mostrar fallback
}

/**
 * Hook personalizado para verificar permisos
 */
const usePermissionCheck = () => {
  const { data: user, isLoading, error } = useMyProfile();

  console.log("user", JSON.stringify(user?.role?.permissions, null, 2));

  const hasPermission = (resource: ResourceName, action: ActionName): boolean => {
    if (!user?.role?.permissions) return false;

    // Verificar si tiene el permiso específico
    const hasSpecificPermission = user.role.permissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );

    if (hasSpecificPermission) return true;

    // Verificar si tiene permiso wildcard en la acción para este recurso (resource:*)
    const hasActionWildcard = user.role.permissions.some(
      (permission) => permission.resource === resource && permission.action === "*"
    );

    if (hasActionWildcard) return true;

    // Verificar si tiene permiso wildcard completo (*:*)
    const hasFullWildcard = user.role.permissions.some(
      (permission) => permission.resource === "*" && permission.action === "*"
    );

    return hasFullWildcard;
  };

  const hasRole = (roleName: string): boolean => {
    if (!user?.role?.name) return false;
    return user.role.name.toLowerCase() === roleName.toLowerCase();
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  const isSystemRole = (): boolean => {
    return user?.role?.isSystem || false;
  };

  const isExcludedRole = (excludedRoles: string[]): boolean => {
    if (!user?.role?.name) return false;
    return excludedRoles.some((role) => hasRole(role));
  };

  return {
    user,
    isLoading,
    error,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isSystemRole,
    isExcludedRole,
    isAuthenticated: !!user,
  };
};

/**
 * Componente que muestra su contenido solo si el usuario cumple con los requisitos
 * de permisos y/o roles.
 *
 * @example
 * // Solo mostrar para usuarios con permiso de lectura en proyectos
 * <ProtectedComponent
 *   requiredPermissions={[{ resource: "projects", action: "read" }]}
 *   fallback={<p>No tienes permiso para ver este contenido</p>}
 * >
 *   <ProjectList />
 * </ProtectedComponent>
 *
 * @example
 * // Mostrar para usuarios con CUALQUIERA de estos permisos (OR)
 * <ProtectedComponent
 *   requiredPermissions={[
 *     { resource: "projects", action: "manage" },
 *     { resource: "milestones", action: "read" }
 *   ]}
 *   requireAllPermissions={false}
 * >
 *   <Content />
 * </ProtectedComponent>
 *
 * @example
 * // Mostrar para usuarios con TODOS estos permisos (AND)
 * <ProtectedComponent
 *   requiredPermissions={[
 *     { resource: "projects", action: "read" },
 *     { resource: "milestones", action: "read" }
 *   ]}
 *   requireAllPermissions={true}
 * >
 *   <Content />
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  fallback = null,
  requiredPermissions = [],
  requireAllPermissions = false,
  allowedRoles = [],
  requireAllRoles = false,
  isSystemRole: requireSystemRole = false,
  excludeRoles = [],
  hideOnUnauthorized = false,
}: ProtectedComponentProps) {
  const {
    user,
    isLoading,
    error,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    isSystemRole,
    isExcludedRole,
    isAuthenticated,
  } = usePermissionCheck();

  const [authState, setAuthState] = useState<AuthState>("LOADING");

  // Detectamos si hay restricciones
  const hasRestrictions = useMemo(
    () => requiredPermissions.length > 0 || allowedRoles.length > 0 || requireSystemRole || excludeRoles.length > 0,
    [requiredPermissions.length, allowedRoles.length, requireSystemRole, excludeRoles.length]
  );

  useEffect(() => {
    // Si no hay restricciones, autorizamos inmediatamente
    if (!hasRestrictions) {
      setAuthState("AUTHORIZED");
      return;
    }

    // Si está cargando, mantenemos en LOADING
    if (isLoading) {
      setAuthState("LOADING");
      return;
    }

    // Si hay error o no está autenticado, no está autorizado
    if (error || !isAuthenticated) {
      setAuthState("UNAUTHORIZED");
      return;
    }

    // Si no hay usuario pero hay restricciones, no está autorizado
    if (!user && hasRestrictions) {
      setAuthState("UNAUTHORIZED");
      return;
    }

    try {
      // Verificar si está en roles excluidos
      if (excludeRoles.length > 0 && isExcludedRole(excludeRoles)) {
        setAuthState("UNAUTHORIZED");
        return;
      }

      // Verificar roles permitidos
      if (allowedRoles.length > 0) {
        const roleCheck = requireAllRoles ? hasAllRoles(allowedRoles) : hasAnyRole(allowedRoles);
        if (!roleCheck) {
          setAuthState("UNAUTHORIZED");
          return;
        }
      }

      // Verificar si debe ser rol del sistema
      if (requireSystemRole && !isSystemRole()) {
        setAuthState("UNAUTHORIZED");
        return;
      }

      // Verificar permisos
      if (requiredPermissions.length > 0) {
        const permissionCheck = requireAllPermissions
          ? requiredPermissions.every((permission) => hasPermission(permission.resource, permission.action))
          : requiredPermissions.some((permission) => hasPermission(permission.resource, permission.action));

        if (!permissionCheck) {
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
  }, [
    user,
    isLoading,
    error,
    isAuthenticated,
    hasRestrictions,
    requiredPermissions,
    requireAllPermissions,
    allowedRoles,
    requireAllRoles,
    requireSystemRole,
    excludeRoles,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    isSystemRole,
    isExcludedRole,
  ]);

  // Renderizamos según el estado actual
  switch (authState) {
    case "LOADING":
      return <LoadingOverlay isLoading={true} fullScreen={false} />;
    case "AUTHORIZED":
      return <>{children}</>;
    case "UNAUTHORIZED":
      return hideOnUnauthorized ? null : <>{fallback}</>;
  }
}

// Componentes especializados para casos comunes

/**
 * Componente para proteger solo por permisos
 */
export const PermissionProtected = ({
  children,
  permissions,
  requireAll = false,
  fallback,
  hideOnUnauthorized = false,
  forceAuthorized = false, // Nueva prop para forzar autorización (excepciones)
}: {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
  forceAuthorized?: boolean; // Permite forzar autorización para excepciones
}) => {
  // Si forceAuthorized es true, renderizar directamente sin verificar permisos
  if (forceAuthorized) {
    return <>{children}</>;
  }

  return (
    <ProtectedComponent
      requiredPermissions={permissions}
      requireAllPermissions={requireAll}
      fallback={fallback || <div>No tiene permisos suficientes</div>}
      hideOnUnauthorized={hideOnUnauthorized}
    >
      {children}
    </ProtectedComponent>
  );
};

/**
 * Componente para proteger solo por roles
 */
export const RoleProtected = ({
  children,
  roles,
  requireAll = false,
  fallback,
  hideOnUnauthorized = false,
}: {
  children: ReactNode;
  roles: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}) => {
  return (
    <ProtectedComponent
      allowedRoles={roles}
      requireAllRoles={requireAll}
      fallback={fallback || <div>Acceso restringido por rol</div>}
      hideOnUnauthorized={hideOnUnauthorized}
    >
      {children}
    </ProtectedComponent>
  );
};

/**
 * Componente para proteger solo para roles del sistema
 */
export const SystemRoleProtected = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <ProtectedComponent isSystemRole={true} fallback={fallback || <div>Solo para roles del sistema</div>}>
      {children}
    </ProtectedComponent>
  );
};

/**
 * Componente para proteger excluyendo ciertos roles
 */
export const ExcludeRoleProtected = ({
  children,
  excludeRoles,
  fallback,
}: {
  children: ReactNode;
  excludeRoles: string[];
  fallback?: ReactNode;
}) => {
  return (
    <ProtectedComponent excludeRoles={excludeRoles} fallback={fallback || <div>Acceso restringido para este rol</div>}>
      {children}
    </ProtectedComponent>
  );
};

// Componentes para casos específicos basados en los roles del sistema

/**
 * Componente para MANAGEMENT (Gestión - Acceso total)
 */
export const ManagementProtected = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <RoleProtected roles={["MANAGEMENT"]} fallback={fallback || <div>Solo para gestión</div>}>
      {children}
    </RoleProtected>
  );
};

/**
 * Componente para PLANNER (Planificador)
 */
export const PlannerProtected = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <RoleProtected roles={["PLANNER"]} fallback={fallback || <div>Solo para planificadores</div>}>
      {children}
    </RoleProtected>
  );
};

/**
 * Componente para CONSULTANT (Consultor)
 */
export const ConsultantProtected = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <RoleProtected roles={["CONSULTANT"]} fallback={fallback || <div>Solo para consultores</div>}>
      {children}
    </RoleProtected>
  );
};

/**
 * Componente para MANAGEMENT y PLANNER
 */
export const ManagementOrPlannerProtected = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <RoleProtected
      roles={["MANAGEMENT", "PLANNER"]}
      fallback={fallback || <div>Solo para gestión y planificadores</div>}
    >
      {children}
    </RoleProtected>
  );
};

/**
 * Componente para todos los roles del sistema
 */
export const SystemRolesProtected = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <RoleProtected
      roles={["MANAGEMENT", "PLANNER", "CONSULTANT"]}
      fallback={fallback || <div>Solo para roles del sistema</div>}
    >
      {children}
    </RoleProtected>
  );
};

/**
 * Hook para verificar permisos específicos sin renderizar componentes
 * Útil para lógica condicional en otros componentes
 *
 * @example
 * // Verificar si el usuario tiene permisos de aprobación
 * const { hasAnyPermission } = usePermissionCheckHook();
 * const canApprove = hasAnyPermission([
 *   { resource: EnumResource.projects, action: EnumAction.update },
 *   { resource: EnumResource.projects, action: EnumAction.approve },
 * ]);
 *
 * @example
 * // Verificar un permiso específico
 * const { hasPermission } = usePermissionCheckHook();
 * const canEdit = hasPermission(EnumResource.users, EnumAction.update);
 *
 * @example
 * // Verificar roles
 * const { hasAnyRole, isSystemRole } = usePermissionCheckHook();
 * const isAdmin = hasAnyRole(['MANAGEMENT', 'ADMIN']);
 * const isSystemUser = isSystemRole();
 */
export const usePermissionCheckHook = () => {
  const { data: user, isLoading, error } = useMyProfile();

  const hasPermission = (resource: ResourceName, action: ActionName): boolean => {
    if (!user?.role?.permissions) return false;

    // Verificar si tiene el permiso específico
    const hasSpecificPermission = user.role.permissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );

    if (hasSpecificPermission) return true;

    // Verificar si tiene permiso wildcard en la acción para este recurso (resource:*)
    const hasActionWildcard = user.role.permissions.some(
      (permission) => permission.resource === resource && permission.action === "*"
    );

    if (hasActionWildcard) return true;

    // Verificar si tiene permiso wildcard completo (*:*)
    const hasFullWildcard = user.role.permissions.some(
      (permission) => permission.resource === "*" && permission.action === "*"
    );

    return hasFullWildcard;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission.resource, permission.action));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission.resource, permission.action));
  };

  const hasRole = (roleName: string): boolean => {
    if (!user?.role?.name) return false;
    return user.role.name.toLowerCase() === roleName.toLowerCase();
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  const isSystemRole = (): boolean => {
    return user?.role?.isSystem || false;
  };

  const isExcludedRole = (excludedRoles: string[]): boolean => {
    if (!user?.role?.name) return false;
    return excludedRoles.some((role) => hasRole(role));
  };

  return {
    user,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isSystemRole,
    isExcludedRole,
    isAuthenticated: !!user,
  };
};
