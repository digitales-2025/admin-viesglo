import { ChevronDown, Circle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { PermissionForm, RoleForm } from "../../_schemas/roles.schemas";
import { handleGroupCheckboxChange, handlePermissionChange } from "../../_utils/roles-handler.utils";
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

  const hasActivePermissionsBesidesRead = (
    groupActions: { resource: EnumResource; action: EnumAction }[],
    readPermission: { resource: EnumResource; action: EnumAction } | null
  ) => {
    if (!readPermission) return false;
    const currentPermissions = form.getValues("permissions") || [];
    return groupActions.some(
      (action) =>
        !(action.resource === readPermission.resource && action.action === readPermission.action) &&
        currentPermissions.some((perm) => perm.resource === action.resource && perm.action === action.action)
    );
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
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredGroups.map((group) => {
              // Construir acciones del grupo en formato { resource, action }
              const groupActionsForHandlers = group.actions.map((a) => ({
                resource: group.resource as EnumResource,
                action: a.action as EnumAction,
              }));

              // Permiso de lectura del grupo en formato { resource, action }
              const readPermission = group.actions.find(
                (action) => action.action === EnumAction.read || action.action === "read"
              );
              const readPermissionObj = readPermission
                ? { resource: group.resource as EnumResource, action: readPermission.action as EnumAction }
                : null;

              const isReadChecked = readPermissionObj
                ? currentPermissions.some(
                    (perm) => perm.resource === readPermissionObj.resource && perm.action === readPermissionObj.action
                  )
                : false;

              const hasOtherActivePermissions = hasActivePermissionsBesidesRead(
                groupActionsForHandlers,
                readPermissionObj
              );

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
                        isReadChecked &&
                          "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`group-${group.resource}`}
                          checked={isReadChecked}
                          onCheckedChange={(checked) =>
                            handleGroupCheckboxChange(!!checked, groupActionsForHandlers, form)
                          }
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
                                  isReadChecked ? "text-emerald-600" : "text-gray-500"
                                )}
                              />
                            ) : (
                              <Circle
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-colors",
                                  isReadChecked ? "text-emerald-600" : "text-gray-500"
                                )}
                              />
                            );
                          })()}
                          <Label
                            htmlFor={`group-${group.resource}`}
                            className={cn(
                              "font-medium cursor-pointer transition-colors text-sm",
                              isReadChecked && "text-emerald-700 dark:text-emerald-400"
                            )}
                          >
                            {labelResource[group.resource as keyof typeof labelResource] || group.resource}
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isReadChecked ? "default" : "outline"}
                          className={cn(
                            "text-xs h-5",
                            isReadChecked && "bg-emerald-100 text-emerald-800 border-emerald-200",
                            hasOtherActivePermissions && "bg-emerald-200 text-emerald-900"
                          )}
                        >
                          {
                            groupActionsForHandlers.filter((p) =>
                              currentPermissions.some(
                                (perm) => perm.resource === p.resource && perm.action === p.action
                              )
                            ).length
                          }
                          /{group.actions.length}
                        </Badge>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openGroups.includes(group.resource) && "transform rotate-180",
                            isReadChecked ? "text-emerald-600" : "text-gray-400"
                          )}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Separator className={cn(isReadChecked && "bg-emerald-200 dark:bg-emerald-800")} />
                    <div className={cn("p-3 space-y-2", isReadChecked && "bg-emerald-50/30 dark:bg-emerald-950/10")}>
                      {group.actions
                        .filter((permission) => permission.action !== EnumAction.read)
                        .map((permission) => {
                          const permissionObj = {
                            resource: group.resource as EnumResource,
                            action: permission.action as EnumAction,
                          };
                          const isChecked = currentPermissions.some(
                            (perm) => perm.resource === permissionObj.resource && perm.action === permissionObj.action
                          );
                          const isDisabled = !isReadChecked;

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
                                    "border-emerald-400",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                  )}
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked) => handlePermissionChange(!!checked, permissionObj, form)}
                                />
                              </FormControl>
                              <label
                                htmlFor={`${group.resource}-${permission.action}`}
                                className={cn(
                                  "text-sm text-gray-600 dark:text-gray-400 leading-none cursor-pointer",
                                  isChecked && "font-medium text-emerald-700 dark:text-emerald-400",
                                  isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {translateAction(permission.action)}
                              </label>
                              <FormMessage />
                            </FormItem>
                          );
                        })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </FormItem>
      )}
    />
  );
}
