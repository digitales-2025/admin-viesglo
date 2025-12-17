import { ChevronDown, Circle, Sparkles } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { PermissionForm, RoleForm } from "../../_schemas/roles.schemas";
import { GroupedPermission, labelResource, resourceIcons, translateAction } from "../../_utils/roles.utils";
import { EnumAction, EnumResource } from "../../../settings/_types/roles.types";

interface PermissionsRolesFormProps {
  form: UseFormReturn<RoleForm>;
  groupedPermissions: GroupedPermission[];
  searchTerm: string;
  currentPermissions: PermissionForm[];
  openGroups: string[];
  setOpenGroups: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PermissionsRolesForm({
  form,
  groupedPermissions,
  searchTerm,
  currentPermissions,
  openGroups,
  setOpenGroups,
}: PermissionsRolesFormProps) {
  // Filtrar permisos por búsqueda
  const filteredGroups = groupedPermissions.filter((group) => {
    if (!searchTerm) return true;
    const resourceName = labelResource[group.resource as keyof typeof labelResource] || group.resource;
    return (
      resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.actions.some((action) => translateAction(action.action).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Verificar si tiene permiso wildcard para un recurso (resource:*)
  const hasWildcardPermission = (resource: string): boolean => {
    return currentPermissions.some((perm) => perm.resource === resource && perm.action === EnumAction.wildcard);
  };

  // Verificar si tiene todos los permisos individuales de un grupo
  const hasAllIndividualPermissions = (groupActions: { action: string }[], resource: string): boolean => {
    // Excluir wildcard de la verificación
    const individualActions = groupActions.filter((a) => a.action !== EnumAction.wildcard);
    if (individualActions.length === 0) return false;

    return individualActions.every((action) =>
      currentPermissions.some((perm) => perm.resource === resource && perm.action === action.action)
    );
  };

  // Contar permisos seleccionados (wildcard cuenta como todos)
  const countSelectedPermissions = (groupActions: { action: string }[], resource: string): number => {
    if (hasWildcardPermission(resource)) {
      return groupActions.filter((a) => a.action !== EnumAction.wildcard).length;
    }
    return groupActions.filter(
      (action) =>
        action.action !== EnumAction.wildcard &&
        currentPermissions.some((perm) => perm.resource === resource && perm.action === action.action)
    ).length;
  };

  // Manejar cambio del checkbox grupal (wildcard)
  const handleGroupWildcardChange = (checked: boolean, resource: EnumResource) => {
    const current = form.getValues("permissions") || [];

    if (checked) {
      // Agregar wildcard y remover permisos individuales del recurso
      const withoutResourcePerms = current.filter((p) => p.resource !== resource);
      form.setValue("permissions", [...withoutResourcePerms, { resource, action: EnumAction.wildcard }]);
    } else {
      // Remover wildcard del recurso
      const withoutWildcard = current.filter((p) => !(p.resource === resource && p.action === EnumAction.wildcard));
      form.setValue("permissions", withoutWildcard);
    }
  };

  // Manejar cambio de permiso individual
  const handlePermissionChange = (
    checked: boolean,
    permission: { resource: EnumResource; action: EnumAction },
    groupActions: { action: string }[]
  ) => {
    const current = form.getValues("permissions") || [];

    // Si tiene wildcard, primero expandir a permisos individuales
    if (hasWildcardPermission(permission.resource)) {
      const withoutWildcard = current.filter(
        (p) => !(p.resource === permission.resource && p.action === EnumAction.wildcard)
      );
      // Agregar todos los permisos individuales excepto el que se está deseleccionando
      const individualPerms = groupActions
        .filter((a) => a.action !== EnumAction.wildcard && a.action !== permission.action)
        .map((a) => ({ resource: permission.resource, action: a.action as EnumAction }));
      form.setValue("permissions", [...withoutWildcard, ...individualPerms]);
      return;
    }

    if (checked) {
      const newPerms = [...current, permission];
      // Obtener acciones individuales (sin wildcard)
      const allIndividualActions = groupActions.filter((a) => a.action !== EnumAction.wildcard).map((a) => a.action);

      // Verificar si tiene TODAS las acciones individuales
      const resourcePerms = newPerms.filter(
        (p) => p.resource === permission.resource && p.action !== EnumAction.wildcard
      );
      const hasAll = allIndividualActions.every((action) => resourcePerms.some((p) => p.action === action));

      if (hasAll) {
        // Convertir a wildcard
        const withoutResourcePerms = newPerms.filter((p) => p.resource !== permission.resource);
        form.setValue("permissions", [
          ...withoutResourcePerms,
          { resource: permission.resource, action: EnumAction.wildcard },
        ]);
      } else {
        form.setValue("permissions", newPerms);
      }
    } else {
      form.setValue(
        "permissions",
        current.filter((p) => !(p.resource === permission.resource && p.action === permission.action))
      );
    }
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => (prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]));
  };

  return (
    <FormField
      control={form.control}
      name="permissions"
      render={() => (
        <FormItem>
          <div className="space-y-3">
            {filteredGroups.map((group) => {
              const resource = group.resource as EnumResource;
              const hasWildcard = hasWildcardPermission(resource);
              const hasAllPerms = hasAllIndividualPermissions(group.actions, resource);
              const isGroupChecked = hasWildcard || hasAllPerms;
              const selectedCount = countSelectedPermissions(group.actions, resource);
              const totalActions = group.actions.filter((a) => a.action !== EnumAction.wildcard).length;

              return (
                <Collapsible
                  key={group.resource}
                  open={openGroups.includes(group.resource)}
                  onOpenChange={() => toggleGroup(group.resource)}
                  className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                        isGroupChecked &&
                          "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`group-${group.resource}`}
                          checked={isGroupChecked}
                          onCheckedChange={(checked) => handleGroupWildcardChange(!!checked, resource)}
                          className={cn(
                            "data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500",
                            "border-gray-300 dark:border-gray-600 transition-colors"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = resourceIcons[group.resource as keyof typeof resourceIcons];
                            return IconComponent ? (
                              <IconComponent
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-colors",
                                  isGroupChecked ? "text-emerald-600" : "text-gray-500"
                                )}
                              />
                            ) : (
                              <Circle
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-colors",
                                  isGroupChecked ? "text-emerald-600" : "text-gray-500"
                                )}
                              />
                            );
                          })()}
                          <Label
                            htmlFor={`group-${group.resource}`}
                            className={cn(
                              "font-medium cursor-pointer transition-colors text-sm",
                              isGroupChecked && "text-emerald-700 dark:text-emerald-400"
                            )}
                          >
                            {labelResource[group.resource as keyof typeof labelResource] || group.resource}
                          </Label>
                          {hasWildcard && (
                            <Badge
                              variant="outline"
                              className="text-xs h-5 bg-purple-100 text-purple-700 border-purple-200"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Acceso total
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isGroupChecked ? "default" : "outline"}
                          className={cn(
                            "text-xs h-5",
                            isGroupChecked && "bg-emerald-100 text-emerald-800 border-emerald-200",
                            hasWildcard && "bg-purple-100 text-purple-800 border-purple-200"
                          )}
                        >
                          {hasWildcard ? `${totalActions}/${totalActions}` : `${selectedCount}/${totalActions}`}
                        </Badge>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openGroups.includes(group.resource) && "transform rotate-180",
                            isGroupChecked ? "text-emerald-600" : "text-gray-400"
                          )}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Separator className={cn(isGroupChecked && "bg-emerald-200 dark:bg-emerald-800")} />
                    <div className={cn("p-3 space-y-2", isGroupChecked && "bg-emerald-50/30 dark:bg-emerald-950/10")}>
                      {group.actions
                        .filter((permission) => permission.action !== EnumAction.wildcard)
                        .map((permission) => {
                          const permissionObj = {
                            resource: resource,
                            action: permission.action as EnumAction,
                          };
                          // Si tiene wildcard, todos los checkboxes individuales están marcados
                          const isChecked =
                            hasWildcard ||
                            currentPermissions.some(
                              (perm) => perm.resource === permissionObj.resource && perm.action === permissionObj.action
                            );

                          return (
                            <FormItem
                              key={permission.action}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  id={`${group.resource}-${permission.action}`}
                                  className={cn(
                                    "cursor-pointer data-[state=checked]:bg-emerald-500",
                                    "data-[state=checked]:text-white transition-colors data-[state=checked]:border-emerald-500",
                                    "border-emerald-400"
                                  )}
                                  checked={isChecked}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(!!checked, permissionObj, group.actions)
                                  }
                                />
                              </FormControl>
                              <label
                                htmlFor={`${group.resource}-${permission.action}`}
                                className={cn(
                                  "text-sm text-gray-600 dark:text-gray-400 leading-none cursor-pointer",
                                  isChecked && "font-medium text-emerald-700 dark:text-emerald-400"
                                )}
                              >
                                {translateAction(permission.action)}
                              </label>
                            </FormItem>
                          );
                        })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
