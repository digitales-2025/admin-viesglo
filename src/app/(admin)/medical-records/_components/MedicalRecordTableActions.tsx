"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Eye, FileText, MoreHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MedicalRecordResponse } from "../_types/medical-record.types";

interface MedicalRecordTableActionsProps {
  record: MedicalRecordResponse;
  router: AppRouterInstance;
}

export default function MedicalRecordTableActions({ record, router }: MedicalRecordTableActionsProps) {
  const handleViewDetails = () => {
    router.push(`/medical-records/${record.id}`);
  };

  const handleViewFiles = () => {
    router.push(`/medical-records/${record.id}/files`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleViewDetails} className="h-8 w-8 p-0">
        <Eye className="h-4 w-4" />
      </Button>

      {record.files && record.files.length > 0 && (
        <Button variant="ghost" size="sm" onClick={handleViewFiles} className="h-8 w-8 p-0">
          <FileText className="h-4 w-4" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onClick={handleViewDetails}>
            Ver detalles
            <DropdownMenuShortcut>
              <Eye className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {record.files && record.files.length > 0 && (
            <DropdownMenuItem className="cursor-pointer" onClick={handleViewFiles}>
              Ver archivos
              <DropdownMenuShortcut>
                <FileText className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
