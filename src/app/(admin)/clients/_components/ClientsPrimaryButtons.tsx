"use client";

import { Plus } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

export default function ClientsPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "clients";

  return (
    <div>
      <ProtectedComponent requiredPermissions={[{ resource: EnumResource.clients, action: EnumAction.create }]}>
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE, "create");
          }}
        >
          <span>Agregar Cliente</span> <Plus size={18} />
        </Button>
      </ProtectedComponent>
    </div>
  );
}
