"use client";

import { Plus } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

export default function QuotationPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "quotations";

  return (
    <div>
      <ProtectedComponent requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.create }]}>
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE, "create");
          }}
        >
          <span>Agregar Cotización</span> <Plus className="h-4 w-4" />
        </Button>
      </ProtectedComponent>
    </div>
  );
}
