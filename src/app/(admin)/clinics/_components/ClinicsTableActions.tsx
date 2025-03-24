import React from "react";
import { Mail, MoreHorizontal, RectangleEllipsis } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="cursor-pointer relative text-slate-400">
              <Mail className="size-5" strokeWidth={1.5} />
              <RectangleEllipsis
                className="size-4 absolute top-1/2 left-1/2 fill-white dark:fill-black stroke-slate-400"
                strokeWidth={1.5}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enviar credenciales de acceso</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
