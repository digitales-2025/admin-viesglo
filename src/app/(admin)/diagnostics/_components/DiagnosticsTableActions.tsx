"use client";

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
import { DiagnosticEntity } from "../../medical-records/_types/medical-record.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

interface DiagnosticsTableActionsProps {
  row: DiagnosticEntity;
}

export default function DiagnosticsTableActions({ row }: DiagnosticsTableActionsProps) {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "diagnostics";

  const handleEdit = () => {
    open(MODULE, "edit", row);
  };

  const handleDelete = () => {
    open(MODULE, "delete", row);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.diagnostic, action: EnumAction.update },
        { resource: EnumResource.diagnostic, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.update }]}>
            <DropdownMenuItem onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.delete }]}>
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
