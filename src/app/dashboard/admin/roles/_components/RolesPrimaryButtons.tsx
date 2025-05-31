"use client";

import { Plus } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { EnumAction, EnumResource } from "../_utils/groupedPermission";

export default function RolesPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "roles";

  return (
    <ProtectedComponent requiredPermissions={[{ resource: EnumResource.roles, action: EnumAction.create }]}>
      <div className="flex gap-2">
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE, "create");
          }}
        >
          <span>Agregar Rol</span> <Plus size={18} />
        </Button>
      </div>
    </ProtectedComponent>
  );
}
