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
import { useToggleActiveUser } from "../_hooks/useUsers";
import { User } from "../_types/user.types";

interface UsersTableActionsProps {
  row: User;
}

export function UsersTableActions({ row }: UsersTableActionsProps) {
  const { open } = useDialogStore();

  const { mutate: reactivateUser, isPending: isReactivating } = useToggleActiveUser();

  // Constante para módulo
  const MODULE = "users";

  const handleReactivateUser = () => {
    reactivateUser(row.id);
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
        <DropdownMenuItem onClick={() => open(MODULE, "edit", row)}>
          Editar
          <DropdownMenuShortcut>
            <Edit className="size-4 mr-2" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {row.isActive ? (
          <DropdownMenuItem onClick={() => open(MODULE, "delete", row)} disabled={!row.isActive}>
            Eliminar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleReactivateUser} disabled={row.isActive || isReactivating}>
            Reactivar
            <DropdownMenuShortcut>
              <RotateCcw className="size-4 mr-2 text-yellow-600" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
