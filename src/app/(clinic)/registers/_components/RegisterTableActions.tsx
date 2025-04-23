"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MedicalRecordResponse } from "../../../(admin)/medical-records/_types/medical-record.types";

interface RegisterTableActionsProps {
  record: MedicalRecordResponse;
  router: AppRouterInstance;
}

export default function RegisterTableActions({ record }: RegisterTableActionsProps) {
  const { open } = useDialogStore();

  const handleEdit = () => {
    open("registers", "edit", record);
  };

  const handleDelete = () => {
    open("registers", "delete", record);
  };

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
            Editar
            <DropdownMenuShortcut>
              <Edit className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleDelete}>
            Eliminar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
