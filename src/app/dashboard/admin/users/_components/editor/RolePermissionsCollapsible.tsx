import { useEffect } from "react";
import { ChevronDown, ChevronRight, Lock, Settings, Shield } from "lucide-react";

import { Loading } from "@/shared/components/loading";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { cn } from "@/shared/lib/utils";
import { actionColors, resourceIcons, translateAction, translateResource } from "../../_utils/user.utils";
import { Roles } from "../../../settings/_types/roles.types";

interface Props {
  showPermissions: boolean;
  setShowPermissions: (visible: boolean) => void;
  selectedRole?: Roles;
  isLoading?: boolean;
}

export default function RolePermissionsCollapsible({
  showPermissions,
  setShowPermissions,
  selectedRole,
  isLoading = false,
}: Props) {
  // Console log de permisos
  useEffect(() => {
    if (selectedRole?.permissions) {
      console.log(
        "🔐 [RolePermissionsCollapsible] Permisos del rol:",
        JSON.stringify(selectedRole.permissions, null, 2)
      );
    }
  }, [selectedRole?.permissions]);

  if (!selectedRole) return null;

  return (
    <Collapsible open={showPermissions} onOpenChange={setShowPermissions}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="justify-between transition-all duration-200 hover:bg-muted/50 dark:hover:bg-muted/30 bg-transparent dark:bg-transparent h-9 w-full rounded-md border border-input dark:border-input"
          type="button"
          disabled={isLoading}
        >
          <span className="flex items-center gap-2 text-foreground dark:text-foreground">
            <Settings className="w-4 h-4" />
            Permisos del rol: {selectedRole?.name || ""}
          </span>
          {showPermissions ? (
            <ChevronDown className="w-4 h-4 opacity-50 dark:opacity-70" />
          ) : (
            <ChevronRight className="w-4 h-4 opacity-50 dark:opacity-70" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-3">
        {isLoading ? (
          <Loading text="Cargando permisos del rol..." variant="spinner" size="md" />
        ) : selectedRole ? (
          <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border dark:border-border">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-sm text-foreground dark:text-foreground">Permisos asignados</span>
              <Badge variant="secondary" className="text-xs dark:bg-secondary/50">
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
                      isWildcard
                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
                        : "bg-white dark:bg-muted/30 border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-md",
                          isWildcard ? "bg-purple-100 dark:bg-purple-900/40" : "bg-gray-100 dark:bg-muted"
                        )}
                      >
                        <ResourceIcon
                          className={cn(
                            "w-4 h-4",
                            isWildcard ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"
                          )}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm capitalize text-foreground dark:text-foreground">
                          {permission.resource === "*"
                            ? "Todos los recursos"
                            : translateResource(permission.resource ?? "")}
                        </span>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {permission.action === "*"
                            ? "Acceso completo"
                            : `Acción: ${translateAction(permission.action ?? "")}`}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs border dark:border-border",
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
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Rol de Sistema</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400/80 mt-1">
                  Este rol tiene privilegios administrativos completos del sistema.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
