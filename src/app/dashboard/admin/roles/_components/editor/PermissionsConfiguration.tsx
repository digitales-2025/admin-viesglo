import { CheckSquare, Edit, Eye, Filter, Search, Settings } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PermissionForm, RoleForm } from "../../_schemas/roles.schemas";
import { GroupedPermission } from "../../_utils/roles.utils";
import { EnumAction, EnumResource } from "../../../settings/_types/roles.types";

interface PermissionsConfigurationProps {
  form: UseFormReturn<RoleForm>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPermissions: PermissionForm[];
  groupedPermissions: GroupedPermission[];
  openGroups: string[];
  setOpenGroups: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PermissionsConfiguration({
  form,
  searchTerm,
  setSearchTerm,
  currentPermissions,
  groupedPermissions,
  openGroups,
  setOpenGroups,
}: PermissionsConfigurationProps) {
  const allPermissions = groupedPermissions.flatMap((group) =>
    group.actions.map((action) => ({
      resource: group.resource as EnumResource,
      action: action.action as EnumAction,
    }))
  );

  const readPermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.read)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );

  const writePermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.write)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );

  const managePermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.manage)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );
  const allSelected = currentPermissions.length === allPermissions.length;

  const allReadSelected = readPermissions.every((perm) =>
    currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
  );

  const allWriteSelected = writePermissions.every((perm) =>
    currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
  );

  const allManageSelected = managePermissions.every((perm) =>
    currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
  );

  // Expandir/colapsar todos los grupos
  const toggleAllGroups = () => {
    if (openGroups.length === groupedPermissions.length) {
      setOpenGroups([]);
    } else {
      setOpenGroups(groupedPermissions.map((group) => group.resource));
    }
  };

  // Toggle para seleccionar/deseleccionar todos los permisos de un tipo específico
  const toggleByAction = (actionType: EnumAction) => {
    // Todos los permisos de ese tipo
    const actionPermissions = groupedPermissions.flatMap((group) =>
      group.actions
        .filter((action) => action.action === actionType)
        .map((action) => ({
          resource: group.resource as EnumResource,
          action: action.action as EnumAction,
        }))
    );

    const currentPermissions = form.getValues("permissions") || [];

    // Verificar si todos los permisos de este tipo ya están seleccionados
    const allActionPermissionsSelected = actionPermissions.every((perm) =>
      currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
    );

    if (allActionPermissionsSelected) {
      // Remover solo los de este tipo
      const newPermissions = currentPermissions.filter(
        (p) => !actionPermissions.some((ap) => ap.resource === p.resource && ap.action === p.action)
      );
      form.setValue("permissions", newPermissions);
    } else {
      // Agregar los que faltan
      const newPermissions = [
        ...currentPermissions,
        ...actionPermissions.filter(
          (perm) => !currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
        ),
      ];
      form.setValue("permissions", newPermissions);
    }
  };

  // Toggle para seleccionar/deseleccionar todos los permisos
  const toggleAllPermissions = () => {
    const currentPermissions = form.getValues("permissions") || [];
    const allPermissions = groupedPermissions.flatMap((group) =>
      group.actions.map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
    );

    if (currentPermissions.length === allPermissions.length) {
      // Si todos están seleccionados, deseleccionar todos
      form.setValue("permissions", []);
    } else {
      // Si no todos están seleccionados, seleccionar todos
      form.setValue("permissions", allPermissions);
    }
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda mejorada */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar recursos o permisos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
        />
      </div>

      {/* Acciones rápidas mejoradas con toggle */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Acciones rápidas</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={allSelected ? "default" : "outline"}
            size="sm"
            onClick={toggleAllPermissions}
            className={cn(
              "h-8 text-xs transition-all",
              allSelected && "bg-emerald-500 hover:bg-emerald-600 text-white"
            )}
          >
            <CheckSquare className="w-3 h-3 mr-1" />
            {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </Button>

          <Button
            type="button"
            variant={allReadSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.read)}
            className={cn("h-8 text-xs transition-all", allReadSelected && "bg-blue-500 hover:bg-blue-600 text-white")}
          >
            <Eye className="w-3 h-3 mr-1" />
            {allReadSelected ? "Quitar lectura" : "Solo lectura"}
          </Button>

          <Button
            type="button"
            variant={allWriteSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.write)}
            className={cn(
              "h-8 text-xs transition-all",
              allWriteSelected && "bg-yellow-500 hover:bg-yellow-600 text-white"
            )}
          >
            <Edit className="w-3 h-3 mr-1" />
            {allWriteSelected ? "Quitar escritura" : "Escritura"}
          </Button>

          <Button
            type="button"
            variant={allManageSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.manage)}
            className={cn(
              "h-8 text-xs transition-all",
              allManageSelected && "bg-green-500 hover:bg-green-600 text-white"
            )}
          >
            <Settings className="w-3 h-3 mr-1" />
            {allManageSelected ? "Quitar gestión" : "Gestión"}
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={toggleAllGroups} className="h-8 text-xs ml-auto">
            <Filter className="w-3 h-3 mr-1" />
            {openGroups.length === groupedPermissions.length ? "Colapsar todo" : "Expandir todo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
