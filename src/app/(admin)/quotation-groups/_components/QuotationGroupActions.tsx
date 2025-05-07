import React from "react";
import { Edit, MoreHorizontal, Redo2, Trash } from "lucide-react";

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
import { QuotationGroupResponse } from "../_types/quotation-groups.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";
import { MODULE_QUOTATION_GROUP } from "./QuotationGroupDialogs";

interface QuotationGroupActionsProps {
  row: QuotationGroupResponse;
}

export default function QuotationGroupActions({ row }: QuotationGroupActionsProps) {
  const { open } = useDialogStore();

  const handleEdit = () => {
    open(MODULE_QUOTATION_GROUP, "edit", row);
  };

  const handleDelete = () => {
    open(MODULE_QUOTATION_GROUP, "delete", row);
  };

  const handleTogleActive = () => {
    open(MODULE_QUOTATION_GROUP, "togleActive", row);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.quotations, action: EnumAction.update },
        { resource: EnumResource.quotations, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.update }]}>
            <DropdownMenuItem onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.delete }]}>
            <DropdownMenuItem onClick={handleDelete} disabled={!row.isActive}>
              Eliminar
              <DropdownMenuShortcut>
                <Trash className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          {!row.isActive && (
            <DropdownMenuItem onClick={handleTogleActive}>
              Activar
              <DropdownMenuShortcut>
                <Redo2 className="size-4 mr-2 scale-x-[-1]" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
