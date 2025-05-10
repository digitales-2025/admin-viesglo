"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal } from "lucide-react";

import { MedicalRecordResponse } from "@/app/(admin)/medical-records/_types/medical-record.types";
import { useAuth } from "@/auth/presentation/providers/AuthProvider";
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
  const { user, hasRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        // Verificar si el usuario tiene rol de superadmin o admin
        const isSuperAdmin = await hasRole("superadmin");
        const isAdminUser = await hasRole("admin");
        setIsAdmin(isSuperAdmin || isAdminUser);
      }
    };

    checkAdminRole();
  }, [user, hasRole]);

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
          {isAdmin && (
            <DropdownMenuItem className="cursor-pointer" onClick={handleViewDetails}>
              Ver detalles
              <DropdownMenuShortcut>
                <Eye className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
