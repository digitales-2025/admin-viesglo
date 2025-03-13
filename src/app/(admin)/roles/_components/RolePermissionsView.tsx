"use client";

import { Check, Loader2, Minus } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useRolePermissions } from "../_hooks/useRoles";
import { Role } from "../_types/roles";
import { groupedPermission } from "../_utils/groupedPermission";

interface RolePermissionsViewProps {
  role: Role;
}

export function RolePermissionsView({ role }: RolePermissionsViewProps) {
  const { data: permissions, isLoading, isError } = useRolePermissions(role.id);
  const groupedPermissions = groupedPermission(permissions || []);

  const allActions = Array.from(new Set(groupedPermissions.flatMap((p) => p.actions.map((a) => a.action))));

  // Verificar que el rol tenga un ID válido
  if (!role || !role.id) {
    return <div className="py-4 text-red-500">Error: No se pudo obtener información del rol</div>;
  }
  // Mostrar información del rol aunque no se carguen los permisos
  return (
    <div className="py-4">
      <h3 className="font-medium mb-2 text-sm text-gray-700 dark:text-gray-300">Información del Rol:</h3>
      <div className="mb-4">
        <p>
          <strong>Nombre:</strong> {role.name}
        </p>
        <p>
          <strong>Descripción:</strong> {role.description}
        </p>
      </div>

      <h3 className="font-medium mb-2 text-sm text-gray-700 dark:text-gray-300">Estado de Permisos:</h3>
      {isLoading && (
        <div className="py-2 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Cargando permisos...</span>
        </div>
      )}

      {isError && <div className="py-2 text-red-500">Error al cargar permisos</div>}

      {!isLoading && !isError && permissions && permissions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Recurso</TableHead>
                  {allActions.map((action) => (
                    <TableHead key={action} className="text-start capitalize">
                      {action}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedPermissions.map(({ resource, actions }) => {
                  const actionSet = new Set(actions.map((a) => a.action));

                  return (
                    <TableRow key={resource}>
                      <TableCell className="font-medium">{resource}</TableCell>
                      {allActions.map((action) => (
                        <TableCell key={action} className="text-center">
                          {actionSet.has(action) ? (
                            <Check className="text-green-500 w-5 h-5" />
                          ) : (
                            <Minus className="text-gray-400 w-5 h-5" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!isLoading && !isError && (!permissions || permissions.length === 0) && (
        <div className="py-2 text-gray-500">Este rol no tiene permisos asignados</div>
      )}
    </div>
  );
}
