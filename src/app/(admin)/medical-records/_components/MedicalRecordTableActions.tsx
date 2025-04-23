"use client";

import { useEffect, useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Eye, MoreHorizontal } from "lucide-react";

import { useAuth } from "@/auth/presentation/providers/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MedicalRecordResponse } from "../_types/medical-record.types";
import { ClinicResponse } from "../../clinics/_types/clinics.types";

interface MedicalRecordTableActionsProps {
  record: MedicalRecordResponse;
  router: AppRouterInstance;
  _clinicsList?: ClinicResponse[];
}

export default function MedicalRecordTableActions({
  record,
  router,
  _clinicsList = [],
}: MedicalRecordTableActionsProps) {
  const { user, hasRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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
