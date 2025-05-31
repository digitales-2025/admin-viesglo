"use client";

import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal } from "lucide-react";

import { MedicalRecordResponse } from "@/app/dashboard/admin/medical-records/_types/medical-record.types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface MedicalRecordTableActionsProps {
  record: MedicalRecordResponse;
}

export default function MedicalRecordTableActions({ record }: MedicalRecordTableActionsProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/medical-records/${record.id}/details`);
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
          <DropdownMenuItem className="cursor-pointer" onClick={handleViewDetails}>
            Ver detalles
            <DropdownMenuShortcut>
              <Eye className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
