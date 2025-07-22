import React from "react";
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
import { useToggleActiveClinic } from "../_hooks/useClinics";
import { ClinicResponse } from "../_types/clinics.types";

interface ClinicsTableActionsProps {
  row: ClinicResponse;
}

export default function ClinicsTableActions({ row }: ClinicsTableActionsProps) {
  const { open } = useDialogStore();
  const { mutate: toggleActiveClinic, isPending: isToggleActivePending } = useToggleActiveClinic();
  // Constante para módulo
  const MODULE = "clinics";

  const handleEdit = () => {
    open(MODULE, "edit", row);
  };

  const handleDelete = () => {
    open(MODULE, "delete", row);
  };

  const handleToggleActive = () => {
    toggleActiveClinic(row.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="bg-background" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleEdit}>
          Editar
          <DropdownMenuShortcut>
            <Edit className="size-4 mr-2" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {row.isActive ? (
          <DropdownMenuItem onClick={handleDelete} disabled={!row.isActive}>
            Eliminar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleToggleActive} disabled={isToggleActivePending}>
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
