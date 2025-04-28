"use client";

import { Check, Loader2, Minus } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Separator } from "@/shared/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useRolePermissions } from "../_hooks/useRoles";
import { Role } from "../_types/roles";
import { groupedPermission, labelPermission } from "../_utils/groupedPermission";

interface RolePermissionsViewProps {
  role: Role;
}

export function RolePermissionsView({ role }: RolePermissionsViewProps) {
  const { data: permissions, isLoading, isError } = useRolePermissions(role.id);
  const groupedPermissions = groupedPermission(permissions || []);

  const allActions = Array.from(new Set(groupedPermissions.flatMap((p) => p.actions.map((a) => a.action))));

  // Verificar que el rol tenga un ID válido
  if (!role || !role.id) {
    return <AlertMessage title="Error" description="No se pudo obtener información del rol" variant="destructive" />;
  }
  // Mostrar información del rol aunque no se carguen los permisos
  return (
    <div className="py-4 bg-accent/50 px-2">
      <h3 className="font-medium mb-2 text-sm text-emerald-500">Información del Rol:</h3>
      <Separator className="my-4" />
      <div className="mb-4">
        <p>
          <strong>Nombre:</strong> <span className="capitalize">{role.name}</span>
        </p>
        <p>
          <strong>Descripción:</strong> <span className="first-letter:uppercase">{role.description}</span>
        </p>
      </div>
      <Separator className="my-4" />

      <h3 className="font-medium mb-2 text-sm text-emerald-500">Estado de Permisos:</h3>
      {isLoading && (
        <div className="py-2 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Cargando permisos...</span>
        </div>
      )}

      {isError && <AlertMessage title="Error" description="Error al cargar permisos" variant="destructive" />}

      {!isLoading && !isError && permissions && permissions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead rowSpan={2} className="w-[200px] font-semibold text-left border-r align-middle">
                    Módulos
                  </TableHead>
                  <TableHead colSpan={allActions.length} className="text-center font-semibold border-b">
                    Permisos
                  </TableHead>
                </TableRow>
                <TableRow>
                  {allActions.map((action) => (
                    <TableHead key={action} className="text-center capitalize font-medium text-sm py-2">
                      {labelPermission[action as keyof typeof labelPermission]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedPermissions.map(({ resource, actions }) => {
                  const actionSet = new Set(actions.map((a) => a.action));

                  return (
                    <TableRow key={resource}>
                      <TableCell className="font-medium text-start capitalize">{resource}</TableCell>
                      {allActions.map((action) => (
                        <TableCell key={action} className="text-end">
                          <div className="flex justify-center items-center">
                            {actionSet.has(action) ? (
                              <Check className="text-green-500 w-5 h-5" />
                            ) : (
                              <Minus className="text-gray-400 w-5 h-5" />
                            )}
                          </div>
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
