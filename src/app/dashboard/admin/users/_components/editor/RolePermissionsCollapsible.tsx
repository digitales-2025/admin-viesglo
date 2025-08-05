import { ChevronDown, ChevronRight, Lock, Settings, Shield } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { cn } from "@/shared/lib/utils";
import { actionColors, resourceIcons, translateAction, translateResource } from "../../_utils/user.utils";
import { Roles } from "../../../settings/_types/roles.types";

interface Props {
  showPermissions: boolean;
  setShowPermissions: (visible: boolean) => void;
  selectedRole: Roles;
}

export default function RolePermissionsCollapsible({ showPermissions, setShowPermissions, selectedRole }: Props) {
  if (!selectedRole) return null;

  return (
    <Collapsible open={showPermissions} onOpenChange={setShowPermissions}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="justify-between transition-all duration-200 hover:bg-muted/50 bg-transparent h-9 w-full rounded-md border border-input"
          type="button"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Permisos del rol: {selectedRole.name}
          </span>
          {showPermissions ? (
            <ChevronDown className="w-4 h-4 opacity-50" />
          ) : (
            <ChevronRight className="w-4 h-4 opacity-50" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-3">
        <div className="bg-muted/30 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Permisos asignados</span>
            <Badge variant="secondary" className="text-xs">
              {selectedRole.permissions.length} permisos
            </Badge>
          </div>

          <div className="grid gap-2">
            {selectedRole.permissions.map((permission, index) => {
              const ResourceIcon = resourceIcons[permission.resource as keyof typeof resourceIcons] || Settings;
              const isWildcard = permission.resource === "*" || permission.action === "*";

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md border transition-all duration-200",
                    isWildcard ? "bg-purple-50 border-purple-200" : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-md", isWildcard ? "bg-purple-100" : "bg-gray-100")}>
                      <ResourceIcon className={cn("w-4 h-4", isWildcard ? "text-purple-600" : "text-gray-600")} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm capitalize">
                        {permission.resource === "*"
                          ? "Todos los recursos"
                          : translateResource(permission.resource ?? "")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {permission.action === "*"
                          ? "Acceso completo"
                          : `Acción: ${translateAction(permission.action ?? "")}`}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs border",
                      actionColors[permission.action as keyof typeof actionColors] || actionColors["*"]
                    )}
                    variant="outline"
                  >
                    {permission.action === "*" ? "TOTAL" : translateAction(permission.action ?? "").toUpperCase()}
                  </Badge>
                </div>
              );
            })}
          </div>

          {selectedRole.isSystem && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Rol de Sistema</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Este rol tiene privilegios administrativos completos del sistema.
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
