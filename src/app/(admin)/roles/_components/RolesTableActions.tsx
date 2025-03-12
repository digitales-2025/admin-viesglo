"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteRole } from "../_hooks/useRoles";
import { Role } from "../_types/roles";

interface RolesTableActionsProps {
  row: Role;
}

export function RolesTableActions({ row }: RolesTableActionsProps) {
  const { open } = useDialogStore();
  const { mutate: deleteRole } = useDeleteRole();

  // Constante para módulo
  const MODULE = "roles";

  const handleEdit = () => {
    open(MODULE, "edit", row);
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol "${row.name}"?`)) {
      deleteRole(row.id, {
        onSuccess: () => {
          toast.success("Rol eliminado correctamente");
        },
        onError: (error) => {
          toast.error(`Error al eliminar el rol: ${error.message}`);
        },
      });
    }
  };

  return (
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
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
