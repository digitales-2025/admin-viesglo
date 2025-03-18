import React from "react";
import { Mail, MoreHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ClinicResponse } from "../_types/clinics.types";

interface ClinicsTableActionsProps {
  row: ClinicResponse;
}

export default function ClinicsTableActions({ row }: ClinicsTableActionsProps) {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "clinics";

  const handleEdit = () => {
    open(MODULE, "edit", row);
  };

  const handleDelete = () => {
    open(MODULE, "delete", row);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="bg-background" size="icon">
        <Mail className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
