"use client";

import { Edit, MoreHorizontal, RotateCcw, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useToggleActiveRole } from "../_hooks/useRoles";
import { Role } from "../_types/roles";

interface RolesTableActionsProps {
  row: Role;
}

export function RolesTableActions({ row }: RolesTableActionsProps) {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "roles";

  const handleEdit = () => {
    open(MODULE, "edit", row);
  };

  const handleDelete = () => {
    open(MODULE, "delete", row);
  };

  const { mutate: toggleActiveRole, isPending: isTogglingActive } = useToggleActiveRole();

  const handleToggleActive = () => {
    toggleActiveRole(row.id);
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
          <>
            <DropdownMenuItem onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="mr-2 h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
          <>
            {row.isActive ? (
              <DropdownMenuItem onClick={handleDelete} disabled={!row.isActive}>
                Eliminar
                <DropdownMenuShortcut>
                  <Trash className="mr-2 h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleToggleActive} disabled={row.isActive || isTogglingActive}>
                Reactivar
                <DropdownMenuShortcut>
                  <RotateCcw className="mr-2 h-4 w-4 text-yellow-600" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
          </>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
