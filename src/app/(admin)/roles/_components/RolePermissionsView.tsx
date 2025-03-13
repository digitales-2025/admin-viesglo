"use client";

import { Loader2 } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { useRolePermissions } from "../_hooks/useRoles";
import { Role } from "../_types/roles";

interface RolePermissionsViewProps {
  role: Role;
}

export function RolePermissionsView({ role }: RolePermissionsViewProps) {
  const { data: permissions, isLoading, isError } = useRolePermissions(role.id);
  // Verificar que el rol tenga un ID válido
  if (!role || !role.id) {
    return <div className="py-4 text-red-500">Error: No se pudo obtener información del rol</div>;
  }
  // Mostrar información del rol aunque no se carguen los permisos
  return (
    <div className="py-4">
      <h3 className="font-medium mb-2 text-sm text-gray-700">Información del Rol:</h3>
      <div className="mb-4">
        <p>
          <strong>ID:</strong> {role.id}
        </p>
        <p>
          <strong>Nombre:</strong> {role.name}
        </p>
        <p>
          <strong>Descripción:</strong> {role.description}
        </p>
      </div>

      <h3 className="font-medium mb-2 text-sm text-gray-700">Estado de Permisos:</h3>
      {isLoading && (
        <div className="py-2 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Cargando permisos...</span>
        </div>
      )}

      {isError && <div className="py-2 text-red-500">Error al cargar permisos</div>}

      {!isLoading && !isError && permissions && permissions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <Badge key={permission.id} variant="secondary">
              {permission.name}
            </Badge>
          ))}
        </div>
      )}

      {!isLoading && !isError && (!permissions || permissions.length === 0) && (
        <div className="py-2 text-gray-500">Este rol no tiene permisos asignados</div>
      )}
    </div>
  );
}
