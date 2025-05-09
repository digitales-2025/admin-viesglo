"use client";

import { Edit, MoreHorizontal, RotateCcw, Trash } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
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
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

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
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.users, action: EnumAction.update },
        {
          resource: EnumResource.users,
          action: EnumAction.delete,
        },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ProtectedComponent
            requiredPermissions={[
              {
                resource: EnumResource.users,
                action: EnumAction.update,
              },
            ]}
          >
            <DropdownMenuItem onClick={() => open(MODULE, "edit", row)}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent
            requiredPermissions={[
              {
                resource: EnumResource.users,
                action: EnumAction.delete,
              },
            ]}
          >
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
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
