import { CheckSquare, Edit, Eye, Filter, Plus, Search, Trash2 } from "lucide-react";
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

  // Permisos de lectura (read)
  const readPermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.read)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );

  // Permisos de creación (create)
  const createPermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.create)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );

  // Permisos de actualización (update)
  const updatePermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.update)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );

  // Permisos de eliminación (delete)
  const deletePermissions = groupedPermissions.flatMap((group) =>
    group.actions
      .filter((action) => action.action === EnumAction.delete)
      .map((action) => ({
        resource: group.resource as EnumResource,
        action: action.action as EnumAction,
      }))
  );

  const allSelected = currentPermissions.length === allPermissions.length;

  const allReadSelected =
    readPermissions.length > 0 &&
    readPermissions.every((perm) =>
      currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
    );

  const allCreateSelected =
    createPermissions.length > 0 &&
    createPermissions.every((perm) =>
      currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
    );

  const allUpdateSelected =
    updatePermissions.length > 0 &&
    updatePermissions.every((perm) =>
      currentPermissions.some((p) => p.resource === perm.resource && p.action === perm.action)
    );

  const allDeleteSelected =
    deletePermissions.length > 0 &&
    deletePermissions.every((perm) =>
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
          className="pl-10 text-sm"
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
            className={cn("h-8 text-xs transition-all", allSelected && "bg-primary hover:bg-primary/80 text-white")}
          >
            <CheckSquare className="w-3 h-3 mr-1" />
            {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </Button>

          <Button
            type="button"
            variant={allReadSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.read)}
            className={cn("h-8 text-xs transition-all", allReadSelected && "bg-primary hover:bg-primary/80 text-white")}
          >
            <Eye className="w-3 h-3 mr-1" />
            {allReadSelected ? "Quitar lectura" : "Solo lectura"}
          </Button>

          <Button
            type="button"
            variant={allCreateSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.create)}
            className={cn(
              "h-8 text-xs transition-all",
              allCreateSelected && "bg-primary hover:bg-primary/80 text-white"
            )}
          >
            <Plus className="w-3 h-3 mr-1" />
            {allCreateSelected ? "Quitar crear" : "Crear"}
          </Button>

          <Button
            type="button"
            variant={allUpdateSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.update)}
            className={cn(
              "h-8 text-xs transition-all",
              allUpdateSelected && "bg-primary hover:bg-primary/80 text-white"
            )}
          >
            <Edit className="w-3 h-3 mr-1" />
            {allUpdateSelected ? "Quitar editar" : "Editar"}
          </Button>

          <Button
            type="button"
            variant={allDeleteSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleByAction(EnumAction.delete)}
            className={cn(
              "h-8 text-xs transition-all",
              allDeleteSelected && "bg-primary hover:bg-primary/80 text-white"
            )}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {allDeleteSelected ? "Quitar eliminar" : "Eliminar"}
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
