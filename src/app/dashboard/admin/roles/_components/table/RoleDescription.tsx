"use client";

import { Check, Loader2, X } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Badge } from "@/shared/components/ui/badge";
import { useRoleDetail } from "../../_hooks/use-roles";
import type { RoleListItem } from "../../../settings/_types/roles.types";
import { actionColors, resourceIcons, translateAction, translateResource } from "../../../users/_utils/user.utils";

interface RoleDescriptionProps {
  row: RoleListItem;
}

export function RoleDescription({ row }: RoleDescriptionProps) {
  const { data: roleDetail, isLoading, isError } = useRoleDetail(row.id);

  const permissions = roleDetail?.permissions ?? [];

  // Crear matriz de todos los recursos y acciones posibles
  const allResources = Object.keys(resourceIcons);
  const allActions = Object.keys(actionColors);

  // Crear set de permisos existentes para lookup rápido
  const permissionSet = new Set(permissions.map((p) => `${p.resource}:${p.action}`));

  if (!row || !row.id) {
    return <AlertMessage title="Error" description="No se pudo obtener información del rol" variant="destructive" />;
  }

  const hasFullAccess = permissions.some((p) => p.resource === "*" && p.action === ("*" as unknown));
  const recursosConAcceso = hasFullAccess
    ? allResources.length
    : allResources.filter((resource) => allActions.some((action) => permissionSet.has(`${resource}:${action}`))).length;
  const permisosTotales = hasFullAccess ? allResources.length * allActions.length : permissions.length;
  const coberturaPermisos = hasFullAccess
    ? 100
    : Math.round((permissions.length / (allResources.length * allActions.length)) * 100);

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-900">
      {/* Header minimalista */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-xl font-bold capitalize text-gray-900 dark:text-gray-100">{row.name.toLowerCase()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{row.description}</p>
        </div>
        <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Activo" : "Inactivo"}</Badge>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Cargando matriz de permisos...</span>
        </div>
      )}

      {isError && <AlertMessage title="Error" description="Error al cargar permisos" variant="destructive" />}

      {!isLoading && !isError && (
        <div className="w-full space-y-6">
          {/* Matriz de permisos - diseño innovador que ocupa toda la pantalla */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-full">
              {/* Header de acciones */}
              <div className="flex mb-4">
                <div className="flex-shrink-0" style={{ width: "280px" }}></div>
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {allActions.map((action) => (
                    <div key={action} className="text-center">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translateAction(action)}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">{action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filas de recursos */}
              <div className="space-y-2">
                {allResources
                  .filter((resource) => allActions.some((action) => permissionSet.has(`${resource}:${action}`)))
                  .map((resource) => {
                    const IconComponent = resourceIcons[resource as keyof typeof resourceIcons];
                    const hasAnyPermission = allActions.some((action) => permissionSet.has(`${resource}:${action}`));

                    return (
                      <div
                        key={resource}
                        className={`flex items-center py-4 px-4 rounded-lg border transition-all ${
                          hasAnyPermission
                            ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60"
                        }`}
                      >
                        {/* Recurso */}
                        <div className="flex-shrink-0 flex items-center gap-3" style={{ width: "280px" }}>
                          {IconComponent && <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {translateResource(resource)}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">{resource}</div>
                          </div>
                        </div>

                        {/* Matriz de permisos que ocupa el resto del espacio */}
                        <div className="flex-1 grid grid-cols-5 gap-2">
                          {allActions.map((action) => {
                            const hasPermission = permissionSet.has(`${resource}:${action}`);
                            const colorClasses = actionColors[action as keyof typeof actionColors];

                            return (
                              <div key={action} className="flex justify-center">
                                <div
                                  className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                ${
                                  hasPermission
                                    ? `${colorClasses} border-current`
                                    : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                }
                              `}
                                >
                                  {hasPermission ? (
                                    <Check className="w-5 h-5" />
                                  ) : (
                                    <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{recursosConAcceso}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recursos con acceso</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{permisosTotales}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permisos totales</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{coberturaPermisos}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cobertura de permisos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
