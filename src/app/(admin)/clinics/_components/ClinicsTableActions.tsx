import React from "react";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

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
import { ClinicResponse } from "../_types/clinics.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

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
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.clinics, action: EnumAction.update },
        { resource: EnumResource.clinics, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.clinics, action: EnumAction.update }]}>
            <DropdownMenuItem onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.clinics, action: EnumAction.delete }]}>
            <DropdownMenuItem onClick={handleDelete}>
              Eliminar
              <DropdownMenuShortcut>
                <Trash className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
