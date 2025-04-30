"use client";

import { Plus } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

export default function CertificatesPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "certificates";

  return (
    <div className="flex gap-2">
      <ProtectedComponent requiredPermissions={[{ resource: EnumResource.trainings, action: EnumAction.create }]}>
        <Button className="space-x-1" onClick={() => open(MODULE, "create")}>
          <span>Agregar Certificado</span> <Plus size={18} />
        </Button>
      </ProtectedComponent>
    </div>
  );
}
