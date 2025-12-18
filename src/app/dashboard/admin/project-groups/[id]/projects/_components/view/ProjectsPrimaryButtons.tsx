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
        permissions={[{ resource: EnumResource.projects, action: EnumAction.create }]}
        hideOnUnauthorized={true}
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
