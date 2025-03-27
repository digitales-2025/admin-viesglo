"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { QuotationResponse } from "../_types/quotation.types";

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
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
            <Edit className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive"
            onClick={handleDelete}
            disabled={quotation.isConcrete}
          >
            <Trash className="size-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
