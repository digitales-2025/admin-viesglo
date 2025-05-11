import { PlusCircle } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_PROJECT_OBJECTIVES } from "./ProjectObjectivesDialogs";

export default function ProjectObjectivesPrimaryButtons() {
  const { open } = useDialogStore();

  return (
    <div>
      <ProtectedComponent requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.create }]}>
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE_PROJECT_OBJECTIVES, "create");
          }}
        >
          <PlusCircle />
          Agregar objetivo
        </Button>
      </ProtectedComponent>
    </div>
  );
}
