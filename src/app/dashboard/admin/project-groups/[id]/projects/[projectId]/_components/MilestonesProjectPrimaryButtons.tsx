import { PlusCircle } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_MILESTONES_PROJECT } from "./milestones-project-overlays/MilestonesProjectOverlays";

export default function MilestonesProjectPrimaryButtons() {
  const { open } = useDialogStore();

  return (
    <PermissionProtected
      permissions={[
        { resource: EnumResource.milestones, action: EnumAction.update },
        { resource: EnumResource.milestones, action: EnumAction.delete },
      ]}
      requireAll={false} // OR: necesita AL MENOS UNO de estos permisos
      hideOnUnauthorized={true} // Ocultar completamente si no tiene permisos
    >
      <div>
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE_MILESTONES_PROJECT, "create");
          }}
        >
          <PlusCircle />
          Agregar hito
        </Button>
      </div>
    </PermissionProtected>
  );
}
