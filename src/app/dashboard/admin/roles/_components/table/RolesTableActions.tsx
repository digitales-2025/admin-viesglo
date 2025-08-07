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
import { useToggleActiveRole } from "../../_hooks/use-roles";
import { RoleListItem } from "../../../settings/_types/roles.types";

interface RolesTableActionsProps {
  row: RoleListItem;
}

export function RolesTableActions({ row }: RolesTableActionsProps) {
  const { open } = useDialogStore();
  const { mutate: toggleActiveRole, isPending: isToggling } = useToggleActiveRole();
  const MODULE = "roles";

  const handleReactivateRole = () => {
    toggleActiveRole({ params: { path: { id: row.id } } });
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
          <DropdownMenuItem onClick={() => open(MODULE, "delete", row)} disabled={!row.isActive || isToggling}>
            Desactivar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleReactivateRole} disabled={row.isActive || isToggling}>
            Reactivar
            <DropdownMenuShortcut>
              <RotateCcw className="size-4 mr-2 text-primary" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
