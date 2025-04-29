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
import { QuotationResponse } from "../_types/quotation.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

interface QuotationTableActionsProps {
  quotation: QuotationResponse;
}

export default function QuotationTableActions({ quotation }: QuotationTableActionsProps) {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "quotations";

  const handleEdit = () => {
    open(MODULE, "edit", quotation);
  };

  const handleDelete = () => {
    open(MODULE, "delete", quotation);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.quotations, action: EnumAction.update },
        { resource: EnumResource.quotations, action: EnumAction.delete },
      ]}
    >
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-background" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <ProtectedComponent
              requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.update }]}
            >
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                Editar
                <DropdownMenuShortcut>
                  <Edit className="size-4 mr-2" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </ProtectedComponent>
            <ProtectedComponent
              requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.delete }]}
            >
              <DropdownMenuItem className="cursor-pointer" onClick={handleDelete} disabled={quotation.isConcrete}>
                Eliminar
                <DropdownMenuShortcut>
                  <Trash className="size-4 mr-2" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </ProtectedComponent>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ProtectedComponent>
  );
}
