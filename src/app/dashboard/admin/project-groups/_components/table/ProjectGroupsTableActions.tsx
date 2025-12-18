"use client";

import React, { useState } from "react";
import { Edit, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected, usePermissionCheckHook } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDeleteProjectGroup, useReactivateProjectGroup } from "../../_hooks/use-project-groups";
import { ProjectGroupResponseDto } from "../../_types/project-groups.types";

interface ProjectGroupsTableActionsProps {
  projectGroup: ProjectGroupResponseDto;
  onEdit?: (projectGroup: ProjectGroupResponseDto) => void;
}

export function ProjectGroupsTableActions({ projectGroup, onEdit }: ProjectGroupsTableActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  const deleteMutation = useDeleteProjectGroup();
  const reactivateMutation = useReactivateProjectGroup();
  const { hasAnyPermission } = usePermissionCheckHook();

  // Verificar si tiene al menos uno de los permisos necesarios para mostrar el menú
  const canShowMenu = hasAnyPermission([
    { resource: EnumResource.projectResources, action: EnumAction.read },
    { resource: EnumResource.projectResources, action: EnumAction.create },
    { resource: EnumResource.projects, action: EnumAction.update },
    { resource: EnumResource.projects, action: EnumAction.delete },
    { resource: EnumResource.projects, action: EnumAction.reactivate },
  ]);

  const handleEdit = () => {
    onEdit?.(projectGroup);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        params: { path: { id: projectGroup.id } },
      });
      setShowDeleteDialog(false);
    } catch (_error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync({
        params: { path: { id: projectGroup.id } },
      });
      setShowReactivateDialog(false);
    } catch (_error) {
      // Error handling is done in the mutation hook
    }
  };

  // Si no tiene permisos para ninguna acción, no mostrar el menú
  if (!canShowMenu) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <PermissionProtected
            permissions={[{ resource: EnumResource.projects, action: EnumAction.update }]}
            hideOnUnauthorized={true}
          >
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          </PermissionProtected>
          {projectGroup.isActive ? (
            <PermissionProtected
              permissions={[{ resource: EnumResource.projects, action: EnumAction.delete }]}
              hideOnUnauthorized={true}
            >
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </PermissionProtected>
          ) : (
            <PermissionProtected
              permissions={[{ resource: EnumResource.projects, action: EnumAction.reactivate }]}
              hideOnUnauthorized={true}
            >
              <DropdownMenuItem onClick={() => setShowReactivateDialog(true)} className="text-green-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivar
              </DropdownMenuItem>
            </PermissionProtected>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleConfirm={handleDelete}
        title="¿Eliminar grupo de proyectos?"
        desc={`¿Estás seguro de que quieres eliminar el grupo "${projectGroup.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
        isLoading={deleteMutation.isPending}
        destructive
      />

      <ConfirmDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
        handleConfirm={handleReactivate}
        title="¿Reactivar grupo de proyectos?"
        desc={`¿Estás seguro de que quieres reactivar el grupo "${projectGroup.name}"?`}
        confirmText="Reactivar"
        cancelBtnText="Cancelar"
        isLoading={reactivateMutation.isPending}
      />
    </>
  );
}
