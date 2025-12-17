"use client";

import { Plus } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function ProjectsPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "projects";

  return (
    <div>
      <PermissionProtected
        permissions={[
          { resource: EnumResource.projects, action: EnumAction.update },
          { resource: EnumResource.projects, action: EnumAction.delete },
        ]}
        requireAll={false} // OR: necesita AL MENOS UNO de estos permisos
        hideOnUnauthorized={true} // Ocultar botón si no tiene permisos
      >
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE, "create");
          }}
        >
          <Plus size={18} />
          <span>Nuevo Proyecto</span>
        </Button>
      </PermissionProtected>
    </div>
  );
}
