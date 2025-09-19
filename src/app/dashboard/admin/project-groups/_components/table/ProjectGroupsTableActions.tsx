"use client";

import React, { useState } from "react";
import { Edit, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";

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

  const handleEdit = () => {
    onEdit?.(projectGroup);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(projectGroup.id);
      setShowDeleteDialog(false);
    } catch (_error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync(projectGroup.id);
      setShowReactivateDialog(false);
    } catch (_error) {
      // Error handling is done in the mutation hook
    }
  };

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
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {projectGroup.isActive ? (
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowReactivateDialog(true)} className="text-green-600">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reactivar
            </DropdownMenuItem>
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
