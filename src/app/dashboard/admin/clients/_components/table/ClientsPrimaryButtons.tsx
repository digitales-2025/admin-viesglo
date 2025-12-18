"use client";

import { Plus } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function ClientsPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "clients";

  return (
    <div>
      <PermissionProtected
        permissions={[{ resource: EnumResource.clients, action: EnumAction.create }]}
        requireAll={false}
        hideOnUnauthorized={true}
      >
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE, "create");
          }}
        >
          <span>Agregar Cliente</span> <Plus size={18} />
        </Button>
      </PermissionProtected>
    </div>
  );
}
